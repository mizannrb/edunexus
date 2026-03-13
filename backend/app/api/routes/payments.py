import uuid
import httpx
from fastapi import APIRouter, Depends, HTTPException, Request
from fastapi.responses import RedirectResponse
from sqlalchemy.orm import Session
from app.db.database import get_db
from app.core.security import get_current_user
from app.core.config import settings
from app.models.user import User
from app.models.course import Course
from app.models.payment import Payment, PaymentStatus
from app.models.enrollment import Enrollment

router = APIRouter()

SSLCOMMERZ_INIT_URL = "https://sandbox.sslcommerz.com/gwprocess/v4/api.php"
FRONTEND_URL = "https://edunexus-chi.vercel.app"

@router.post("/payments/initiate/{course_id}")
async def initiate_payment(
    course_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    course = db.query(Course).filter(Course.id == course_id).first()
    if not course:
        raise HTTPException(status_code=404, detail="Course not found")
    if course.is_free:
        raise HTTPException(status_code=400, detail="This is a free course")
    existing = db.query(Enrollment).filter(
        Enrollment.user_id == current_user.id,
        Enrollment.course_id == course_id
    ).first()
    if existing:
        raise HTTPException(status_code=400, detail="Already enrolled")

    tran_id = str(uuid.uuid4()).replace("-", "")[:20].upper()
    payment = Payment(
        user_id=current_user.id,
        course_id=course_id,
        amount=course.price,
        transaction_id=tran_id,
        status=PaymentStatus.PENDING
    )
    db.add(payment)
    db.commit()
    db.refresh(payment)

    payload = {
        "store_id": settings.SSLCOMMERZ_STORE_ID,
        "store_passwd": settings.SSLCOMMERZ_STORE_PASSWORD,
        "total_amount": str(course.price),
        "currency": "BDT",
        "tran_id": tran_id,
        "success_url": f"{settings.BACKEND_URL}/api/v1/payments/success",
        "fail_url": f"{settings.BACKEND_URL}/api/v1/payments/fail",
        "cancel_url": f"{settings.BACKEND_URL}/api/v1/payments/cancel",
        "cus_name": current_user.full_name or "Customer",
        "cus_email": current_user.email,
        "cus_phone": "01700000000",
        "cus_add1": "Bangladesh",
        "cus_city": "Dhaka",
        "cus_country": "Bangladesh",
        "shipping_method": "NO",
        "product_name": course.title,
        "product_category": "Education",
        "product_profile": "non-physical-goods",
        "num_of_item": "1",
        "product_amount": str(course.price),
    }

    async with httpx.AsyncClient() as client:
        response = await client.post(SSLCOMMERZ_INIT_URL, data=payload)
        result = response.json()

    if result.get("status") != "SUCCESS":
        raise HTTPException(status_code=400, detail="Payment initiation failed")

    payment.ssl_session_key = result.get("sessionkey")
    db.commit()

    return {
        "payment_url": result.get("GatewayPageURL"),
        "transaction_id": tran_id,
        "amount": course.price,
        "course_title": course.title,
    }


@router.post("/payments/success")
async def payment_success(request: Request, db: Session = Depends(get_db)):
    form_data = await request.form()
    tran_id = form_data.get("tran_id")
    status = form_data.get("status")
    payment = db.query(Payment).filter(Payment.transaction_id == tran_id).first()
    if not payment:
        return RedirectResponse(f"{FRONTEND_URL}/payment/fail")
    if status in ["VALID", "VALIDATED"]:
        payment.status = PaymentStatus.SUCCESS
        payment.payment_method = form_data.get("card_type", "")
        db.commit()
        existing = db.query(Enrollment).filter(
            Enrollment.user_id == payment.user_id,
            Enrollment.course_id == payment.course_id
        ).first()
        if not existing:
            enrollment = Enrollment(
                user_id=payment.user_id,
                course_id=payment.course_id
            )
            db.add(enrollment)
            db.commit()
        return RedirectResponse(f"{FRONTEND_URL}/payment/success?tran_id={tran_id}")
    else:
        payment.status = PaymentStatus.FAILED
        db.commit()
        return RedirectResponse(f"{FRONTEND_URL}/payment/fail")


@router.post("/payments/fail")
async def payment_fail(request: Request, db: Session = Depends(get_db)):
    form_data = await request.form()
    tran_id = form_data.get("tran_id")
    payment = db.query(Payment).filter(Payment.transaction_id == tran_id).first()
    if payment:
        payment.status = PaymentStatus.FAILED
        db.commit()
    return RedirectResponse(f"{FRONTEND_URL}/payment/fail")


@router.post("/payments/cancel")
async def payment_cancel(request: Request, db: Session = Depends(get_db)):
    form_data = await request.form()
    tran_id = form_data.get("tran_id")
    payment = db.query(Payment).filter(Payment.transaction_id == tran_id).first()
    if payment:
        payment.status = PaymentStatus.CANCELLED
        db.commit()
    return RedirectResponse(f"{FRONTEND_URL}/payment/cancel")


@router.get("/payments/my-payments")
def my_payments(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    payments = db.query(Payment).filter(
        Payment.user_id == current_user.id
    ).order_by(Payment.created_at.desc()).all()
    return [
        {
            "id": p.id,
            "course_id": p.course_id,
            "amount": p.amount,
            "status": p.status,
            "transaction_id": p.transaction_id,
            "payment_method": p.payment_method,
            "created_at": str(p.created_at),
        }
        for p in payments
    ]


@router.get("/payments/admin-all")
def admin_all_payments(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    if not current_user.is_admin:
        raise HTTPException(status_code=403, detail="Admin only")
    payments = db.query(Payment).order_by(Payment.created_at.desc()).all()
    return [
        {
            "id": p.id,
            "user_id": p.user_id,
            "course_id": p.course_id,
            "amount": p.amount,
            "status": p.status,
            "transaction_id": p.transaction_id,
            "payment_method": p.payment_method,
            "created_at": str(p.created_at),
        }
        for p in payments
    ]