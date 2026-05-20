from fastapi import APIRouter, HTTPException, Depends
from sqlalchemy.orm import Session
from app.database import get_db
from app.models import User, Client
from app.schemas import ClientCreate, ClientUpdate, ClientResponse
from app.routers.auth import get_current_user

router = APIRouter(prefix="/clients", tags=["clients"])

@router.post("", response_model=ClientResponse, status_code=201)
def create_client(
    client: ClientCreate,
    db: Session = Depends(get_db),
    current_user: str = Depends(get_current_user)
):
    if db.query(Client).filter(Client.email == client.email, Client.user_id == current_user.id).first():
        raise HTTPException(status_code=400, detail="Ya existe un cliente con ese email")

    new = Client(**client.model_dump(), user_id=current_user.id)
    db.add(new)
    db.commit()
    db.refresh(new)
    return new


@router.get("", response_model=list[ClientResponse])
def display_clients(
    db: Session = Depends(get_db),
    current_user: str = Depends(get_current_user)
):
    return db.query(Client).filter(Client.user_id == current_user.id).all()


@router.get("/{client_id}", response_model=ClientResponse)
def get_client(
    client_id: str,
    db: Session = Depends(get_db),
    current_user: str = Depends(get_current_user)
):
    client = db.query(Client).filter(
        Client.id == client_id,
        Client.user_id == current_user.id
    ).first()
    if not client:
        raise HTTPException(status_code=404, detail="Cliente no encontrado")
    return client


@router.put("/{client_id}", response_model=ClientResponse)
def update_client(
    client_id: str,
    client_data: ClientUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    client = db.query(Client).filter(
        Client.id == client_id,
        Client.user_id == current_user.id
    ).first()
    if not client:
        raise HTTPException(status_code=404, detail="Cliente no encontrado")

    email_exists = db.query(Client).filter(
        Client.email == client_data.email,
        Client.user_id == current_user.id,
        Client.id != client_id
    ).first()
    if email_exists:
        raise HTTPException(status_code=400, detail="Ya existe otro cliente con ese email")

    client.name = client_data.name
    client.email = client_data.email
    client.client_type = client_data.client_type
    client.phone_number = client_data.phone_number
    client.address = client_data.address
    client.website = client_data.website
    client.extra_info = client_data.extra_info

    db.commit()
    db.refresh(client)

    return client
