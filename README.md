# IluminaAê

```
ilumina/
├── backend/          FastAPI + SQLite   → http://localhost:8000  (docs em /docs)
├── web-cidadao/      React (Vite)       → http://localhost:5173
└── web-prefeitura/   React (Vite)       → http://localhost:5174
```

## Rodar o backend

```bash
cd backend
python -m venv .venv
source .venv/bin/activate        # Windows: .venv\Scripts\activate
pip install -r requirements.txt
python seed.py                   # cria ilumina.db com dados de demonstração
uvicorn app.main:app --reload
```

Abra http://localhost:8000/docs, clique em **Authorize** e entre com:

| Perfil | Login (CPF ou e-mail) | Senha |
|---|---|---|
| Cidadão | 12345678909 | 123456 |
| Equipe técnica | 11111111111 | admin123 |

> O `ilumina.db` é um arquivo único:Basta rodar o seed e abrir o `/docs`
> (ou abrir o arquivo no "DB Browser for SQLite" para ver as tabelas). LC

## Rodar os dois fronts (cada um em um terminal)

```bash
# Terminal 2 – app do cidadão → http://localhost:5173
cd web-cidadao
npm install
npm run dev

# Terminal 3 – painel da prefeitura → http://localhost:5174
cd web-prefeitura
npm install
npm run dev
```

Se o backend não estiver em `http://localhost:8000`, copie `.env.example` para `.env` em cada front e ajuste `VITE_API_URL`.

### Roteiro de demonstração

1. **Prefeitura** (5174): entre com `11111111111` / `admin123` e veja o mapa, os números e o chamado urgente piscando.
2. **Cidadão** (5173): entre com `12345678909` / `123456`, abra **+ Novo chamado**, escolha um poste, foto e envie. e acompanhe seu chamado.
3. Volte ao painel: em até 15s aparece o aviso de **novo chamado**. Clique nele, **Enviar equipe**, depois **Finalizar**.
4. No app do cidadão, em **Meus chamados**, a barra de andamento já mudou.

## Endpoints

**Cidadão**: `POST /auth/cadastro` · `POST /auth/login` · `GET /auth/me` · `GET /postes` · `GET /postes/{codigo}`
· `POST /chamados` (multipart, até 2 fotos) · `GET /chamados/meus?status=abertos|resolvido` · `GET /chamados/{id}`
· `PUT /usuarios/me/dados` · `PUT /usuarios/me/endereco` · `PUT /usuarios/me/senha` · `DELETE /usuarios/me`

**Prefeitura** (só `equipe_tecnica`): `GET /painel/chamados?status=&urgencia=&bairro=`
· `GET /painel/chamados/{id}` · `PATCH /painel/chamados/{id}` (status/urgência) · `GET /painel/resumo`

## Trocar SQLite por PostgreSQL depois,sf

Só mudar `DATABASE_URL` em `app/database.py` (e remover `connect_args`). O resto do código não muda.
