from pydantic import BaseModel, EmailStr


class ClientCreate(BaseModel):
    name: str
    email: EmailStr
    client_type: str
    phone_number: str = ""
    address: str = ""
    website: str = ""
    extra_info: str = ""


class ClientUpdate(BaseModel):
    name: str
    email: EmailStr
    client_type: str
    phone_number: str = ""
    address: str = ""
    website: str = ""
    extra_info: str = ""


class ClientResponse(ClientCreate):
    id: str

    class Config:
        from_attributes = True