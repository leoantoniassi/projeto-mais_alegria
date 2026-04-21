# Walkthrough — Backend Projeto Mais Alegria

## Resumo

Backend completo em **Node.js + Express + Sequelize + PostgreSQL** para o sistema de gestão de eventos Mais Alegria. Inclui autenticação JWT, CRUD para todos os módulos, upload de documentos, e regras de negócio conforme documentação.

---

## Arquivos Criados (38 arquivos)

### Configuração
| Arquivo | Descrição |
|---------|-----------|
| [package.json](file:///c:/Users/franc/OneDrive/%C3%81rea%20de%20Trabalho/vero/Fatec/pi-mais-alegria/projeto-mais-alegria/projeto-mais_alegria/backend/package.json) | Dependências e scripts npm |
| [.env](file:///c:/Users/franc/OneDrive/%C3%81rea%20de%20Trabalho/vero/Fatec/pi-mais-alegria/projeto-mais-alegria/projeto-mais_alegria/backend/.env) | Variáveis de ambiente (JWT, DB) |
| [Dockerfile](file:///c:/Users/franc/OneDrive/%C3%81rea%20de%20Trabalho/vero/Fatec/pi-mais-alegria/projeto-mais-alegria/projeto-mais_alegria/backend/Dockerfile) | Container Node.js 18 Alpine |
| [server.js](file:///c:/Users/franc/OneDrive/%C3%81rea%20de%20Trabalho/vero/Fatec/pi-mais-alegria/projeto-mais-alegria/projeto-mais_alegria/backend/src/server.js) | Entry point |
| [app.js](file:///c:/Users/franc/OneDrive/%C3%81rea%20de%20Trabalho/vero/Fatec/pi-mais-alegria/projeto-mais-alegria/projeto-mais_alegria/backend/src/app.js) | Express config (CORS, Helmet, rotas) |
| [database.js](file:///c:/Users/franc/OneDrive/%C3%81rea%20de%20Trabalho/vero/Fatec/pi-mais-alegria/projeto-mais-alegria/projeto-mais_alegria/backend/src/config/database.js) | Conexão Sequelize |

### 10 Modelos Sequelize
Mapeiam fielmente as tabelas do [init.sql](file:///c:/Users/franc/OneDrive/%C3%81rea%20de%20Trabalho/vero/Fatec/pi-mais-alegria/projeto-mais-alegria/projeto-mais_alegria/database/init.sql) usando `field` para expor nomes limpos na API.

| Modelo | Tabela | Destaque |
|--------|--------|----------|
| Usuario | `usuarios` | Roles: admin/gerente/operador |
| Cliente | `clientes` | Unique: email e rgCpf |
| Funcionario | `funcionarios` | Unique: email, campo `funcao` |
| Produto | `produtos` | Campos DECIMAL para quantidade e custo |
| Orcamento | `orcamentos` | FK → Cliente, status workflow |
| Evento | `eventos` | FK → Cliente + Orcamento, contagem de público |
| Documento | `documentos` | FK → Cliente + Evento, tipo pdf/jpg/png |
| Escala | `escala` | Junction Evento ↔ Funcionário |
| EventoProduto | `evento_produto` | Junction Evento ↔ Produto |
| OrcamentoProduto | `orcamento_produto` | Junction Orçamento ↔ Produto |

### 9 Controllers + 10 Route files + 3 Middleware + 1 Util
Veja o plano de implementação para a tabela completa de rotas.

---

## Rotas da API

```
POST   /api/auth/register              — Criar usuário
POST   /api/auth/login                 — Login (retorna JWT)

GET    /api/clientes                   — Listar (paginado, busca)
GET    /api/clientes/:id               — Detalhar com orçamentos, eventos, documentos
GET    /api/clientes/:id/whatsapp      — Link WhatsApp
POST   /api/clientes                   — Criar
PUT    /api/clientes/:id               — Atualizar
DELETE /api/clientes/:id               — Soft delete (admin/gerente)

GET    /api/funcionarios               — Listar (filtro por função)
GET    /api/funcionarios/:id           — Detalhar
POST   /api/funcionarios               — Criar
PUT    /api/funcionarios/:id           — Atualizar
DELETE /api/funcionarios/:id           — Soft delete (admin/gerente)

GET    /api/produtos                   — Listar (filtro por categoria)
GET    /api/produtos/:id               — Detalhar
POST   /api/produtos                   — Criar
PUT    /api/produtos/:id               — Atualizar
DELETE /api/produtos/:id               — Soft delete (admin/gerente)

GET    /api/orcamentos                 — Listar (filtro por status)
GET    /api/orcamentos/:id             — Detalhar com produtos
POST   /api/orcamentos                 — Criar com produtos
PUT    /api/orcamentos/:id             — Atualizar
PATCH  /api/orcamentos/:id/status      — Mudar status (admin/gerente)
DELETE /api/orcamentos/:id             — Soft delete (admin/gerente)

GET    /api/eventos                    — Listar (filtro por status)
GET    /api/eventos/:id                — Detalhar com equipe e produtos
POST   /api/eventos                    — Criar (valida RN4 e RN Canvas 2)
PUT    /api/eventos/:id                — Atualizar
PATCH  /api/eventos/:id/status         — Mudar status (admin/gerente)
DELETE /api/eventos/:id                — Soft delete (admin/gerente)

POST   /api/escala                     — Alocar funcionário (valida RN2)
DELETE /api/escala/:id                 — Remover alocação
GET    /api/escala/evento/:eventoId    — Equipe do evento

POST   /api/documentos/upload          — Upload (pdf/jpg/png, max 10MB)
GET    /api/documentos                 — Listar (filtro cliente/evento)
GET    /api/documentos/:id/download    — Download
DELETE /api/documentos/:id             — Soft delete (admin only)

GET    /api/dashboard/stats            — Contadores gerais
GET    /api/dashboard/proximos-eventos — Próximos 5 eventos

GET    /api/health                     — Health check
```

---

## Regras de Negócio Implementadas

| Regra | Onde |
|-------|------|
| **RN1** — CPF/Email únicos | Constraints no DB + error handler amigável |
| **RN2** — Sem conflito de horário | [escalaController.js](file:///c:/Users/franc/OneDrive/%C3%81rea%20de%20Trabalho/vero/Fatec/pi-mais-alegria/projeto-mais-alegria/projeto-mais_alegria/backend/src/controllers/escalaController.js) verifica data antes de alocar |
| **RN3** — Apenas admin exclui documentos | Middleware `authorize('admin')` no DELETE de documentos |
| **RN3** — Formatos aceitos | Multer fileFilter: pdf, jpg, png |
| **RN4** — Público > 50 exige detalhamento | [eventoController.js](file:///c:/Users/franc/OneDrive/%C3%81rea%20de%20Trabalho/vero/Fatec/pi-mais-alegria/projeto-mais-alegria/projeto-mais_alegria/backend/src/controllers/eventoController.js) valida adultos/crianças/bebês |
| **RN Canvas 2** — Evento confirmado → orçamento aprovado | eventoController valida no create e mudarStatus |

---

## Como Rodar

### 1. Subir o banco (Docker)
```bash
docker-compose up db -d
```

### 2. Instalar dependências e rodar seed
```bash
cd backend
npm install          # ✅ já executado
npm run seed         # Popular banco com dados de exemplo
```

### 3. Iniciar o servidor
```bash
npm run dev          # Modo desenvolvimento (nodemon)
```

### 4. Credenciais de teste
| Usuário | Email | Senha | Role |
|---------|-------|-------|------|
| Admin Silva | admin@maisalegria.com | 123456 | admin |
| Gerente Souza | gerente@maisalegria.com | 123456 | gerente |
| Operador Lima | operador@maisalegria.com | 123456 | operador |

---

## Arquivo Modificado

```diff:docker-compose.yml
version: '3.8'

services:
  db:
    image: postgres:15-alpine
    container_name: mais_alegria_db
    restart: unless-stopped
    environment:
      POSTGRES_DB: ${DB_NAME}
      POSTGRES_USER: ${DB_USER}
      POSTGRES_PASSWORD: ${DB_PASS}
    ports:
      - "${DB_PORT}:5432"
    volumes:
      - pgdata:/var/lib/postgresql/data
      - ./database/init.sql:/docker-entrypoint-initdb.d/01-init.sql
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U ${DB_USER} -d ${DB_NAME}"]
      interval: 5s
      timeout: 5s
      retries: 5

volumes:
  pgdata:
===
version: '3.8'

services:
  db:
    image: postgres:15-alpine
    container_name: mais_alegria_db
    restart: unless-stopped
    environment:
      POSTGRES_DB: ${DB_NAME}
      POSTGRES_USER: ${DB_USER}
      POSTGRES_PASSWORD: ${DB_PASS}
    ports:
      - "${DB_PORT}:5432"
    volumes:
      - pgdata:/var/lib/postgresql/data
      - ./database/init.sql:/docker-entrypoint-initdb.d/01-init.sql
      - ./database/seed.sql:/docker-entrypoint-initdb.d/02-seed.sql
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U ${DB_USER} -d ${DB_NAME}"]
      interval: 5s
      timeout: 5s
      retries: 5

  backend:
    build: ./backend
    container_name: mais_alegria_api
    restart: unless-stopped
    environment:
      PORT: 3001
      JWT_SECRET: mais_alegria_jwt_secret_2026
      JWT_EXPIRES_IN: 24h
      DB_HOST: db
      DB_PORT: 5432
      DB_USER: ${DB_USER}
      DB_PASS: ${DB_PASS}
      DB_NAME: ${DB_NAME}
    ports:
      - "3001:3001"
    volumes:
      - backend_uploads:/app/uploads
    depends_on:
      db:
        condition: service_healthy

volumes:
  pgdata:
  backend_uploads:
```
