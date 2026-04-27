"""
Thin wrappers around Supabase, Twilio, and fraud-check APIs.
All functions are no-ops when env vars are absent so the funnel
can be demoed locally without credentials.
"""
import os
import requests
from typing import Optional


def get_supabase_client():
    try:
        from supabase import create_client
        url = os.environ.get("NEXT_PUBLIC_SUPABASE_URL") or os.environ.get("SUPABASE_URL", "")
        key = os.environ.get("SUPABASE_SERVICE_ROLE_KEY", "")
        if url and key:
            return create_client(url, key)
    except ImportError:
        pass
    return None


def save_lead(lead_data: dict) -> Optional[str]:
    client = get_supabase_client()
    if not client:
        return None
    try:
        res = client.table("leads").insert(lead_data).execute()
        return res.data[0]["id"] if res.data else None
    except Exception as e:
        print(f"[supabase] save_lead error: {e}")
        return None


def enroll_nurture(email: str, source: str, procedure: Optional[str] = None) -> bool:
    client = get_supabase_client()
    if not client:
        return False
    try:
        client.table("nurture_contacts").upsert(
            {"email": email, "source_stage": source, "procedure_interest": procedure},
            on_conflict="email",
        ).execute()
        return True
    except Exception as e:
        print(f"[supabase] enroll_nurture error: {e}")
        return False


def add_waitlist(email: str, location: str) -> bool:
    client = get_supabase_client()
    if not client:
        return False
    try:
        client.table("nurture_contacts").upsert(
            {"email": email, "source_stage": "waitlist_location", "procedure_interest": location},
            on_conflict="email",
        ).execute()
        return True
    except Exception as e:
        print(f"[supabase] add_waitlist error: {e}")
        return False


def _twilio_client():
    try:
        from twilio.rest import Client
        sid   = os.environ.get("TWILIO_ACCOUNT_SID", "")
        token = os.environ.get("TWILIO_AUTH_TOKEN", "")
        if sid and token:
            return Client(sid, token)
    except ImportError:
        pass
    return None


def send_otp(phone: str) -> bool:
    client = _twilio_client()
    if not client:
        print(f"[twilio-stub] OTP would be sent to {phone}")
        return True
    try:
        service_sid = os.environ["TWILIO_VERIFY_SERVICE_SID"]
        client.verify.v2.services(service_sid).verifications.create(to=phone, channel="sms")
        return True
    except Exception as e:
        print(f"[twilio] send_otp error: {e}")
        return False


def check_otp(phone: str, code: str) -> bool:
    client = _twilio_client()
    if not client:
        return code == "123456"
    try:
        service_sid = os.environ["TWILIO_VERIFY_SERVICE_SID"]
        check = client.verify.v2.services(service_sid).verification_checks.create(to=phone, code=code)
        return check.status == "approved"
    except Exception as e:
        print(f"[twilio] check_otp error: {e}")
        return False


def send_confirmation_sms(phone: str, first_name: str, procedure: str) -> bool:
    client = _twilio_client()
    agency = os.environ.get("NEXT_PUBLIC_AGENCY_NAME", "[AGENCY_NAME_PLACEHOLDER]")
    body = (
        f"Hi {first_name}, this is {agency}. We've matched you with a specialist "
        f"for your {procedure.replace('_', ' ')} consultation.\n\n"
        "Reply YES to confirm you'd like them to call within 24 hours, or STOP to opt out. "
        "No charge to you — ever."
    )
    if not client:
        print(f"[twilio-stub] Confirmation SMS to {phone}: {body}")
        return True
    try:
        client.messages.create(to=phone, from_=os.environ["TWILIO_FROM_NUMBER"], body=body)
        return True
    except Exception as e:
        print(f"[twilio] send_confirmation_sms error: {e}")
        return False


def verify_recaptcha(token: str) -> float:
    secret = os.environ.get("RECAPTCHA_SECRET_KEY", "")
    if not secret or not token:
        return 1.0
    try:
        r = requests.post(
            "https://www.google.com/recaptcha/api/siteverify",
            data={"secret": secret, "response": token},
            timeout=5,
        )
        return r.json().get("score", 0.0)
    except Exception:
        return 1.0


def verify_email_neverbounce(email: str) -> str:
    key = os.environ.get("NEVERBOUNCE_API_KEY", "")
    if not key:
        return "unknown"
    try:
        r = requests.get(
            "https://api.neverbounce.com/v4/single/check",
            params={"key": key, "email": email},
            timeout=5,
        )
        return r.json().get("result", "unknown")
    except Exception:
        return "unknown"


def lookup_phone_twilio(phone: str) -> dict:
    client = _twilio_client()
    if not client:
        return {}
    try:
        result = client.lookups.v2.phone_numbers(phone).fetch(fields=["line_type_intelligence"])
        lti = getattr(result, "line_type_intelligence", None) or {}
        return lti if isinstance(lti, dict) else {}
    except Exception:
        return {}
