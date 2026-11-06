from pathlib import Path

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles

from .database import Base, engine
from .routers import auth, chamados, painel, postes, usuarios




'''No painel da prefeitura, entre com 11111111111 / admin123.(parte tecnica)

No app do cidadão, entre com 05132568701 / 123456 e abra um chamado novo com foto.(usuario comum)'''
Base.metadata.create_all(bind=engine)  # pcria as tabelas no SQLite se não existirem
Path("uploads").mkdir(exist_ok=True)

app = FastAPI(title="IluminaAê API", version="0.1.0")

# 5173 = web-cidadao, 5174 = web-prefeitura (portas do Vitefr)
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173", "http://localhost:5174",
        "http://127.0.0.1:5173", "http://127.0.0.1:5174",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.mount("/uploads", StaticFiles(directory="uploads"), name="uploads")

for r in (auth, usuarios, postes, chamados, painel):
    app.include_router(r.router)


@app.get("/", tags=["Saúde"])
def raiz():
    return {"app": "IluminaAê", "docs": "/docs"}
