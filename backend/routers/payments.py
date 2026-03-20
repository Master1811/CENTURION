import hmac
import hashlib
import json
import os
from datetime import datetime, timezone, timedelta
from fastapi import APIRouter, Depends, Request, HTTPException, BackgroundTasks
from pydantic import BaseModel
from typing import Literal
import razorpay
from services.auth import require_auth
from services.supabase import supabase_service

router = APIRouter(prefix="/payments", tags=["payments"])

RAZORPAY_KEY_ID = os.getenv("RAZORPAY_KEY_ID")
RAZORPAY_KEY_SECRET = os.getenv("RAZORPAY_KEY_SECRET")
RAZORPAY_WEBHOOK_SECRET = os.getenv("RAZORPAY_WEBHOOK_SECRET")

# ═══════════════════════════════════════════════════════════════════════════
# PRICING — SOURCE OF TRUTH (March 2026)
# ═══════════════════════════════════════════════════════════════════════════
# Starter:  ₹499/mo   (paise: 49900)
# Founder:  ₹3,999/yr (paise: 399900)
# Trial:    ₹99/7d    (paise: 9900) → then ₹499/mo
# ═══════════════════════════════════════════════════════════════════════════

PLAN_PRICING = {
    "starter": {
        "amount": 49900,
        "currency": "INR",
        "description": "Centurion Starter Plan — Monthly",
        "billing": "monthly",
    },
    "founder": {
        "amount": 399900,
        "currency": "INR",
        "description": "Centurion Founder Plan — Annual",
        "billing": "annual",
    },
    "trial": {
        "amount": 9900,
        "currency": "INR",
        "description": "Centurion 7-Day Trial",
        "billing": "trial_7d",
    },
}


class CreateOrderRequest(BaseModel):
    plan: Literal["starter", "founder", "trial"] = "starter"


@router.post("/razorpay/create-order")
async def create_razorpay_order(
    body: CreateOrderRequest,
    user=Depends(require_auth)
):
    if body.plan not in PLAN_PRICING:
        raise HTTPException(
            status_code=400,
            detail="Invalid plan"
        )
    if not RAZORPAY_KEY_ID or not RAZORPAY_KEY_SECRET:
        raise HTTPException(
            status_code=503,
            detail="Payment service not configured"
        )

    plan = PLAN_PRICING[body.plan]
    client = razorpay.Client(
        auth=(RAZORPAY_KEY_ID, RAZORPAY_KEY_SECRET)
    )

    try:
        order = client.order.create({
            "amount": plan["amount"],
            "currency": plan["currency"],
            "notes": {
                "user_id": user["id"],
                "plan": body.plan,
            }
        })
    except Exception as e:
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
    body = await request.body()
    if len(body) > 100_000:
        raise HTTPException(status_code=413, detail="Payload too large")

    content_type = request.headers.get("content-type", "")
    if "application/json" not in content_type:
        raise HTTPException(status_code=415, detail="Unsupported media type")

    signature = request.headers.get("x-razorpay-signature")
    if not signature:
        raise HTTPException(status_code=400, detail="Missing webhook signature")

    if not RAZORPAY_WEBHOOK_SECRET:
        raise HTTPException(
            status_code=503,
            detail="Webhook secret not configured"
        )

    expected = hmac.new(
        RAZORPAY_WEBHOOK_SECRET.encode(),
        body,
        hashlib.sha256
    ).hexdigest()

    if not hmac.compare_digest(expected, signature):
        raise HTTPException(
            status_code=401,
            detail="Invalid webhook signature"
        )

    event = json.loads(body)

    if event.get("event") == "payment.captured":
        payment = event["payload"]["payment"]["entity"]
        user_id = payment.get("notes", {}).get("user_id")
        plan = payment.get("notes", {}).get("plan", "starter")
        payment_id = payment.get("id")

        if not user_id:
            return {"status": "ok"}

        # Idempotency check
        existing = await supabase_service.get_subscription_by_ref(payment_id)
        if existing:
            return {"status": "ok"}

        # Calculate expiry and status based on plan
        if plan == "trial":
            expires_days = 7
            activated_plan = "starter"  # Trial unlocks starter features
            status = "trialing"
        elif plan == "founder":
            expires_days = 365
            activated_plan = "founder"
            status = "active"
        else:  # starter (monthly)
            expires_days = 30
            activated_plan = "starter"
            status = "active"

        await supabase_service.create_subscription({
            "user_id": user_id,
            "plan": activated_plan,
            "status": status,
            "payment_ref": payment_id,
            "billing": plan,
            "expires_days": expires_days,
        })

    if event.get("event") in [
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
            if user_id:
                profile = await supabase_service.get_profile_by_id(user_id)
                current_mrr = (profile or {}).get("current_mrr") or 0
                previous_mrr = current_mrr * 1.15

                from services.habit_layers import fire_anomaly_alert

                background_tasks.add_task(
                    fire_anomaly_alert,
                    user_id=user_id,
                    new_mrr=current_mrr,
                    previous_mrr=previous_mrr,
                )
        except Exception as e:
            print(f"[WEBHOOK] Anomaly task error: {e}")

    return {"status": "ok"}
