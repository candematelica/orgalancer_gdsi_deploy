from pydantic import BaseModel

class ReminderRequest(BaseModel):
    client_id: str
    invoice_id: str
