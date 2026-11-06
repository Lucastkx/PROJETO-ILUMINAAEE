import re

from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy import or_, select
from sqlalchemy.orm import Session

from .. import models, schemas
from ..database import get_db
from ..deps import usuario_atual
from ..security import criar_token, hash_senha, verificar_senha

router = APIRouter(prefix="/auth", tags=["Autenticação"])


def so_digitos(valor: str) -> str:
    return re.sub(r"\D", "", valor or "")


@router.post("/cadastro", response_model=schemas.UsuarioOut, status_code=201)
def cadastro(dados: schemas.CadastroIn, db: Session = Depends(get_db)):
    cpf = so_digitos(dados.cpf)
    if len(cpf) != 11:
        raise HTTPException(422, "CPF deve ter 11 dígitos")
    existe = db.scalar(
        select(models.Usuario).where(
            or_(models.Usuario.cpf == cpf, models.Usuario.email == dados.email.lower())
        )
    )
    if existe:
        raise HTTPException(409, "CPF ou e-mail já cadastrado")
    usuario = models.Usuario(
        **dados.model_dump(exclude={"senha", "cpf", "email"}),
        cpf=cpf,
        email=dados.email.lower(),
        senha_hash=hash_senha(dados.senha),
        perfil="cidadao",  # equipe técnica só é criada pelo seed/admin
    )
    db.add(usuario)
    db.commit()
    db.refresh(usuario)
    return usuario


@router.post("/login", response_model=schemas.TokenOut)
def login(form: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(get_db)):
    """`username` pode ser o CPF ou o e-mail."""
    login_ = form.username.strip()
    usuario = db.scalar(
        select(models.Usuario).where(
            or_(models.Usuario.cpf == so_digitos(login_), models.Usuario.email == login_.lower())
        )
    )
    if not usuario or not usuario.ativo or not verificar_senha(form.password, usuario.senha_hash):
        raise HTTPException(status.HTTP_401_UNAUTHORIZED, "CPF/e-mail ou senha incorretos")
    return schemas.TokenOut(
        access_token=criar_token(usuario.id, usuario.perfil), perfil=usuario.perfil
    )


@router.get("/me", response_model=schemas.UsuarioOut)
def me(usuario: models.Usuario = Depends(usuario_atual)):
    return usuario


@router.post("/esqueci-senha")
def esqueci_senha(cpf_ou_email: str, db: Session = Depends(get_db)):
    """Demo: não envia e-mail de verdade. Sempre responde igual para não revelar quem tem conta."""
    # TODO: gerar token de redefinição e enviar por e-mail (SMTP)
    return {"mensagem": "Se o cadastro existir, enviaremos um link de redefinição."}
