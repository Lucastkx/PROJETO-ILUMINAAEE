import os
from datetime import datetime, timedelta, timezone

import bcrypt
import jwt

SECRET_KEY = os.getenv("SECRET_KEY", "troque-esta-chave-em-producao")
ALGORITHM = "HS256"
TOKEN_HORAS = 12


def hash_senha(senha: str) -> str:
    return bcrypt.hashpw(senha.encode(), bcrypt.gensalt()).decode()


def verificar_senha(senha: str, hash_: str) -> bool:
    return bcrypt.checkpw(senha.encode(), hash_.encode())


def criar_token(usuario_id: int, perfil: str) -> str:
    exp = datetime.now(timezone.utc) + timedelta(hours=TOKEN_HORAS)
    return jwt.encode(
        {"sub": str(usuario_id), "perfil": perfil, "exp": exp}, SECRET_KEY, algorithm=ALGORITHM
    )


def ler_token(token: str) -> dict:
    return jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
