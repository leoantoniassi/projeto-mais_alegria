# Plano de Implementação — Backend do Projeto Mais Alegria

Backend Node.js + Express + Sequelize + PostgreSQL para o sistema de gestão de eventos.

---

## User Review Required

> [!IMPORTANT]
> **ORM Sequelize** será usada para mapear o banco PostgreSQL existente (DDL em `database/init.sql`). Os nomes de colunas com prefixo (`cli_`, `fun_`, etc.) serão mapeados com `field` no Sequelize, expondo nomes mais limpos na API (ex: `cli_nome` → `nome`).

> [!IMPORTANT]
> **Autenticação JWT** com 3 níveis de acesso: `admin`, `gerente` e `operador`. Senhas encriptadas com `bcryptjs`. Token expira em 24h.

> [!WARNING]
> O `docker-compose.yml` existente (raiz) será **atualizado** para incluir o serviço `backend` ao lado do `db` já existente. Os dados do `.env` atual serão reutilizados.

> [!NOTE]
> A pasta `database/` com `init.sql` e `seed.sql` permanece na raiz — o Docker já monta esses scripts no PostgreSQL.

---

## Estrutura de Pastas

```
projeto-mais_alegria/
├── .env                          ← já existe (credenciais DB)
├── docker-compose.yml            ← ATUALIZAR (adicionar service backend)
├── database/
│   ├── init.sql                  ← já existe
│   └── seed.sql                  ← já existe
├── backend/                      ← NOVA PASTA
│   ├── package.json
│   ├── .env                      ← variáveis específicas do backend (JWT_SECRET, PORT)
│   ├── Dockerfile
│   ├── src/
│   │   ├── server.js             ← entry point
│   │   ├── app.js                ← Express app config
│   │   ├── config/
│   │   │   └── database.js       ← conexão Sequelize
│   │   ├── models/
│   │   │   ├── index.js          ← registra todos + associações
│   │   │   ├── Usuario.js
│   │   │   ├── Cliente.js
│   │   │   ├── Funcionario.js
│   │   │   ├── Produto.js
│   │   │   ├── Orcamento.js
│   │   │   ├── Evento.js
│   │   │   ├── Documento.js
│   │   │   ├── Escala.js
│   │   │   ├── EventoProduto.js
│   │   │   └── OrcamentoProduto.js
│   │   ├── controllers/
│   │   │   ├── authController.js
│   │   │   ├── clienteController.js
│   │   │   ├── funcionarioController.js
│   │   │   ├── produtoController.js
│   │   │   ├── orcamentoController.js
│   │   │   ├── eventoController.js
│   │   │   ├── documentoController.js
│   │   │   ├── escalaController.js
│   │   │   └── dashboardController.js
│   │   ├── routes/
│   │   │   ├── index.js           ← agrupa todas as rotas sob /api
│   │   │   ├── auth.routes.js
│   │   │   ├── clientes.routes.js
│   │   │   ├── funcionarios.routes.js
│   │   │   ├── produtos.routes.js
│   │   │   ├── orcamentos.routes.js
│   │   │   ├── eventos.routes.js
│   │   │   ├── documentos.routes.js
│   │   │   ├── escala.routes.js
│   │   │   └── dashboard.routes.js
│   │   ├── middleware/
│   │   │   ├── auth.js            ← verifica JWT
│   │   │   ├── roles.js           ← verifica permissão por role
│   │   │   └── errorHandler.js    ← handler global de erros
│   │   └── utils/
│   │       └── whatsapp.js        ← gera URL do WhatsApp
│   ├── uploads/                   ← diretório para arquivos (Multer)
│   │   └── .gitkeep
│   └── postman/
│       └── MaisAlegria.postman_collection.json
└── frontend/                      ← será criado depois
```

---

## Proposed Changes

### 1. Configuração do Projeto

#### [NEW] backend/package.json
- **Dependências de produção**: `express`, `sequelize`, `pg`, `pg-hstore`, `jsonwebtoken`, `bcryptjs`, `multer`, `cors`, `dotenv`, `helmet`, `express-validator`
- **Dependências de desenvolvimento**: `nodemon`, `eslint`
- **Scripts**:
  - `dev` → `nodemon src/server.js`
  - `start` → `node src/server.js`
  - `seed` → `node src/seed.js`

#### [NEW] backend/.env
```
PORT=3001
JWT_SECRET=mais_alegria_jwt_secret_2026
JWT_EXPIRES_IN=24h
DB_HOST=localhost
DB_PORT=5432
DB_USER=mais_alegria
DB_PASS=mais_alegria_2026
DB_NAME=projeto_mais_alegria
```

#### [NEW] backend/Dockerfile
- Base: `node:18-alpine`
- Copia código, instala deps, expõe porta 3001

---

### 2. Configuração do Banco (Sequelize)

#### [NEW] backend/src/config/database.js
- Conexão Sequelize usando variáveis de ambiente
- `dialect: 'postgres'`
- `define: { timestamps: false }` — gerenciamento manual de timestamps conforme DDL
- Pool de conexões configurado

---

### 3. Modelos Sequelize (10 modelos)

Cada modelo mapeia **fielmente** as colunas do DDL (`init.sql`), usando a propriedade `field` do Sequelize para expor nomes mais limpos na API.

#### [NEW] backend/src/models/Usuario.js
| Campo API    | Coluna DB       | Tipo            |
|-------------|-----------------|-----------------|
| id          | usr_id          | UUID (PK)       |
| nome        | usr_nome        | VARCHAR(150)    |
| email       | usr_email       | VARCHAR(150) UQ |
| senha       | usr_senha       | VARCHAR(255)    |
| role        | usr_role        | ENUM            |
| criadoEm    | usr_criado_em   | TIMESTAMP       |

#### [NEW] backend/src/models/Cliente.js
| Campo API      | Coluna DB           | Tipo            |
|---------------|---------------------|-----------------|
| id            | cli_id              | UUID (PK)       |
| nome          | cli_nome            | VARCHAR(150)    |
| email         | cli_email           | VARCHAR(150) UQ |
| rgCpf         | cli_rgcpf           | VARCHAR(20) UQ  |
| telefone      | cli_telefone        | VARCHAR(20)     |
| criadoEm      | cli_criado_em       | TIMESTAMP       |
| atualizadoEm  | cli_atualizado_em   | TIMESTAMP       |
| deletadoEm    | cli_deletado_em     | TIMESTAMP (soft delete) |

#### [NEW] backend/src/models/Funcionario.js
| Campo API      | Coluna DB           | Tipo            |
|---------------|---------------------|-----------------|
| id            | fun_id              | UUID (PK)       |
| nome          | fun_nome            | VARCHAR(150)    |
| email         | fun_email           | VARCHAR(150) UQ |
| telefone      | fun_telefone        | VARCHAR(20)     |
| funcao        | fun_funcao          | VARCHAR(80)     |
| criadoEm      | fun_criado_em       | TIMESTAMP       |
| atualizadoEm  | fun_atualizado_em   | TIMESTAMP       |
| deletadoEm    | fun_deletado_em     | TIMESTAMP       |

#### [NEW] backend/src/models/Produto.js
| Campo API       | Coluna DB            | Tipo            |
|----------------|----------------------|-----------------|
| id             | prd_id               | UUID (PK)       |
| nome           | prd_nome             | VARCHAR(150)    |
| categoria      | prd_categoria        | VARCHAR(80)     |
| quantidade     | prd_quantidade       | NUMERIC(10,2)   |
| unidadeMedida  | prd_unidade_medida   | VARCHAR(30)     |
| custoUnitario  | prd_custo_unitario   | NUMERIC(12,2)   |
| criadoEm       | prd_criado_em        | TIMESTAMP       |
| atualizadoEm   | prd_atualizado_em    | TIMESTAMP       |
| deletadoEm     | prd_deletado_em      | TIMESTAMP       |

#### [NEW] backend/src/models/Orcamento.js
| Campo API      | Coluna DB           | Tipo            |
|---------------|---------------------|-----------------|
| id            | orc_id              | UUID (PK)       |
| clienteId     | orc_cli_id          | UUID (FK)       |
| valorTotal    | orc_valor_total     | NUMERIC(12,2)   |
| dataValidade  | orc_data_validade   | DATE            |
| status        | orc_status          | ENUM pendente/aprovado/reprovado |
| observacoes   | orc_observacoes     | TEXT            |
| criadoEm      | orc_criado_em       | TIMESTAMP       |
| atualizadoEm  | orc_atualizado_em   | TIMESTAMP       |
| deletadoEm    | orc_deletado_em     | TIMESTAMP       |

#### [NEW] backend/src/models/Evento.js
| Campo API      | Coluna DB           | Tipo            |
|---------------|---------------------|-----------------|
| id            | evt_id              | UUID (PK)       |
| clienteId     | evt_cli_id          | UUID (FK)       |
| orcamentoId   | evt_orc_id          | UUID (FK, nullable) |
| nome          | evt_nome            | VARCHAR(200)    |
| dataEvento    | evt_data_evento     | TIMESTAMP       |
| local         | evt_local           | VARCHAR(255)    |
| status        | evt_status          | ENUM            |
| qtdPessoas    | evt_qtd_pessoas     | INT             |
| qtdAdultos    | evt_qtd_adultos     | INT             |
| qtdCriancas   | evt_qtd_criancas    | INT             |
| qtdBebes      | evt_qtd_bebes       | INT             |
| observacoes   | evt_observacoes     | TEXT            |
| criadoEm      | evt_criado_em       | TIMESTAMP       |
| atualizadoEm  | evt_atualizado_em   | TIMESTAMP       |
| deletadoEm    | evt_deletado_em     | TIMESTAMP       |

#### [NEW] backend/src/models/Documento.js
| Campo API      | Coluna DB           | Tipo            |
|---------------|---------------------|-----------------|
| id            | doc_id              | UUID (PK)       |
| clienteId     | doc_cli_id          | UUID (FK)       |
| eventoId      | doc_evt_id          | UUID (FK)       |
| nomeArquivo   | doc_nome_arquivo    | VARCHAR(255)    |
| caminhoUrl    | doc_caminho_url     | TEXT            |
| tipoArquivo   | doc_tipo_arquivo    | ENUM pdf/jpg/png |
| criadoEm      | doc_criado_em       | TIMESTAMP       |
| atualizadoEm  | doc_atualizado_em   | TIMESTAMP       |
| deletadoEm    | doc_deletado_em     | TIMESTAMP       |

#### [NEW] backend/src/models/Escala.js
| Campo API      | Coluna DB           | Tipo            |
|---------------|---------------------|-----------------|
| id            | esc_id              | UUID (PK)       |
| eventoId      | esc_evt_id          | UUID (FK)       |
| funcionarioId | esc_fun_id          | UUID (FK)       |
| observacoes   | esc_observacoes     | TEXT            |
| criadoEm      | esc_criado_em       | TIMESTAMP       |
| atualizadoEm  | esc_atualizado_em   | TIMESTAMP       |
| deletadoEm    | esc_deletado_em     | TIMESTAMP       |

#### [NEW] backend/src/models/EventoProduto.js e OrcamentoProduto.js
- Mapeiam as tabelas intermediárias N:M conforme DDL

#### [NEW] backend/src/models/index.js — Associações
```
Usuario         — sem associações diretas
Cliente   1:N   → Orcamento     (cli_id → orc_cli_id)
Cliente   1:N   → Evento        (cli_id → evt_cli_id)
Cliente   1:N   → Documento     (cli_id → doc_cli_id)
Orcamento 1:N   → Evento        (orc_id → evt_orc_id)
Evento    1:N   → Documento     (evt_id → doc_evt_id)
Evento    N:M   ↔ Funcionario   via Escala
Evento    N:M   ↔ Produto       via EventoProduto
Orcamento N:M   ↔ Produto       via OrcamentoProduto
```

---

### 4. Middleware

#### [NEW] backend/src/middleware/auth.js
- Extrai token do header `Authorization: Bearer <token>`
- Verifica com `jsonwebtoken` e injeta `req.user` (id, email, role)
- Retorna 401 se não autenticado

#### [NEW] backend/src/middleware/roles.js
- Função factory: `authorize('admin', 'gerente')` 
- Verifica se `req.user.role` está na lista permitida
- Retorna 403 se não autorizado

#### [NEW] backend/src/middleware/errorHandler.js
- Captura erros de validação do Sequelize (UniqueConstraint, Validation)
- Retorna JSON padronizado: `{ success: false, message, errors }`

---

### 5. Rotas da API

Todas as rotas são prefixadas com `/api`.

#### [NEW] Auth — `POST /api/auth/login` e `POST /api/auth/register`
| Método | Rota                | Acesso    | Descrição        |
|--------|---------------------|-----------|------------------|
| POST   | /api/auth/register  | Público   | Cria usuário     |
| POST   | /api/auth/login     | Público   | Retorna JWT      |

#### [NEW] Clientes — `/api/clientes`
| Método | Rota                        | Acesso             | Descrição              |
|--------|-----------------------------|---------------------|------------------------|
| GET    | /api/clientes               | Autenticado         | Lista todos (paginado) |
| GET    | /api/clientes/:id           | Autenticado         | Busca por ID           |
| POST   | /api/clientes               | Autenticado         | Cria novo              |
| PUT    | /api/clientes/:id           | Autenticado         | Atualiza               |
| DELETE | /api/clientes/:id           | Admin/Gerente       | Soft delete            |
| GET    | /api/clientes/:id/whatsapp  | Autenticado         | Retorna link WhatsApp  |

#### [NEW] Funcionários — `/api/funcionarios`
| Método | Rota                       | Acesso             | Descrição                   |
|--------|----------------------------|---------------------|-----------------------------|
| GET    | /api/funcionarios          | Autenticado         | Lista (filtro por `funcao`) |
| GET    | /api/funcionarios/:id      | Autenticado         | Busca por ID                |
| POST   | /api/funcionarios          | Autenticado         | Cria novo                   |
| PUT    | /api/funcionarios/:id      | Autenticado         | Atualiza                    |
| DELETE | /api/funcionarios/:id      | Admin/Gerente       | Soft delete                 |

#### [NEW] Produtos — `/api/produtos`
| Método | Rota                  | Acesso        | Descrição           |
|--------|-----------------------|---------------|---------------------|
| GET    | /api/produtos         | Autenticado   | Lista todos         |
| GET    | /api/produtos/:id     | Autenticado   | Busca por ID        |
| POST   | /api/produtos         | Autenticado   | Cria novo           |
| PUT    | /api/produtos/:id     | Autenticado   | Atualiza            |
| DELETE | /api/produtos/:id     | Admin/Gerente | Soft delete         |

#### [NEW] Orçamentos — `/api/orcamentos`
| Método | Rota                              | Acesso        | Descrição                    |
|--------|-----------------------------------|---------------|------------------------------|
| GET    | /api/orcamentos                   | Autenticado   | Lista (filtro por status)    |
| GET    | /api/orcamentos/:id               | Autenticado   | Busca por ID (com produtos)  |
| POST   | /api/orcamentos                   | Autenticado   | Cria com produtos            |
| PUT    | /api/orcamentos/:id               | Autenticado   | Atualiza                     |
| PATCH  | /api/orcamentos/:id/status        | Admin/Gerente | Muda status                  |
| DELETE | /api/orcamentos/:id               | Admin/Gerente | Soft delete                  |

#### [NEW] Eventos — `/api/eventos`
| Método | Rota                              | Acesso        | Descrição                    |
|--------|-----------------------------------|---------------|------------------------------|
| GET    | /api/eventos                      | Autenticado   | Lista (filtro por status)    |
| GET    | /api/eventos/:id                  | Autenticado   | Busca por ID (com equipe)    |
| POST   | /api/eventos                      | Autenticado   | Cria evento                  |
| PUT    | /api/eventos/:id                  | Autenticado   | Atualiza                     |
| PATCH  | /api/eventos/:id/status           | Admin/Gerente | Muda status                  |
| DELETE | /api/eventos/:id                  | Admin/Gerente | Soft delete                  |

#### [NEW] Escala — `/api/escala`
| Método | Rota                              | Acesso        | Descrição                        |
|--------|-----------------------------------|---------------|----------------------------------|
| POST   | /api/escala                       | Autenticado   | Aloca funcionário em evento      |
| DELETE | /api/escala/:id                   | Autenticado   | Remove alocação                  |
| GET    | /api/escala/evento/:eventoId      | Autenticado   | Lista equipe do evento           |

#### [NEW] Documentos — `/api/documentos`
| Método | Rota                              | Acesso        | Descrição                    |
|--------|-----------------------------------|---------------|------------------------------|
| GET    | /api/documentos                   | Autenticado   | Lista (filtro por cliente/evento) |
| POST   | /api/documentos/upload            | Autenticado   | Upload de arquivo (Multer)   |
| GET    | /api/documentos/:id/download      | Autenticado   | Download do arquivo          |
| DELETE | /api/documentos/:id               | Admin/Gerente | Soft delete                  |

#### [NEW] Dashboard — `/api/dashboard`
| Método | Rota                     | Acesso        | Descrição                    |
|--------|--------------------------|---------------|------------------------------|
| GET    | /api/dashboard/stats     | Autenticado   | Contadores gerais            |
| GET    | /api/dashboard/proximos-eventos | Autenticado | Próximos 5 eventos   |

#### Health Check
| Método | Rota          | Acesso  | Descrição           |
|--------|---------------|---------|---------------------|
| GET    | /api/health   | Público | Status da API       |

---

### 6. Regras de Negócio Implementadas

| Regra | Implementação |
|-------|--------------|
| **RN1** - Cadastro único CPF/email | Constraint UNIQUE no DB + validação no controller com mensagem amigável |
| **RN2** - Sem conflito de horário | Validação no `escalaController`: verifica se o funcionário tem evento no mesmo dia/horário antes de alocar |
| **RN3** - Documentos: apenas admin pode excluir | Middleware `authorize('admin')` na rota DELETE de documentos |
| **RN3** - Formatos aceitos | Validação no Multer: aceita apenas `.pdf`, `.jpg`, `.png` |
| **RN4** - Controle de público > 50 | Validação no `eventoController`: se `qtdPessoas > 50`, exige `qtdAdultos`, `qtdCriancas`, `qtdBebes` preenchidos |
| **RN Canvas 2** - Evento confirmado requer orçamento aprovado | Validação no `eventoController`: status `confirmado` exige `orcamentoId` com status `aprovado` |

---

### 7. Docker

#### [MODIFY] docker-compose.yml (raiz)
- Adicionar serviço `backend` que depende de `db`
- Montar volume para `uploads/`
- Expor porta 3001

---

## Plano de Verificação

### Testes com Postman
1. Subir DB com `docker-compose up db`
2. Rodar seed: `npm run seed` no backend
3. Testar todas as rotas documentadas acima no Postman

### Testes Manuais no Terminal
```bash
cd backend
npm install
npm run dev
# Em outro terminal:
curl http://localhost:3001/api/health
```

---

## Open Questions

> [!IMPORTANT]
> **Registro de usuários**: O endpoint `POST /api/auth/register` deve ser **público** (qualquer pessoa cria conta) ou **restrito a admin** (apenas admin cria novos usuários)? No plano atual, deixei como público para facilitar o desenvolvimento, mas posso restringir.

> [!IMPORTANT]
> **Upload de documentos**: Deve salvar os arquivos **localmente** no servidor (pasta `uploads/`) ou deseja integrar com algum serviço de cloud storage (S3, etc.)? No plano atual, uso armazenamento local com Multer.
