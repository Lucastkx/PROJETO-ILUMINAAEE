from datetime import datetime

from sqlalchemy import Boolean, DateTime, Float, ForeignKey, Integer, String, Text
from sqlalchemy.orm import Mapped, mapped_column, relationship

from .database import Base

PERFIS = ("cidadao", "equipe_tecnica")
STATUS = ("recebido", "equipe_a_caminho", "resolvido")
URGENCIAS = ("normal", "alta")


class Usuario(Base):
    __tablename__ = "usuarios"

    id: Mapped[int] = mapped_column(primary_key=True)
    nome: Mapped[str] = mapped_column(String(120))
    nome_social: Mapped[str | None] = mapped_column(String(120), nullable=True)
    cpf: Mapped[str | None] = mapped_column(String(11), unique=True, nullable=True)
    email: Mapped[str | None] = mapped_column(String(120), unique=True, nullable=True)
    celular: Mapped[str | None] = mapped_column(String(20), nullable=True)
    sexo: Mapped[str | None] = mapped_column(String(3), nullable=True)  # FEM / MAS
    data_nascimento: Mapped[str | None] = mapped_column(String(10), nullable=True)
    # Endereço (tela "Endereço" do Figma)
    cep: Mapped[str | None] = mapped_column(String(9), nullable=True)
    rua: Mapped[str | None] = mapped_column(String(120), nullable=True)
    numero: Mapped[str | None] = mapped_column(String(10), nullable=True)
    bairro: Mapped[str | None] = mapped_column(String(80), nullable=True)
    cidade: Mapped[str | None] = mapped_column(String(80), nullable=True)
    estado: Mapped[str | None] = mapped_column(String(2), nullable=True)

    senha_hash: Mapped[str] = mapped_column(String(100))
    perfil: Mapped[str] = mapped_column(String(20), default="cidadao")
    ativo: Mapped[bool] = mapped_column(Boolean, default=True)
    criado_em: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)

    chamados: Mapped[list["Chamado"]] = relationship(back_populates="usuario")


class Poste(Base):
    __tablename__ = "postes"

    id: Mapped[int] = mapped_column(primary_key=True)
    codigo: Mapped[str] = mapped_column(String(20), unique=True, index=True)  # ex: ILU-0428
    rua: Mapped[str] = mapped_column(String(120))
    bairro: Mapped[str] = mapped_column(String(80))
    latitude: Mapped[float] = mapped_column(Float)
    longitude: Mapped[float] = mapped_column(Float)


class Chamado(Base):
    __tablename__ = "chamados"

    id: Mapped[int] = mapped_column(primary_key=True)
    protocolo: Mapped[str] = mapped_column(String(20), unique=True, index=True)  # ex: 2026-0841
    usuario_id: Mapped[int] = mapped_column(ForeignKey("usuarios.id"))
    poste_id: Mapped[int | None] = mapped_column(ForeignKey("postes.id"), nullable=True)

    rua: Mapped[str] = mapped_column(String(120))
    bairro: Mapped[str] = mapped_column(String(80))
    numero_proximo: Mapped[str | None] = mapped_column(String(10), nullable=True)
    codigo_poste: Mapped[str | None] = mapped_column(String(20), nullable=True)
    latitude: Mapped[float | None] = mapped_column(Float, nullable=True)
    longitude: Mapped[float | None] = mapped_column(Float, nullable=True)

    tem_lampada: Mapped[bool] = mapped_column(Boolean, default=True)
    sem_energia: Mapped[bool] = mapped_column(Boolean, default=False)
    tipo_problema: Mapped[str] = mapped_column(String(40), default="lampada_apagada")
    descricao: Mapped[str | None] = mapped_column(Text, nullable=True)

    status: Mapped[str] = mapped_column(String(20), default="recebido", index=True)
    urgencia: Mapped[str] = mapped_column(String(10), default="normal")
    criado_em: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)
    atualizado_em: Mapped[datetime] = mapped_column(
        DateTime, default=datetime.utcnow, onupdate=datetime.utcnow
    )

    usuario: Mapped[Usuario] = relationship(back_populates="chamados")
    poste: Mapped[Poste | None] = relationship()
    fotos: Mapped[list["FotoChamado"]] = relationship(
        back_populates="chamado", cascade="all, delete-orphan"
    )
    historico: Mapped[list["HistoricoStatus"]] = relationship(
        back_populates="chamado", cascade="all, delete-orphan", order_by="HistoricoStatus.criado_em"
    )


class FotoChamado(Base):
    __tablename__ = "fotos_chamado"

    id: Mapped[int] = mapped_column(primary_key=True)
    chamado_id: Mapped[int] = mapped_column(ForeignKey("chamados.id"))
    caminho: Mapped[str] = mapped_column(String(200))

    chamado: Mapped[Chamado] = relationship(back_populates="fotos")


class HistoricoStatus(Base):
    __tablename__ = "historico_status"

    id: Mapped[int] = mapped_column(primary_key=True)
    chamado_id: Mapped[int] = mapped_column(ForeignKey("chamados.id"))
    status: Mapped[str] = mapped_column(String(20))
    criado_em: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)

    chamado: Mapped[Chamado] = relationship(back_populates="historico")
