import os
import jwt
from fastapi import Depends, HTTPException
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from dotenv import load_dotenv

load_dotenv()
security = HTTPBearer()

def get_current_user_id(credentials: HTTPAuthorizationCredentials = Depends(security)) -> str:
    try:
        payload = jwt.decode(
            credentials.credentials,
            os.getenv("SECRET_KEY"),
            algorithms=["HS256"]
        )
        user_id = payload.get("sub") 
        
        if user_id is None:
            print("DEBUG: El token no contiene 'sub'")
            raise HTTPException(status_code=401, detail="Token inválido")
            
        return str(user_id)
    except Exception as e:
        print(f"DEBUG Error en JWT: {e}")
        raise HTTPException(status_code=401, detail="Not authenticated")
