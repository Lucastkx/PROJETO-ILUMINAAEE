from datetime import datetime

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from .. import models, schemas
from ..database import get_db
from ..deps import usuario_atual
from ..security import hash_senha

router = APIRouter(prefix="/usuarios/me", tags=["Configurações do usuário"])


@router.put("/dados", response_model=schemas.UsuarioOut)
def atualizar_dados(
    dados: schemas.DadosPessoaisIn,
    usuario: models.Usuario = Depends(usuario_atual),
    db: Session = Depends(get_db),
):
    for campo, valor in dados.model_dump(exclude_unset=True).items():
        setattr(usuario, campo, valor)
    db.commit()
    db.refresh(usuario)
    return usuario


@router.put("/endereco", response_model=schemas.UsuarioOut)
def atualizar_endereco(
    dados: schemas.EnderecoIn,
    usuario: models.Usuario = Depends(usuario_atual),
    db: Session = Depends(get_db),
):
    for campo, valor in dados.model_dump(exclude_unset=True).items():
        setattr(usuario, campo, valor)
    db.commit()
    db.refresh(usuario)
    return usuario


@router.put("/senha")
def alterar_senha(
    dados: schemas.SenhaIn,
    usuario: models.Usuario = Depends(usuario_atual),
    db: Session = Depends(get_db),
):
    if dados.senha != dados.confirmar_senha:
        raise HTTPException(422, "As senhas não conferem")
    usuario.senha_hash = hash_senha(dados.senha)
    db.commit()
    return {"mensagem": "Senha alterada com sucesso"}


@router.delete("")
def excluir_conta(usuario: models.Usuario = Depends(usuario_atual), db: Session = Depends(get_db)):
    """LGPD: anonimiza os dados pessoais, mas preserva os chamados (histórico da cidade)."""
    usuario.nome = "Usuário removido"
    usuario.nome_social = None
    usuario.cpf = None
    usuario.email = f"removido-{usuario.id}-{int(datetime.utcnow().timestamp())}@removido.local"
    usuario.celular = None
    usuario.sexo = usuario.data_nascimento = None
    usuario.cep = usuario.rua = usuario.numero = usuario.bairro = None
    usuario.cidade = usuario.estado = None
    usuario.ativo = False
    db.commit()
    return {"mensagem": "Conta excluída com sucesso"}
