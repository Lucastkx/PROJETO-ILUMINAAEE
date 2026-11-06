import shutil
import uuid
from datetime import datetime
from pathlib import Path

from fastapi import APIRouter, Depends, File, Form, HTTPException, UploadFile
from sqlalchemy import select
from sqlalchemy.orm import Session

from .. import models, schemas
from ..database import get_db
from ..deps import usuario_atual

router = APIRouter(prefix="/chamados", tags=["Chamados (cidadão)"])

UPLOAD_DIR = Path("uploads")
UPLOAD_DIR.mkdir(exist_ok=True)
MAX_FOTOS = 2
TIPOS_IMAGEM = {"image/jpeg", "image/png", "image/webp"}
TIPOS_PROBLEMA = {"lampada_apagada", "lampada_quebrada", "luz_acesa_de_dia", "outro"}


@router.post("", response_model=schemas.ChamadoOut, status_code=201)
def criar(
    rua: str = Form(...),
    bairro: str = Form(...),
    numero_proximo: str | None = Form(None),
    codigo_poste: str | None = Form(None),
    tem_lampada: bool = Form(True),
    sem_energia: bool = Form(False),
    tipo_problema: str = Form("lampada_apagada"),
    descricao: str | None = Form(None),
    fotos: list[UploadFile] = File(default=[]),
    usuario: models.Usuario = Depends(usuario_atual),
    db: Session = Depends(get_db),
):
    if tipo_problema not in TIPOS_PROBLEMA:
        raise HTTPException(422, f"tipo_problema deve ser um de {sorted(TIPOS_PROBLEMA)}")
    fotos = [f for f in fotos if f.filename]
    if len(fotos) > MAX_FOTOS:
        raise HTTPException(422, f"Máximo de {MAX_FOTOS} fotos")
    for f in fotos:
        if f.content_type not in TIPOS_IMAGEM:
            raise HTTPException(422, "Envie apenas imagens JPG, PNG ou WEBP")

    # Se o código do poste existe no cadastro, herda a coordenada dele
    poste = None
    if codigo_poste:
        codigo_poste = codigo_poste.strip().upper()
        poste = db.scalar(select(models.Poste).where(models.Poste.codigo == codigo_poste))

    chamado = models.Chamado(
        protocolo="tmp",
        usuario_id=usuario.id,
        poste_id=poste.id if poste else None,
        rua=rua,
        bairro=bairro,
        numero_proximo=numero_proximo,
        codigo_poste=codigo_poste,
        latitude=poste.latitude if poste else None,
        longitude=poste.longitude if poste else None,
        tem_lampada=tem_lampada,
        sem_energia=sem_energia,
        tipo_problema=tipo_problema,
        descricao=descricao,
    )
    db.add(chamado)
    db.flush()  # gera o id
    chamado.protocolo = f"{datetime.utcnow().year}-{chamado.id:04d}"
    chamado.historico.append(models.HistoricoStatus(status="recebido"))

    for f in fotos:
        extensao = Path(f.filename).suffix.lower() or ".jpg"
        nome = f"{uuid.uuid4().hex}{extensao}"
        with open(UPLOAD_DIR / nome, "wb") as destino:
            shutil.copyfileobj(f.file, destino)
        chamado.fotos.append(models.FotoChamado(caminho=f"/uploads/{nome}"))

    db.commit()
    db.refresh(chamado)
    return chamado


@router.get("/meus", response_model=list[schemas.ChamadoOut])
def meus_chamados(
    status: str | None = None,
    usuario: models.Usuario = Depends(usuario_atual),
    db: Session = Depends(get_db),
):
    """status: 'abertos' (recebido + a caminho), 'resolvido', ou vazio para todos."""
    consulta = select(models.Chamado).where(models.Chamado.usuario_id == usuario.id)
    if status == "abertos":
        consulta = consulta.where(models.Chamado.status != "resolvido")
    elif status:
        consulta = consulta.where(models.Chamado.status == status)
    return db.scalars(consulta.order_by(models.Chamado.criado_em.desc())).all()


@router.get("/{chamado_id}", response_model=schemas.ChamadoOut)
def detalhar(
    chamado_id: int,
    usuario: models.Usuario = Depends(usuario_atual),
    db: Session = Depends(get_db),
):
    chamado = db.get(models.Chamado, chamado_id)
    if not chamado or chamado.usuario_id != usuario.id:
        raise HTTPException(404, "Chamado não encontrado")
    return chamado
