from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from app.routers import auth, user_profile, financial_profile, clients
from app.database import engine, Base
import app.models  # noqa: F401 — necesario para que Base registre los modelos
import os

Base.metadata.create_all(bind=engine)  # Crea las tablas si no existen

if not os.path.exists("static/avatars"):
    os.makedirs("static/avatars", exist_ok=True)

app = FastAPI(title="Orgalancer API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],  # En prod: dominio de Vercel
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.mount("/static", StaticFiles(directory="static"), name="static")

app.include_router(auth.router)
app.include_router(user_profile.router)
app.include_router(financial_profile.router)
app.include_router(clients.router)

@app.get("/health")
def health():
    return {"status": "ok"}