import os
import resend
from fastapi import APIRouter, HTTPException, Depends
from sqlalchemy.orm import Session
from app.database import get_db
from app.models import Client, Receipt, User
from app.routers.auth import get_current_user
from app.schemas.reminder import ReminderRequest

router = APIRouter(prefix="/reminders", tags=["reminders"])


@router.post("/send")
def send_reminder(
    body: ReminderRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    api_key = os.getenv("RESEND_API_KEY")
    if not api_key:
        raise HTTPException(status_code=500, detail="RESEND_API_KEY no configurada")

    resend.api_key = api_key

    client = db.query(Client).filter(
        Client.id == body.client_id,
        Client.user_id == current_user.id,
        Client.is_deleted == False,
    ).first()
    if not client:
        raise HTTPException(status_code=404, detail="Cliente no encontrado")

    receipt = db.query(Receipt).filter(
        Receipt.id == body.invoice_id,
        Receipt.user_id == current_user.id,
    ).first()
    if not receipt:
        raise HTTPException(status_code=404, detail="Factura no encontrada")

    receipt_number = receipt.id[:8].upper()
    amount = float(receipt.amount)
    due_date = receipt.date_emitted.strftime("%d/%m/%Y") if receipt.date_emitted else "No especificada"

    html_body = f"""
    <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: 0 auto; background: #ffffff;">
      <div style="background: linear-gradient(135deg, #7c3aed 0%, #a855f7 100%); padding: 32px; border-radius: 12px 12px 0 0;">
        <h1 style="color: #ffffff; margin: 0; font-size: 24px; font-weight: 700;">
          Recordatorio de pago
        </h1>
        <p style="color: #e9d5ff; margin: 8px 0 0; font-size: 14px;">
          Factura #{receipt_number}
        </p>
      </div>

      <div style="padding: 32px; border: 1px solid #e5e7eb; border-top: none; border-radius: 0 0 12px 12px;">
        <p style="color: #374151; font-size: 16px; line-height: 1.6; margin: 0 0 24px;">
          Hola <strong>{client.name}</strong>,
        </p>
        <p style="color: #6b7280; font-size: 14px; line-height: 1.6; margin: 0 0 24px;">
          Te escribimos para recordarte que tenés un pago pendiente. A continuación, los detalles:
        </p>

        <div style="background: #f9fafb; border-radius: 8px; padding: 20px; margin: 0 0 24px;">
          <table style="width: 100%; border-collapse: collapse;">
            <tr>
              <td style="padding: 8px 0; color: #6b7280; font-size: 13px;">Concepto</td>
              <td style="padding: 8px 0; color: #111827; font-size: 13px; font-weight: 600; text-align: right;">{receipt.concept}</td>
            </tr>
            <tr>
              <td style="padding: 8px 0; color: #6b7280; font-size: 13px;">Nro. de factura</td>
              <td style="padding: 8px 0; color: #111827; font-size: 13px; font-weight: 600; text-align: right;">#{receipt_number}</td>
            </tr>
            <tr>
              <td style="padding: 8px 0; color: #6b7280; font-size: 13px;">Fecha de emisión</td>
              <td style="padding: 8px 0; color: #111827; font-size: 13px; font-weight: 600; text-align: right;">{due_date}</td>
            </tr>
            <tr style="border-top: 1px solid #e5e7eb;">
              <td style="padding: 12px 0 8px; color: #6b7280; font-size: 14px; font-weight: 600;">Monto pendiente</td>
              <td style="padding: 12px 0 8px; color: #7c3aed; font-size: 20px; font-weight: 700; text-align: right;">${amount:,.2f}</td>
            </tr>
          </table>
        </div>

        <p style="color: #6b7280; font-size: 13px; line-height: 1.6; margin: 0 0 8px;">
          Si ya realizaste el pago, por favor ignorá este mensaje.
        </p>
        <p style="color: #9ca3af; font-size: 12px; margin: 24px 0 0; padding-top: 16px; border-top: 1px solid #f3f4f6;">
          Enviado desde Orgalancer
        </p>
      </div>
    </div>
    """

    try:
        resend.Emails.send({
            "from": "Orgalancer <noreply@mail.orgalancer.app>",
            "to": [client.email],
            "subject": f"Recordatorio de pago - Factura #{receipt_number}",
            "html": html_body,
        })

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error al enviar el email: {str(e)}")

    return {"success": True}
