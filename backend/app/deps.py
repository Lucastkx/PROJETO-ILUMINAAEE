import jwt
from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from sqlalchemy.orm import Session

from . import models
from .database import get_db
from .security import ler_token

oauth2 = OAuth2PasswordBearer(tokenUrl="auth/login")


def usuario_atual(token: str = Depends(oauth2), db: Session = Depends(get_db)) -> models.Usuario:
    erro = HTTPException(status.HTTP_401_UNAUTHORIZED, "Token inválido ou expirado")
    try:
        dados = ler_token(token)
    except jwt.PyJWTError:
        raise erro
    usuario = db.get(models.Usuario, int(dados["sub"]))
    if not usuario or not usuario.ativo:
        raise erro
    return usuario


def so_equipe(usuario: models.Usuario = Depends(usuario_atual)) -> models.Usuario:
    if usuario.perfil != "equipe_tecnica":
        raise HTTPException(status.HTTP_403_FORBIDDEN, "Acesso restrito à equipe técnica")
    return usuario
