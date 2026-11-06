from datetime import datetime
from typing import Literal

from pydantic import BaseModel, ConfigDict, Field


class CadastroIn(BaseModel):
    nome: str = Field(min_length=3)
    nome_social: str | None = None
    cpf: str
    email: str
    celular: str | None = None
    sexo: Literal["FEM", "MAS"] | None = None
    data_nascimento: str | None = None
    senha: str = Field(min_length=6)


class UsuarioOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: int
    nome: str
    nome_social: str | None
    cpf: str | None
    email: str | None
    celular: str | None
    sexo: str | None
    data_nascimento: str | None
    cep: str | None
    rua: str | None
    numero: str | None
    bairro: str | None
    cidade: str | None
    estado: str | None
    perfil: str


class DadosPessoaisIn(BaseModel):
    nome: str | None = None
    nome_social: str | None = None
    email: str | None = None
    celular: str | None = None
    sexo: Literal["FEM", "MAS"] | None = None
    data_nascimento: str | None = None


class EnderecoIn(BaseModel):
    cep: str | None = None
    rua: str | None = None
    numero: str | None = None
    bairro: str | None = None
    cidade: str | None = None
    estado: str | None = None


class SenhaIn(BaseModel):
    senha: str = Field(min_length=6)
    confirmar_senha: str


class TokenOut(BaseModel):
    access_token: str
    token_type: str = "bearer"
    perfil: str


class PosteOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    codigo: str
    rua: str
    bairro: str
    latitude: float
    longitude: float


class FotoOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    caminho: str


class HistoricoOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    status: str
    criado_em: datetime


class ChamadoOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: int
    protocolo: str
    rua: str
    bairro: str
    numero_proximo: str | None
    codigo_poste: str | None
    latitude: float | None
    longitude: float | None
    tem_lampada: bool
    sem_energia: bool
    tipo_problema: str
    descricao: str | None
    status: str
    urgencia: str
    criado_em: datetime
    atualizado_em: datetime
    fotos: list[FotoOut] = []
    historico: list[HistoricoOut] = []


class StatusIn(BaseModel):
    status: Literal["recebido", "equipe_a_caminho", "resolvido"] | None = None
    urgencia: Literal["normal", "alta"] | None = None
