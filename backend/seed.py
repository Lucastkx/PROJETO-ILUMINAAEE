"""Popula o banco com dados de demonstração. Rode: python seed.py (apaga e recria o ilumina.db)."""
from datetime import datetime, timedelta

from app import models
from app.database import Base, SessionLocal, engine
from app.security import hash_senha

Base.metadata.drop_all(bind=engine)
Base.metadata.create_all(bind=engine)
db = SessionLocal()

ana = models.Usuario(
    nome="Nariga Barbosa", nome_social="Nariguinha", cpf="12345678909",
    email="nariga@exemplo.com", celular="98789546520", sexo="MAS",
    data_nascimento="01/02/1991", senha_hash=hash_senha("123456"), perfil="cidadao",
)
equipe = models.Usuario(
    nome="Equipe Técnica Recife", cpf="11111111111",
    email="equipe@recife.pe.gov.br", senha_hash=hash_senha("admin123"), perfil="equipe_tecnica",
)
db.add_all([ana, equipe])

postes = [
    models.Poste(codigo="ILU-0428", rua="Rua da Aurora", bairro="Boa Vista", latitude=-8.0592, longitude=-34.8774),
    models.Poste(codigo="ILU-0392", rua="Rua do Riachuelo", bairro="Boa Vista", latitude=-8.0601, longitude=-34.8830),
    models.Poste(codigo="ILU-0756", rua="Rua Gervásio Pires", bairro="Boa Vista", latitude=-8.0575, longitude=-34.8812),
    models.Poste(codigo="ILU-0101", rua="Av. Conde da Boa Vista", bairro="Boa Vista", latitude=-8.0608, longitude=-34.8796),
    models.Poste(codigo="ILU-0210", rua="Rua da Hora", bairro="Espinheiro", latitude=-8.0431, longitude=-34.8903),
]
db.add_all(postes)
db.flush()
P = {p.codigo: p for p in postes}


def chamado(n, poste, tipo, status, dias, urgencia="normal", sem_energia=False, desc=None):
    c = models.Chamado(
        protocolo=f"2026-{n:04d}", usuario_id=ana.id, poste_id=poste.id,
        rua=poste.rua, bairro=poste.bairro, codigo_poste=poste.codigo,
        latitude=poste.latitude, longitude=poste.longitude, tipo_problema=tipo,
        tem_lampada=(tipo != "lampada_quebrada"), sem_energia=sem_energia,
        status=status, urgencia=urgencia, descricao=desc,
        criado_em=datetime.utcnow() - timedelta(days=dias),
    )
    c.historico.append(models.HistoricoStatus(status="recebido", criado_em=c.criado_em))
    if status != "recebido":
        c.historico.append(models.HistoricoStatus(status="equipe_a_caminho"))
    if status == "resolvido":
        c.historico.append(models.HistoricoStatus(status="resolvido"))
    db.add(c)


chamado(841, P["ILU-0428"], "lampada_apagada", "recebido", 0, "alta", True, "Apagado há três noites, em frente ao ponto de ônibus.")
chamado(827, P["ILU-0392"], "luz_acesa_de_dia", "equipe_a_caminho", 1)
chamado(756, P["ILU-0756"], "lampada_quebrada", "resolvido", 12)

db.commit()
print("Banco populado.\n  cidadão : CPF 05132568701 / senha 123456\n  equipe  : CPF 11111111111 / senha admin123")
