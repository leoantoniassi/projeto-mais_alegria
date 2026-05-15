-- ============================================================
-- PROJETO MAIS ALEGRIA - DDL (PostgreSQL)
-- Script de inicialização para Docker
-- O banco 'projeto_mais_alegria' é criado automaticamente
-- pelo Docker via variável POSTGRES_DB
-- ============================================================

-- Ativando a extensão nativa para UUID
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Remove tabelas existentes (em ordem reversa de dependência)
DROP TABLE IF EXISTS orcamento_produto CASCADE;
DROP TABLE IF EXISTS evento_produto    CASCADE;
DROP TABLE IF EXISTS escala            CASCADE;
DROP TABLE IF EXISTS documentos        CASCADE;
DROP TABLE IF EXISTS catalogos         CASCADE;
DROP TABLE IF EXISTS eventos           CASCADE;
DROP TABLE IF EXISTS orcamentos        CASCADE;
DROP TABLE IF EXISTS produtos          CASCADE;
DROP TABLE IF EXISTS funcionarios      CASCADE;
DROP TABLE IF EXISTS fornecedores      CASCADE;
DROP TABLE IF EXISTS clientes          CASCADE;
DROP TABLE IF EXISTS usuarios          CASCADE;

-- ============================================================
-- 0. USUARIOS
-- ============================================================
CREATE TABLE usuarios (
    usr_id        UUID         PRIMARY KEY DEFAULT uuid_generate_v4(),
    usr_nome      VARCHAR(150) NOT NULL,
    usr_email     VARCHAR(150) NOT NULL UNIQUE,
    usr_senha     VARCHAR(255) NOT NULL,
    usr_role      VARCHAR(20)  NOT NULL DEFAULT 'operador',
    usr_criado_em TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT ck_usuarios_role CHECK (usr_role IN ('admin', 'gerente', 'operador'))
);

COMMENT ON TABLE  usuarios          IS 'Usuários do sistema com controle de acesso por role.';
COMMENT ON COLUMN usuarios.usr_role IS 'Papel no sistema: admin, gerente ou operador.';

-- ============================================================
-- 1. CLIENTES
-- ============================================================
CREATE TABLE clientes (
    cli_id            UUID         PRIMARY KEY DEFAULT uuid_generate_v4(),
    cli_nome          VARCHAR(150) NOT NULL,
    cli_email         VARCHAR(150) NOT NULL,
    cli_rgcpf         VARCHAR(20)  NOT NULL,
    cli_telefone      VARCHAR(20)  NOT NULL,
    cli_criado_em     TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,
    cli_atualizado_em TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,
    cli_deletado_em   TIMESTAMP,

    CONSTRAINT uq_clientes_rgcpf UNIQUE (cli_rgcpf),
    CONSTRAINT uq_clientes_email UNIQUE (cli_email)
);

-- ============================================================
-- 2. FORNECEDORES
-- ============================================================
CREATE TABLE fornecedores (
    for_id            UUID         PRIMARY KEY DEFAULT uuid_generate_v4(),
    for_nome          VARCHAR(150) NOT NULL,
    for_email         VARCHAR(150) NOT NULL,
    for_cnpj          VARCHAR(20)  NOT NULL,
    for_telefone      VARCHAR(20)  NOT NULL,
    for_categoria     VARCHAR(80)  NOT NULL,
    for_criado_em     TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,
    for_atualizado_em TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,
    for_deletado_em   TIMESTAMP,

    CONSTRAINT uq_fornecedores_cnpj  UNIQUE (for_cnpj),
    CONSTRAINT uq_fornecedores_email UNIQUE (for_email)
);

COMMENT ON TABLE  fornecedores              IS 'Fornecedores de produtos e serviços para os eventos.';
COMMENT ON COLUMN fornecedores.for_categoria IS 'Categoria do fornecedor: Alimentos, Bebidas, Decoração, etc.';

-- ============================================================
-- 3. FUNCIONARIOS
-- ============================================================
CREATE TABLE funcionarios (
    fun_id            UUID         PRIMARY KEY DEFAULT uuid_generate_v4(),
    fun_nome          VARCHAR(150) NOT NULL,
    fun_email         VARCHAR(150) NOT NULL,
    fun_telefone      VARCHAR(20),
    fun_funcao        VARCHAR(80)  NOT NULL,
    fun_criado_em     TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,
    fun_atualizado_em TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,
    fun_deletado_em   TIMESTAMP,

    CONSTRAINT uq_funcionarios_email UNIQUE (fun_email)
);

-- ============================================================
-- 3. PRODUTOS (ESTOQUE)
-- ============================================================
CREATE TABLE produtos (
    prd_id              UUID          PRIMARY KEY DEFAULT uuid_generate_v4(),
    prd_nome            VARCHAR(150)  NOT NULL,
    prd_categoria       VARCHAR(80)   NOT NULL,
    prd_quantidade      NUMERIC(10,2) NOT NULL DEFAULT 0,
    prd_unidade_medida  VARCHAR(30)   NOT NULL,
    prd_custo_unitario  NUMERIC(12,2) NOT NULL DEFAULT 0,
    prd_criado_em       TIMESTAMP     NOT NULL DEFAULT CURRENT_TIMESTAMP,
    prd_atualizado_em   TIMESTAMP     NOT NULL DEFAULT CURRENT_TIMESTAMP,
    prd_deletado_em     TIMESTAMP
);

-- ============================================================
-- 4. ORCAMENTOS
-- ============================================================
CREATE TABLE orcamentos (
    orc_id              UUID          PRIMARY KEY DEFAULT uuid_generate_v4(),
    orc_cli_id          UUID          NOT NULL,
    orc_valor_total     NUMERIC(12,2) NOT NULL DEFAULT 0,
    orc_data_validade   DATE,
    orc_status          VARCHAR(20)   NOT NULL DEFAULT 'pendente',
    orc_local           VARCHAR(255), -- NOVA COLUNA DE LOCAL AQUI
    orc_observacoes     TEXT,
    orc_criado_em       TIMESTAMP     NOT NULL DEFAULT CURRENT_TIMESTAMP,
    orc_atualizado_em   TIMESTAMP     NOT NULL DEFAULT CURRENT_TIMESTAMP,
    orc_deletado_em     TIMESTAMP,

    CONSTRAINT fk_orcamentos_cliente
        FOREIGN KEY (orc_cli_id) REFERENCES clientes (cli_id)
        ON UPDATE CASCADE ON DELETE RESTRICT,

    CONSTRAINT ck_orcamentos_status
        CHECK (orc_status IN ('pendente', 'aprovado', 'reprovado'))
);

-- ============================================================
-- 5. EVENTOS
-- ============================================================
CREATE TABLE eventos (
    evt_id              UUID          PRIMARY KEY DEFAULT uuid_generate_v4(),
    evt_cli_id          UUID          NOT NULL,
    evt_orc_id          UUID,
    evt_nome            VARCHAR(150)  NOT NULL,
    evt_data_evento     TIMESTAMP     NOT NULL,
    evt_local           VARCHAR(255), -- NOVA COLUNA DE LOCAL AQUI
    evt_status          VARCHAR(20)   NOT NULL DEFAULT 'pendente',
    evt_qtd_pessoas     INTEGER       NOT NULL DEFAULT 0,
    evt_qtd_adultos     INTEGER       NOT NULL DEFAULT 0,
    evt_qtd_criancas    INTEGER       NOT NULL DEFAULT 0,
    evt_qtd_bebes       INTEGER       NOT NULL DEFAULT 0,
    evt_observacoes     TEXT,
    evt_criado_em       TIMESTAMP     NOT NULL DEFAULT CURRENT_TIMESTAMP,
    evt_atualizado_em   TIMESTAMP     NOT NULL DEFAULT CURRENT_TIMESTAMP,
    evt_deletado_em     TIMESTAMP,

    CONSTRAINT fk_eventos_cliente
        FOREIGN KEY (evt_cli_id) REFERENCES clientes (cli_id)
        ON UPDATE CASCADE ON DELETE RESTRICT,

    CONSTRAINT fk_eventos_orcamento
        FOREIGN KEY (evt_orc_id) REFERENCES orcamentos (orc_id)
        ON UPDATE CASCADE ON DELETE SET NULL,

    CONSTRAINT ck_eventos_status
        CHECK (evt_status IN ('pendente', 'confirmado', 'cancelado', 'concluido'))
);

-- ============================================================
-- 6. DOCUMENTOS
-- ============================================================
CREATE TABLE documentos (
    doc_id           UUID         PRIMARY KEY DEFAULT uuid_generate_v4(),
    doc_cli_id       UUID,
    doc_evt_id       UUID,
    doc_nome_arquivo VARCHAR(255) NOT NULL,
    doc_caminho_url  TEXT         NOT NULL,
    doc_tipo_arquivo VARCHAR(10)  NOT NULL,
    doc_criado_em    TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,
    doc_atualizado_em TIMESTAMP   NOT NULL DEFAULT CURRENT_TIMESTAMP,
    doc_deletado_em  TIMESTAMP,

    CONSTRAINT fk_documentos_cliente
        FOREIGN KEY (doc_cli_id) REFERENCES clientes (cli_id)
        ON UPDATE CASCADE ON DELETE SET NULL,

    CONSTRAINT fk_documentos_evento
        FOREIGN KEY (doc_evt_id) REFERENCES eventos (evt_id)
        ON UPDATE CASCADE ON DELETE SET NULL,

    CONSTRAINT ck_documentos_tipo
        CHECK (doc_tipo_arquivo IN ('pdf', 'jpg', 'png'))
);

-- ============================================================
-- 7. CATÁLOGOS DE BUFFET
-- ============================================================
CREATE TABLE catalogos (
    cat_id           UUID          PRIMARY KEY DEFAULT uuid_generate_v4(),
    cat_titulo       VARCHAR(200)  NOT NULL,
    cat_descricao    TEXT,
    cat_preco_base   NUMERIC(12,2),
    cat_url_externa  TEXT,
    cat_imagem_url   TEXT,
    cat_ativo        BOOLEAN       NOT NULL DEFAULT true,
    cat_criado_em    TIMESTAMP     NOT NULL DEFAULT CURRENT_TIMESTAMP,
    cat_atualizado_em TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,
    cat_deletado_em  TIMESTAMP
);

COMMENT ON TABLE  catalogos             IS 'Catálogos de buffet para envio via WhatsApp.';
COMMENT ON COLUMN catalogos.cat_url_externa IS 'Link externo (Google Drive, Canva, etc.) para o catálogo.';
COMMENT ON COLUMN catalogos.cat_imagem_url  IS 'URL da imagem de capa do catálogo (upload interno).';

-- ============================================================
-- 8. ESCALA (Evento ↔ Funcionário)
-- ============================================================
CREATE TABLE escala (
    esc_id            UUID      PRIMARY KEY DEFAULT uuid_generate_v4(),
    esc_evt_id        UUID      NOT NULL,
    esc_fun_id        UUID      NOT NULL,
    esc_observacoes   TEXT,
    esc_criado_em     TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    esc_atualizado_em TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    esc_deletado_em   TIMESTAMP,

    CONSTRAINT fk_escala_evento
        FOREIGN KEY (esc_evt_id) REFERENCES eventos (evt_id)
        ON UPDATE CASCADE ON DELETE CASCADE,

    CONSTRAINT fk_escala_funcionario
        FOREIGN KEY (esc_fun_id) REFERENCES funcionarios (fun_id)
        ON UPDATE CASCADE ON DELETE CASCADE,

    CONSTRAINT uq_escala_evento_funcionario
        UNIQUE (esc_evt_id, esc_fun_id)
);

-- ============================================================
-- 8. EVENTO_PRODUTO
-- ============================================================
CREATE TABLE evento_produto (
    evp_id            UUID          PRIMARY KEY DEFAULT uuid_generate_v4(),
    evp_evt_id        UUID          NOT NULL,
    evp_prd_id        UUID          NOT NULL,
    evp_quantidade    NUMERIC(10,2) NOT NULL DEFAULT 0,
    evp_criado_em     TIMESTAMP     NOT NULL DEFAULT CURRENT_TIMESTAMP,
    evp_atualizado_em TIMESTAMP     NOT NULL DEFAULT CURRENT_TIMESTAMP,
    evp_deletado_em   TIMESTAMP,

    CONSTRAINT fk_evento_produto_evento
        FOREIGN KEY (evp_evt_id) REFERENCES eventos (evt_id)
        ON UPDATE CASCADE ON DELETE CASCADE,

    CONSTRAINT fk_evento_produto_produto
        FOREIGN KEY (evp_prd_id) REFERENCES produtos (prd_id)
        ON UPDATE CASCADE ON DELETE RESTRICT,

    CONSTRAINT uq_evento_produto
        UNIQUE (evp_evt_id, evp_prd_id)
);

-- ============================================================
-- 9. ORCAMENTO_PRODUTO
-- ============================================================
CREATE TABLE orcamento_produto (
    orp_id             UUID          PRIMARY KEY DEFAULT uuid_generate_v4(),
    orp_orc_id         UUID          NOT NULL,
    orp_prd_id         UUID          NOT NULL,
    orp_quantidade     NUMERIC(10,2) NOT NULL DEFAULT 0,
    orp_preco_unitario NUMERIC(12,2) NOT NULL DEFAULT 0,
    orp_criado_em      TIMESTAMP     NOT NULL DEFAULT CURRENT_TIMESTAMP,
    orp_atualizado_em  TIMESTAMP     NOT NULL DEFAULT CURRENT_TIMESTAMP,
    orp_deletado_em    TIMESTAMP,

    CONSTRAINT fk_orcamento_produto_orcamento
        FOREIGN KEY (orp_orc_id) REFERENCES orcamentos (orc_id)
        ON UPDATE CASCADE ON DELETE CASCADE,

    CONSTRAINT fk_orcamento_produto_produto
        FOREIGN KEY (orp_prd_id) REFERENCES produtos (prd_id)
        ON UPDATE CASCADE ON DELETE RESTRICT,

    CONSTRAINT uq_orcamento_produto
        UNIQUE (orp_orc_id, orp_prd_id)
);

-- ============================================================
-- ÍNDICES ADICIONAIS
-- ============================================================
CREATE INDEX idx_fornecedores_categoria ON fornecedores     (for_categoria);
CREATE INDEX idx_orcamentos_cliente     ON orcamentos       (orc_cli_id);
CREATE INDEX idx_orcamentos_status      ON orcamentos       (orc_status);
CREATE INDEX idx_eventos_cliente        ON eventos          (evt_cli_id);
CREATE INDEX idx_eventos_orcamento      ON eventos          (evt_orc_id);
CREATE INDEX idx_eventos_data           ON eventos          (evt_data_evento);
CREATE INDEX idx_documentos_cliente     ON documentos       (doc_cli_id);
CREATE INDEX idx_documentos_evento      ON documentos       (doc_evt_id);
CREATE INDEX idx_escala_evento          ON escala           (esc_evt_id);
CREATE INDEX idx_escala_funcionario     ON escala           (esc_fun_id);
CREATE INDEX idx_evento_produto_evento  ON evento_produto   (evp_evt_id);
CREATE INDEX idx_orcamento_produto_orc  ON orcamento_produto(orp_orc_id);