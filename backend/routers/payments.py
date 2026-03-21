import hmac
import hashlib
import json
import os
import logging
from datetime import datetime, timezone, timedelta
from fastapi import APIRouter, Depends, Request, HTTPException, BackgroundTasks
from pydantic import BaseModel
from typing import Literal
from services.auth import require_auth
from services.supabase import supabase_service
from services.logging_service import payment_logger, log_payment_event

router = APIRouter(prefix="/payments", tags=["payments"])

logger = logging.getLogger("100cr_engine.payments")


def get_razorpay_client():
    """
    Lazy Razorpay client initialization.
    Returns None if keys are not configured — server never crashes without them.
    Add RAZORPAY_KEY_ID + RAZORPAY_KEY_SECRET env vars to enable payments.
    """
    import razorpay
    key_id = os.getenv("RAZORPAY_KEY_ID")
    key_secret = os.getenv("RAZORPAY_KEY_SECRET")
    if not key_id or not key_secret:
        logger.warning("Payments not configured: RAZORPAY_KEY_ID or RAZORPAY_KEY_SECRET missing")
        return None
    return razorpay.Client(auth=(key_id, key_secret))

# ═══════════════════════════════════════════════════════════════════════════
# PRICING — SOURCE OF TRUTH (March 2026)
# ═══════════════════════════════════════════════════════════════════════════
# Founder:  ₹3,999/yr (paise: 399900) — ONLY paid tier
# ═══════════════════════════════════════════════════════════════════════════

PLAN_PRICING = {
    "founder": {
        "amount": 399900,
        "currency": "INR",
        "description": "Centurion Founder Plan — Annual",
        "billing": "annual",
        "expires_days": 365,
    },
}


class CreateOrderRequest(BaseModel):
    plan: Literal["founder"] = "founder"


@router.post("/razorpay/create-order")
async def create_razorpay_order(
    body: CreateOrderRequest,
    user=Depends(require_auth)
):
    if body.plan not in PLAN_PRICING:
        raise HTTPException(status_code=400, detail="Invalid plan. Only 'founder' is accepted.")

    client = get_razorpay_client()
    if client is None:
        raise HTTPException(
            status_code=503,
            detail="Payments not configured. Add Razorpay keys to enable checkout."
        )

    plan = PLAN_PRICING[body.plan]

    try:
        order = client.order.create({
            "amount": plan["amount"],
            "currency": plan["currency"],
            "notes": {
                "user_id": user["id"],
                "plan": body.plan,
            }
        })
        
        log_payment_event(
            "order_created",
            user_id=user["id"],
            plan=body.plan,
            amount=plan["amount"],
            payment_id=order["id"],
            success=True
        )
        
    except Exception as e:
        log_payment_event(
            "order_creation_failed",
            user_id=user["id"],
            plan=body.plan,
            success=False,
            error=str(e)
        )
        raise HTTPException(
            status_code=502,
            detail=f"Razorpay error: {str(e)}"
        )

    return {
        "orderId": order["id"],
        "amount": order["amount"],
        "currency": order["currency"],
        "keyId": RAZORPAY_KEY_ID,
    }


@router.post("/razorpay/webhook")
async def razorpay_webhook(request: Request, background_tasks: BackgroundTasks):
    """
    Razorpay webhook handler for payment events.
    
    Handles:
    - payment.captured: Create/update subscription
    - payment.failed: Log failure
    - refund.created: Handle refunds
    - subscription.cancelled/halted: Fire anomaly alerts
    """
    body = await request.body()
    if len(body) > 100_000:
        raise HTTPException(status_code=413, detail="Payload too large")

    content_type = request.headers.get("content-type", "")
    if "application/json" not in content_type:
        raise HTTPException(status_code=415, detail="Unsupported media type")

    signature = request.headers.get("x-razorpay-signature")
    if not signature:
        payment_logger.warning("Webhook received without signature")
        raise HTTPException(status_code=400, detail="Missing webhook signature")

    webhook_secret = os.getenv("RAZORPAY_WEBHOOK_SECRET")
    if not webhook_secret:
        payment_logger.warning(
            "RAZORPAY_WEBHOOK_SECRET not set — skipping signature verification (dev mode)"
        )
        # In dev/staging allow unsigned webhooks; never allow in prod
        if os.getenv("PAYMENTS_MODE", "disabled") == "live":
            raise HTTPException(
                status_code=503,
                detail="Webhook secret not configured for live mode"
            )

    # Verify signature using constant-time comparison (only when secret is set)
    if webhook_secret:
        expected = hmac.new(
            webhook_secret.encode(),
            body,
            hashlib.sha256
        ).hexdigest()

        if not hmac.compare_digest(expected, signature):
            payment_logger.warning("Invalid webhook signature received")
            raise HTTPException(
                status_code=401,
                detail="Invalid webhook signature"
            )

    event = json.loads(body)
    event_type = event.get("event", "")
    
    payment_logger.info(
        f"Webhook received: {event_type}",
        event_type=event_type,
        webhook_id=event.get("id")
    )

    # Handle payment.captured - Create subscription
    if event_type == "payment.captured":
        payment = event["payload"]["payment"]["entity"]
        user_id = payment.get("notes", {}).get("user_id")
        plan_key = payment.get("notes", {}).get("plan", "founder")
        payment_id = payment.get("id")
        amount = payment.get("amount", 0)

        if not user_id:
            payment_logger.warning("Payment captured without user_id in notes")
            return {"status": "ok"}

        # Idempotency check
        existing = await supabase_service.get_subscription_by_ref(payment_id)
        if existing:
            payment_logger.info(f"Duplicate webhook for payment {payment_id}")
            return {"status": "ok"}

        # Get plan configuration
        plan_config = PLAN_PRICING.get(plan_key, PLAN_PRICING["founder"])
        
        # Calculate subscription details based on plan
        now = datetime.now(timezone.utc)
        
        # Annual founder plan (only paid tier)
        activated_plan = "founder"
        status = "active"
        expires_at = now + timedelta(days=365)
        billing_cycle = "annual"

        # Create subscription record
        subscription_data = {
            "user_id": user_id,
            "plan": activated_plan,
            "status": status,
            "payment_ref": payment_id,
            "billing_cycle": billing_cycle,
            "amount_paid": amount,
            "currency": "INR",
            "expires_at": expires_at.isoformat(),
            "created_at": now.isoformat(),
        }
        
        await supabase_service.create_subscription(subscription_data)
        
        log_payment_event(
            "subscription_created",
            user_id=user_id,
            plan=activated_plan,
            amount=amount,
            payment_id=payment_id,
            success=True,
            billing_cycle=billing_cycle,
            expires_at=expires_at.isoformat()
        )
        
        logger.info(f"Subscription created for user {user_id}: {activated_plan} ({billing_cycle})")

    # Handle failure and cancellation events
    if event_type in [
        "payment.failed",
        "refund.created",
        "subscription.cancelled",
        "subscription.halted",
    ]:
        try:
            payment = (
                event.get("payload", {})
                .get("payment", {})
                .get("entity", {})
            )
            user_id = payment.get("notes", {}).get("user_id")
            
            log_payment_event(
                event_type.replace(".", "_"),
                user_id=user_id,
                payment_id=payment.get("id"),
                success=False,
                reason=event_type
            )
            
            # Fire anomaly alert for cancellations/failures
            if user_id and event_type in ["subscription.cancelled", "subscription.halted"]:
                profile = await supabase_service.get_profile_by_id(user_id)
                current_mrr = (profile or {}).get("current_mrr") or 0
                previous_mrr = current_mrr * 1.15  # Assume 15% drop for alert

                from services.habit_layers import fire_anomaly_alert

                background_tasks.add_task(
                    fire_anomaly_alert,
                    user_id=user_id,
                    new_mrr=current_mrr,
                    previous_mrr=previous_mrr,
                )
                
                logger.info(f"Anomaly alert triggered for user {user_id} due to {event_type}")
                
        except Exception as e:
            payment_logger.error(f"Error processing {event_type} webhook", error=e)

    return {"status": "ok"}
