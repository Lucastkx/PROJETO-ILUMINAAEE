from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import func, select
from sqlalchemy.orm import Session

from .. import models, schemas
from ..database import get_db
from ..deps import so_equipe

router = APIRouter(prefix="/painel", tags=["Painel da prefeitura"], dependencies=[Depends(so_equipe)])


@router.get("/chamados", response_model=list[schemas.ChamadoOut])
def listar(
    status: str | None = None,
    urgencia: str | None = None,
    bairro: str | None = None,
    db: Session = Depends(get_db),
):
    """Alimenta o mapa e a lista do painel. Filtros: status, urgência, bairro."""
    consulta = select(models.Chamado)
    if status == "abertos":
        consulta = consulta.where(models.Chamado.status != "resolvido")
    elif status:
        consulta = consulta.where(models.Chamado.status == status)
    if urgencia:
        consulta = consulta.where(models.Chamado.urgencia == urgencia)
    if bairro:
        consulta = consulta.where(models.Chamado.bairro.ilike(f"%{bairro}%"))
    return db.scalars(consulta.order_by(models.Chamado.criado_em.desc())).all()


@router.get("/chamados/{chamado_id}", response_model=schemas.ChamadoOut)
def detalhar(chamado_id: int, db: Session = Depends(get_db)):
    chamado = db.get(models.Chamado, chamado_id)
    if not chamado:
        raise HTTPException(404, "Chamado não encontrado")
    return chamado


@router.patch("/chamados/{chamado_id}", response_model=schemas.ChamadoOut)
def atualizar(chamado_id: int, dados: schemas.StatusIn, db: Session = Depends(get_db)):
    """Botão 'finalizar' = status 'resolvido'. Também serve para 'equipe a caminho' e urgência."""
    chamado = db.get(models.Chamado, chamado_id)
    if not chamado:
        raise HTTPException(404, "Chamado não encontrado")
    if dados.status and dados.status != chamado.status:
        chamado.status = dados.status
        chamado.historico.append(models.HistoricoStatus(status=dados.status))
    if dados.urgencia:
        chamado.urgencia = dados.urgencia
    db.commit()
    db.refresh(chamado)
    return chamado


@router.get("/resumo")
def resumo(db: Session = Depends(get_db)):
    """Números para os cards do topo do painel."""
    por_status = dict(
        db.execute(select(models.Chamado.status, func.count()).group_by(models.Chamado.status)).all()
    )
    urgentes = db.scalar(
        select(func.count()).where(
            models.Chamado.urgencia == "alta", models.Chamado.status != "resolvido"
        )
    )
    return {
        "recebido": por_status.get("recebido", 0),
        "equipe_a_caminho": por_status.get("equipe_a_caminho", 0),
        "resolvido": por_status.get("resolvido", 0),
        "urgentes_abertos": urgentes,
    }
