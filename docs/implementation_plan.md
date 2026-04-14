# Plano de Implementação — Projeto Mais Alegria

Sistema de gestão de festas/eventos com React SPA + Node.js API + PostgreSQL, containerizado com Docker, CI/CD via GitHub Actions e deploy local via Kind (Kubernetes).

---

## User Review Required

> [!IMPORTANT]
> **Tailwind CSS v3** será usado conforme solicitado. O usuário pediu especificamente Tailwind CSS.

> [!IMPORTANT]
> **Banco PostgreSQL** conforme DDL já existente no projeto. A ORM será Sequelize.

> [!WARNING]
> O projeto será criado como monorepo na raiz do repositório existente (`c:\Users\0201392421006\Desktop\projeto-mais_alegria`), com pastas `/backend` e `/frontend`. Os arquivos existentes (`README.md`, `database/`, `docs/`, `img/`) serão mantidos.

---

## Proposed Changes

### 1. Infraestrutura (Raiz do Projeto)

#### [NEW] docker-compose.yml
- Service `db`: PostgreSQL 15 com volume persistente, executa `database/ddl.sql` como init script
- Service `backend`: Node.js 18, porta 3001, depende de `db`
- Service `frontend`: React/Vite, porta 5173, depende de `backend`
- Network interna compartilhada

#### [NEW] .github/workflows/ci.yml
- GitHub Actions: lint, test, build das imagens Docker
- Steps: checkout → setup Node → install deps → lint → test → docker build

#### [NEW] k8s/ (diretório com manifests Kind)
- `k8s/namespace.yml` — namespace `mais-alegria`
- `k8s/postgres-deployment.yml` — Deployment + Service + PVC para PostgreSQL
- `k8s/backend-deployment.yml` — Deployment + Service para API
- `k8s/frontend-deployment.yml` — Deployment + Service + Ingress para frontend
- `k8s/kind-config.yml` — Config do cluster Kind com port mapping

---

### 2. Backend — Node.js + Express

#### [NEW] backend/package.json
- Dependências: `express`, `sequelize`, `pg`, `pg-hstore`, `jsonwebtoken`, `bcryptjs`, `multer`, `cors`, `dotenv`, `jspdf`, `jspdf-autotable`
- DevDeps: `nodemon`, `eslint`
- Scripts: `dev`, `start`, `seed`, `lint`

#### [NEW] backend/Dockerfile
- Multi-stage: `node:18-alpine`, copia código, instala deps, expõe 3001

#### [NEW] backend/src/server.js
- Entry point: Express app, CORS, JSON parser, rotas, error handler

#### [NEW] backend/src/config/database.js
- Configuração Sequelize para PostgreSQL usando env vars

#### [NEW] backend/src/models/ (9 modelos Sequelize)
- `User.js` — Tabela de usuários do sistema (admin/gerente/operador) — **NOVA tabela** adicionada ao schema para autenticação
- `Cliente.js`, `Funcionario.js`, `Produto.js`, `Orcamento.js`, `Evento.js`, `Documento.js`, `Escala.js`, `EventoProduto.js`, `OrcamentoProduto.js`
- `index.js` — associações entre modelos

#### [NEW] backend/src/middleware/
- `auth.js` — Middleware JWT: verifica token no header `Authorization: Bearer <token>`
- `roles.js` — Middleware de permissão baseado em role (`admin`, `gerente`, `operador`)

#### [NEW] backend/src/routes/
- `auth.routes.js` — POST `/api/auth/login`, POST `/api/auth/register`
- `clientes.routes.js` — CRUD completo + busca + WhatsApp link
- `funcionarios.routes.js` — CRUD completo + filtro por função
- `produtos.routes.js` — CRUD + alertas de estoque baixo
- `orcamentos.routes.js` — CRUD + mudança de status + associação de produtos
- `eventos.routes.js` — CRUD + alocação de funcionários + baixa de estoque
- `documentos.routes.js` — Upload/download/delete de arquivos (Multer)
- `dashboard.routes.js` — Dados agregados para gráficos + geração de PDF

#### [NEW] backend/src/controllers/
- Um controller por módulo, com lógica de negócio isolada

#### [NEW] backend/src/seed.js
- Script para popular banco com dados de exemplo (clientes, produtos, eventos, etc.)

#### [NEW] backend/postman/
- `MaisAlegria.postman_collection.json` — Collection Postman com todas as rotas organizadas por pasta (Auth, Clientes, Funcionários, Produtos, Orçamentos, Eventos, Documentos, Dashboard)
- `MaisAlegria.postman_environment.json` — Environment com variáveis `{{base_url}}`, `{{token}}`

---

### 3. Frontend — React + Vite + Tailwind CSS

#### [NEW] frontend/ (criado via `npx create-vite`)
- React 18 + Vite 5

#### [NEW] frontend/Dockerfile
- Multi-stage build: node para build, nginx para servir

#### [NEW] frontend/tailwind.config.js
- Paleta customizada: tons de laranja/coral vibrante + azul claro + neutros escuros
- Fontes: Inter (Google Fonts)

#### [NEW] frontend/src/main.jsx
- Entry point com React Router

#### [NEW] frontend/src/contexts/AuthContext.jsx
- Context API para estado de autenticação (token, user, login, logout)

#### [NEW] frontend/src/services/api.js
- Axios instance com interceptors para JWT token

#### [NEW] frontend/src/components/
- `Layout.jsx` — Sidebar + Header + Main content area (responsive)
- `ProtectedRoute.jsx` — Redireciona se não autenticado
- `DataTable.jsx` — Tabela reutilizável com busca/paginação
- `Modal.jsx` — Modal reutilizável para formulários
- `Chart.jsx` — Wrapper para Chart.js (bar, pie, line)
- `StatsCard.jsx` — Card de estatísticas para dashboard
- `WhatsAppButton.jsx` — Botão de atalho para WhatsApp

#### [NEW] frontend/src/pages/
- `Login.jsx` — Tela de login com autenticação
- `Dashboard.jsx` — Painel com gráficos dinâmicos (Chart.js) + resumo
- `Clientes.jsx` — CRUD com tabela, formulário modal, botão WhatsApp
- `Funcionarios.jsx` — CRUD com filtro por função
- `Estoque.jsx` — CRUD de produtos com alertas visuais
- `Orcamentos.jsx` — CRUD com status e produtos associados
- `Eventos.jsx` — CRUD com calendário visual, alocação de equipe
- `Documentos.jsx` — Upload/download de arquivos
- `Relatorios.jsx` — Geração de relatórios PDF

---

## Verification Plan

### Automated Tests

1. **Backend API via Postman Collection** (evidência solicitada):
   ```bash
   # Executar o Postman Runner ou importar no Postman Desktop a collection em:
   # backend/postman/MaisAlegria.postman_collection.json
   ```
   Testa todas as rotas: auth, CRUD completo, validações, erros.

2. **Docker Compose Build & Run**:
   ```bash
   cd c:\Users\0201392421006\Desktop\projeto-mais_alegria
   docker-compose build
   docker-compose up -d
   # Verificar que todos os 3 serviços estão rodando:
   docker-compose ps
   # Testar API:
   curl http://localhost:3001/api/health
   # Testar Frontend:
   curl http://localhost:5173
   ```

3. **GitHub Actions CI**:
   - Push para o repositório e verificar que o workflow roda com sucesso no tab Actions.

4. **Kind Kubernetes**:
   ```bash
   kind create cluster --config k8s/kind-config.yml
   kubectl apply -f k8s/
   kubectl get pods -n mais-alegria
   ```

### Manual Verification
- Abrir o frontend no browser (`http://localhost:5173`)
- Fazer login com credenciais de seed
- Navegar por todas as telas: Dashboard, Clientes, Funcionários, Estoque, Orçamentos, Eventos, Documentos, Relatórios
- Verificar gráficos dinâmicos no Dashboard
- Gerar um relatório PDF
- Testar botão WhatsApp
- Verificar responsividade (resize do browser)
