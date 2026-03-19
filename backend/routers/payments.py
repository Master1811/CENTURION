import hmac
import hashlib
import json
import os
from fastapi import APIRouter, Depends, Request, HTTPException
from pydantic import BaseModel
from typing import Literal
import razorpay
from services.auth import require_auth
from services.supabase import supabase_service

router = APIRouter(prefix="/payments", tags=["payments"])

RAZORPAY_KEY_ID = os.getenv("RAZORPAY_KEY_ID")
RAZORPAY_KEY_SECRET = os.getenv("RAZORPAY_KEY_SECRET")
RAZORPAY_WEBHOOK_SECRET = os.getenv("RAZORPAY_WEBHOOK_SECRET")

PLAN_PRICING = {
    "founder": {
        "amount": 1499900,
        "currency": "INR",
        "description": "Centurion Founder Plan — Annual",
    }
}


class CreateOrderRequest(BaseModel):
    plan: Literal["founder"] = "founder"


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
async def razorpay_webhook(request: Request):
    body = await request.body()
    signature = request.headers.get(
        "x-razorpay-signature", ""
    )

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
        plan = payment.get("notes", {}).get("plan", "founder")
        payment_id = payment.get("id")

        if not user_id:
            return {"status": "ok"}

        existing = await supabase_service\
            .get_subscription_by_ref(payment_id)
        if existing:
            return {"status": "ok"}

        await supabase_service.create_subscription({
            "user_id": user_id,
            "plan": plan,
            "status": "active",
            "payment_ref": payment_id,
        })

    return {"status": "ok"}

