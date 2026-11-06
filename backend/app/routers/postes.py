from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import select
from sqlalchemy.orm import Session

from .. import models, schemas
from ..database import get_db
from ..deps import usuario_atual

router = APIRouter(prefix="/postes", tags=["Postes"], dependencies=[Depends(usuario_atual)])


@router.get("", response_model=list[schemas.PosteOut])
def listar(bairro: str | None = None, db: Session = Depends(get_db)):
    """Tela 'Pesquisar localidade': devolve os postes para desenhar no mapa."""
    consulta = select(models.Poste)
    if bairro:
        consulta = consulta.where(models.Poste.bairro.ilike(f"%{bairro}%"))
    return db.scalars(consulta).all()


@router.get("/{codigo}", response_model=schemas.PosteOut)
def detalhar(codigo: str, db: Session = Depends(get_db)):
    poste = db.scalar(select(models.Poste).where(models.Poste.codigo == codigo.upper()))
    if not poste:
        raise HTTPException(404, "Poste não encontrado")
    return poste
