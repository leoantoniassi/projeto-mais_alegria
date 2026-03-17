-- ============================================================
-- PROJETO MAIS ALEGRIA - DDL (PostgreSQL)
-- Script de criação do banco de dados
-- Padrão: Tabelas em MAIÚSCULO, colunas com prefixo da tabela
-- ============================================================

CREATE DATABASE projeto_mais_alegria;

-- NOTA: No DBeaver, após criar o banco, conecte-se a ele antes de continuar.

-- Remove tabelas existentes (em ordem reversa de dependência)
DROP TABLE IF EXISTS ORCAMENTO_PRODUTO CASCADE;
DROP TABLE IF EXISTS EVENTO_PRODUTO    CASCADE;
DROP TABLE IF EXISTS ESCALA            CASCADE;
DROP TABLE IF EXISTS DOCUMENTOS        CASCADE;
DROP TABLE IF EXISTS EVENTOS           CASCADE;
DROP TABLE IF EXISTS ORCAMENTOS        CASCADE;
DROP TABLE IF EXISTS PRODUTOS          CASCADE;
DROP TABLE IF EXISTS FUNCIONARIOS      CASCADE;
DROP TABLE IF EXISTS CLIENTES          CASCADE;

-- ============================================================
-- 1. CLIENTES
-- ============================================================
CREATE TABLE CLIENTES (
    CLI_ID           SERIAL       PRIMARY KEY,
    CLI_NOME         VARCHAR(150) NOT NULL,
    CLI_EMAIL        VARCHAR(150) NOT NULL,
    CLI_RGCPF        VARCHAR(20)  NOT NULL,
    CLI_TELEFONE     VARCHAR(20)  NOT NULL,
    CLI_CRIADO_EM    TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CLI_ATUALIZADO_EM TIMESTAMP   NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CLI_DELETADO_EM   TIMESTAMP,

    CONSTRAINT UQ_CLIENTES_RGCPF UNIQUE (CLI_RGCPF),
    CONSTRAINT UQ_CLIENTES_EMAIL UNIQUE (CLI_EMAIL)
);

COMMENT ON TABLE  CLIENTES              IS 'Armazena os dados pessoais e de contato dos clientes.';
COMMENT ON COLUMN CLIENTES.CLI_RGCPF    IS 'RG ou CPF do cliente (campo único).';
COMMENT ON COLUMN CLIENTES.CLI_TELEFONE IS 'Número de telefone utilizado para contato e atalho WhatsApp.';

-- ============================================================
-- 2. FUNCIONARIOS
-- ============================================================
CREATE TABLE FUNCIONARIOS (
    FUN_ID           SERIAL       PRIMARY KEY,
    FUN_NOME         VARCHAR(150) NOT NULL,
    FUN_EMAIL        VARCHAR(150) NOT NULL,
    FUN_TELEFONE     VARCHAR(20),
    FUN_FUNCAO       VARCHAR(80)  NOT NULL,
    FUN_CRIADO_EM    TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FUN_ATUALIZADO_EM TIMESTAMP   NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FUN_DELETADO_EM   TIMESTAMP,

    CONSTRAINT UQ_FUNCIONARIOS_EMAIL UNIQUE (FUN_EMAIL)
);

COMMENT ON TABLE  FUNCIONARIOS            IS 'Armazena os dados dos colaboradores e suas funções operacionais.';
COMMENT ON COLUMN FUNCIONARIOS.FUN_FUNCAO IS 'Função exercida pelo funcionário (ex: Recreador, Garçom, Cozinheiro).';

-- ============================================================
-- 3. PRODUTOS (ESTOQUE)
-- ============================================================
CREATE TABLE PRODUTOS (
    PRD_ID              SERIAL        PRIMARY KEY,
    PRD_NOME            VARCHAR(150)  NOT NULL,
    PRD_CATEGORIA       VARCHAR(80)   NOT NULL,
    PRD_QUANTIDADE      NUMERIC(10,2) NOT NULL DEFAULT 0,
    PRD_UNIDADE_MEDIDA  VARCHAR(30)   NOT NULL,
    PRD_CUSTO_UNITARIO  NUMERIC(12,2) NOT NULL DEFAULT 0,
    PRD_CRIADO_EM       TIMESTAMP     NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRD_ATUALIZADO_EM   TIMESTAMP     NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRD_DELETADO_EM      TIMESTAMP
);

COMMENT ON TABLE  PRODUTOS                    IS 'Inventário de itens disponíveis (alimentos, bebidas, descartáveis, etc.).';
COMMENT ON COLUMN PRODUTOS.PRD_CATEGORIA      IS 'Categoria do produto (ex: Alimento, Bebida, Descartável).';
COMMENT ON COLUMN PRODUTOS.PRD_UNIDADE_MEDIDA IS 'Unidade de medida (ex: un, kg, L, pct).';

-- ============================================================
-- 4. ORCAMENTOS
-- ============================================================
CREATE TABLE ORCAMENTOS (
    ORC_ID              SERIAL        PRIMARY KEY,
    ORC_CLI_ID          INT           NOT NULL,
    ORC_VALOR_TOTAL     NUMERIC(12,2) NOT NULL DEFAULT 0,
    ORC_DATA_VALIDADE   DATE,
    ORC_STATUS          VARCHAR(20)   NOT NULL DEFAULT 'pendente',
    ORC_OBSERVACOES     TEXT,
    ORC_CRIADO_EM       TIMESTAMP     NOT NULL DEFAULT CURRENT_TIMESTAMP,
    ORC_ATUALIZADO_EM   TIMESTAMP     NOT NULL DEFAULT CURRENT_TIMESTAMP,
    ORC_DELETADO_EM      TIMESTAMP,

    CONSTRAINT FK_ORCAMENTOS_CLIENTE
        FOREIGN KEY (ORC_CLI_ID) REFERENCES CLIENTES (CLI_ID)
        ON UPDATE CASCADE ON DELETE RESTRICT,

    CONSTRAINT CK_ORCAMENTOS_STATUS
        CHECK (ORC_STATUS IN ('pendente', 'aprovado', 'reprovado'))
);

COMMENT ON TABLE  ORCAMENTOS            IS 'Propostas financeiras geradas para os clientes.';
COMMENT ON COLUMN ORCAMENTOS.ORC_STATUS IS 'Status do orçamento: pendente, aprovado ou reprovado.';

-- ============================================================
-- 5. EVENTOS
-- ============================================================
CREATE TABLE EVENTOS (
    EVT_ID             SERIAL       PRIMARY KEY,
    EVT_CLI_ID         INT          NOT NULL,
    EVT_ORC_ID         INT,
    EVT_NOME           VARCHAR(200) NOT NULL,
    EVT_DATA_EVENTO    TIMESTAMP    NOT NULL,
    EVT_LOCAL          VARCHAR(255),
    EVT_STATUS         VARCHAR(30)  NOT NULL DEFAULT 'pendente',
    EVT_OBSERVACOES    TEXT,
    EVT_CRIADO_EM      TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,
    EVT_ATUALIZADO_EM  TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,
    EVT_DELETADO_EM    TIMESTAMP,

    CONSTRAINT FK_EVENTOS_CLIENTE
        FOREIGN KEY (EVT_CLI_ID) REFERENCES CLIENTES (CLI_ID)
        ON UPDATE CASCADE ON DELETE RESTRICT,

    CONSTRAINT FK_EVENTOS_ORCAMENTO
        FOREIGN KEY (EVT_ORC_ID) REFERENCES ORCAMENTOS (ORC_ID)
        ON UPDATE CASCADE ON DELETE SET NULL,

    CONSTRAINT CK_EVENTOS_STATUS
        CHECK (EVT_STATUS IN ('pendente', 'confirmado', 'concluido', 'cancelado'))
);

COMMENT ON TABLE  EVENTOS            IS 'Detalhes das festas/eventos realizados.';
COMMENT ON COLUMN EVENTOS.EVT_ORC_ID IS 'Orçamento que originou o evento (opcional).';
COMMENT ON COLUMN EVENTOS.EVT_STATUS IS 'Um evento só pode ser Confirmado se houver um orçamento aprovado (RN2).';

-- ============================================================
-- 6. DOCUMENTOS
-- ============================================================
CREATE TABLE DOCUMENTOS (
    DOC_ID           SERIAL       PRIMARY KEY,
    DOC_CLI_ID       INT,
    DOC_EVT_ID       INT,
    DOC_NOME_ARQUIVO VARCHAR(255) NOT NULL,
    DOC_CAMINHO_URL  TEXT         NOT NULL,
    DOC_TIPO_ARQUIVO VARCHAR(10)  NOT NULL,
    DOC_CRIADO_EM    TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,
    DOC_ATUALIZADO_EM TIMESTAMP   NOT NULL DEFAULT CURRENT_TIMESTAMP,
    DOC_DELETADO_EM  TIMESTAMP,

    CONSTRAINT FK_DOCUMENTOS_CLIENTE
        FOREIGN KEY (DOC_CLI_ID) REFERENCES CLIENTES (CLI_ID)
        ON UPDATE CASCADE ON DELETE SET NULL,

    CONSTRAINT FK_DOCUMENTOS_EVENTO
        FOREIGN KEY (DOC_EVT_ID) REFERENCES EVENTOS (EVT_ID)
        ON UPDATE CASCADE ON DELETE SET NULL,

    CONSTRAINT CK_DOCUMENTOS_TIPO
        CHECK (DOC_TIPO_ARQUIVO IN ('pdf', 'jpg', 'png'))
);

COMMENT ON TABLE  DOCUMENTOS                  IS 'Armazena o caminho/URL dos arquivos (contratos, etc.) vinculados a clientes ou eventos.';
COMMENT ON COLUMN DOCUMENTOS.DOC_TIPO_ARQUIVO IS 'Extensão aceita: pdf, jpg ou png (RN4).';

-- ============================================================
-- 7. ESCALA (Evento ↔ Funcionário — N:M)
-- ============================================================
CREATE TABLE ESCALA (
    ESC_ID             SERIAL    PRIMARY KEY,
    ESC_EVT_ID         INT       NOT NULL,
    ESC_FUN_ID         INT       NOT NULL,
    ESC_OBSERVACOES    TEXT,
    ESC_CRIADO_EM      TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    ESC_ATUALIZADO_EM  TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    ESC_DELETADO_EM    TIMESTAMP,

    CONSTRAINT FK_ESCALA_EVENTO
        FOREIGN KEY (ESC_EVT_ID) REFERENCES EVENTOS (EVT_ID)
        ON UPDATE CASCADE ON DELETE CASCADE,

    CONSTRAINT FK_ESCALA_FUNCIONARIO
        FOREIGN KEY (ESC_FUN_ID) REFERENCES FUNCIONARIOS (FUN_ID)
        ON UPDATE CASCADE ON DELETE CASCADE,

    CONSTRAINT UQ_ESCALA_EVENTO_FUNCIONARIO
        UNIQUE (ESC_EVT_ID, ESC_FUN_ID)
);

COMMENT ON TABLE ESCALA IS 'Tabela intermediária (N:M) que registra a alocação de funcionários em eventos.';

-- ============================================================
-- 8. EVENTO_PRODUTO (Evento ↔ Produto — N:M)
-- ============================================================
CREATE TABLE EVENTO_PRODUTO (
    EVP_ID           SERIAL        PRIMARY KEY,
    EVP_EVT_ID       INT           NOT NULL,
    EVP_PRD_ID       INT           NOT NULL,
    EVP_QUANTIDADE   NUMERIC(10,2) NOT NULL DEFAULT 0,
    EVP_CRIADO_EM    TIMESTAMP     NOT NULL DEFAULT CURRENT_TIMESTAMP,
    EVP_ATUALIZADO_EM TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,
    EVP_DELETADO_EM  TIMESTAMP,

    CONSTRAINT FK_EVENTO_PRODUTO_EVENTO
        FOREIGN KEY (EVP_EVT_ID) REFERENCES EVENTOS (EVT_ID)
        ON UPDATE CASCADE ON DELETE CASCADE,

    CONSTRAINT FK_EVENTO_PRODUTO_PRODUTO
        FOREIGN KEY (EVP_PRD_ID) REFERENCES PRODUTOS (PRD_ID)
        ON UPDATE CASCADE ON DELETE RESTRICT,

    CONSTRAINT UQ_EVENTO_PRODUTO
        UNIQUE (EVP_EVT_ID, EVP_PRD_ID)
);

COMMENT ON TABLE EVENTO_PRODUTO IS 'Registra quais produtos e quantidades serão consumidos em cada evento.';

-- ============================================================
-- 9. ORCAMENTO_PRODUTO (Orçamento ↔ Produto — N:M)
-- ============================================================
CREATE TABLE ORCAMENTO_PRODUTO (
    ORP_ID             SERIAL        PRIMARY KEY,
    ORP_ORC_ID         INT           NOT NULL,
    ORP_PRD_ID         INT           NOT NULL,
    ORP_QUANTIDADE     NUMERIC(10,2) NOT NULL DEFAULT 0,
    ORP_PRECO_UNITARIO NUMERIC(12,2) NOT NULL DEFAULT 0,
    ORP_CRIADO_EM      TIMESTAMP     NOT NULL DEFAULT CURRENT_TIMESTAMP,
    ORP_ATUALIZADO_EM  TIMESTAMP     NOT NULL DEFAULT CURRENT_TIMESTAMP,
    ORP_DELETADO_EM    TIMESTAMP,

    CONSTRAINT FK_ORCAMENTO_PRODUTO_ORCAMENTO
        FOREIGN KEY (ORP_ORC_ID) REFERENCES ORCAMENTOS (ORC_ID)
        ON UPDATE CASCADE ON DELETE CASCADE,

    CONSTRAINT FK_ORCAMENTO_PRODUTO_PRODUTO
        FOREIGN KEY (ORP_PRD_ID) REFERENCES PRODUTOS (PRD_ID)
        ON UPDATE CASCADE ON DELETE RESTRICT,

    CONSTRAINT UQ_ORCAMENTO_PRODUTO
        UNIQUE (ORP_ORC_ID, ORP_PRD_ID)
);

COMMENT ON TABLE ORCAMENTO_PRODUTO                IS 'Registra quais produtos e quantidades foram listados em cada orçamento.';
COMMENT ON COLUMN ORCAMENTO_PRODUTO.ORP_PRECO_UNITARIO IS 'Preço unitário do produto no momento do orçamento (snapshot).';

-- ============================================================
-- ÍNDICES ADICIONAIS PARA PERFORMANCE
-- ============================================================
CREATE INDEX IDX_ORCAMENTOS_CLIENTE     ON ORCAMENTOS       (ORC_CLI_ID);
CREATE INDEX IDX_ORCAMENTOS_STATUS      ON ORCAMENTOS       (ORC_STATUS);
CREATE INDEX IDX_EVENTOS_CLIENTE        ON EVENTOS           (EVT_CLI_ID);
CREATE INDEX IDX_EVENTOS_ORCAMENTO      ON EVENTOS           (EVT_ORC_ID);
CREATE INDEX IDX_EVENTOS_DATA           ON EVENTOS           (EVT_DATA_EVENTO);
CREATE INDEX IDX_DOCUMENTOS_CLIENTE     ON DOCUMENTOS        (DOC_CLI_ID);
CREATE INDEX IDX_DOCUMENTOS_EVENTO      ON DOCUMENTOS        (DOC_EVT_ID);
CREATE INDEX IDX_ESCALA_EVENTO          ON ESCALA            (ESC_EVT_ID);
CREATE INDEX IDX_ESCALA_FUNCIONARIO     ON ESCALA            (ESC_FUN_ID);
CREATE INDEX IDX_EVENTO_PRODUTO_EVENTO  ON EVENTO_PRODUTO    (EVP_EVT_ID);
CREATE INDEX IDX_ORCAMENTO_PRODUTO_ORC  ON ORCAMENTO_PRODUTO (ORP_ORC_ID);
