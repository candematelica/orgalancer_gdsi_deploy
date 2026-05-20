import bcrypt
import jwt
import os
from dotenv import load_dotenv
from datetime import datetime, timedelta
from fastapi import APIRouter, HTTPException, Depends, status
from fastapi.security import OAuth2PasswordBearer
from sqlalchemy.orm import Session
from app.schemas import UserRegister, UserLogin, UserResponse
from app.database import get_db
from app.models import User

router = APIRouter(prefix="/auth", tags=["auth"])

load_dotenv()

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="auth/login")

def get_current_user(token: str = Depends(oauth2_scheme), db: Session = Depends(get_db)):
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="No se pudo validar las credenciales",
        headers={"WWW-Authenticate": "Bearer"},
    )

    try:
        payload = jwt.decode(token, os.getenv("SECRET_KEY"), algorithms=["HS256"])
        
        user_id: str = payload.get("sub")
        if user_id is None:
            raise credentials_exception

    except jwt.PyJWTError:
        raise credentials_exception

    user = db.query(User).filter(User.id == user_id).first()
    if user is None:
        raise credentials_exception

    return user

def create_token(user_id: str) -> str:
    payload = {
        "sub": user_id,
        "exp": datetime.utcnow() + timedelta(days=7)
    }
    return jwt.encode(payload, os.getenv("SECRET_KEY"), algorithm="HS256")

@router.post("/register", response_model=UserResponse, status_code=201)
def register(user: UserRegister, db: Session = Depends(get_db)):
    if db.query(User).filter(User.email == user.email).first():
        raise HTTPException(status_code=400, detail="El email ya está registrado")

    hashed = bcrypt.hashpw(user.password.encode(), bcrypt.gensalt()).decode()

    new_user = User(
        full_name=user.full_name,
        email=user.email,
        profession=user.profession,
        hashed_password=hashed,
    )
    db.add(new_user)
    db.commit()
    db.refresh(new_user)
    return new_user

@router.post("/login")
def login(user: UserLogin, db: Session = Depends(get_db)):
    db_user = db.query(User).filter(User.email == user.email).first()
    if not db_user:
        raise HTTPException(status_code=401, detail="Email o contraseña incorrectos")

    if not bcrypt.checkpw(user.password.encode(), db_user.hashed_password.encode()):
        raise HTTPException(status_code=401, detail="Email o contraseña incorrectos")

    token = create_token(db_user.id)

    return {
        "token": token,
        "id": db_user.id,
        "full_name": db_user.full_name,
        "email": db_user.email,
        "profession": db_user.profession,
    }