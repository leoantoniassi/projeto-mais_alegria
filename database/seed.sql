-- ============================================================
-- PROJETO MAIS ALEGRIA - DADOS FICTÍCIOS COM UUID DINÂMICO
-- ============================================================

TRUNCATE
    usuarios, clientes, funcionarios, fornecedores, produtos,
    orcamentos, eventos, documentos, catalogos, escala,
    evento_produto, orcamento_produto,
    locais, funcoes, categorias_fornecedor, categorias_produto
RESTART IDENTITY CASCADE;

-- 0. USUARIOS
INSERT INTO usuarios (usr_nome, usr_email, usr_senha, usr_role) VALUES
('Gerente Souza',  'gerente@maisalegria.com',  '$2y$10$wWwMj.Q9Gq.i0v7Y.9c3.u.V4nB0q0t3eXZ.P1yI0aQ2hE8c3L9oK', 'gerente'),
('Operador Lima',  'operador@maisalegria.com', '$2y$10$wWwMj.Q9Gq.i0v7Y.9c3.u.V4nB0q0t3eXZ.P1yI0aQ2hE8c3L9oK', 'operador');

-- ============================================================
-- LOOKUP TABLES — inserir antes das entidades que as referenciam
-- ============================================================

-- L. LOCAIS
INSERT INTO locais (loc_nome, loc_logradouro, loc_numero, loc_complemento, loc_bairro, loc_cidade, loc_estado, loc_cep, loc_observacoes) VALUES
('Salão 1 - Sede Mais Alegria',   'Rua das Festas',          '100', 'Térreo',           'Centro',        'São Paulo', 'SP', '01310-100', 'Estacionamento na rua. Portão azul.'),
('Salão 2 - Sede Mais Alegria',   'Rua das Festas',          '100', '1º Andar',         'Centro',        'São Paulo', 'SP', '01310-100', 'Acesso pelo elevador lateral.'),
('Chácara das Flores',            'Estrada das Flores',      '450', NULL,               'Zona Rural',    'Mairiporã',  'SP', '07600-000', 'Chegar 4 horas antes. Portão verde na entrada da estrada.');

-- F. FUNCOES
INSERT INTO funcoes (fnc_nome, fnc_descricao) VALUES
('Recreador',  'Responsável pelas atividades lúdicas e entretenimento infantil.'),
('Garçom',     'Responsável pelo serviço de mesa e atendimento aos convidados.'),
('Cozinheiro', 'Responsável pelo preparo dos alimentos e buffet.'),
('Segurança',  'Responsável pela segurança e controle de acesso ao evento.');

-- CF. CATEGORIAS_FORNECEDOR
INSERT INTO categorias_fornecedor (caf_nome, caf_descricao) VALUES
('Alimentos',  'Fornecedores de alimentos e produtos comestíveis.'),
('Decoração',  'Fornecedores de itens decorativos, balões e ornamentos.'),
('Bebidas',    'Fornecedores de bebidas alcoólicas e não alcoólicas.');

-- CP. CATEGORIAS_PRODUTO
INSERT INTO categorias_produto (cap_nome, cap_descricao) VALUES
('Alimento',    'Itens alimentícios consumidos nos eventos.'),
('Bebida',      'Bebidas servidas nos eventos.'),
('Descartável', 'Copos, pratos, talheres e similares descartáveis.'),
('Decoração',   'Balões, enfeites e outros itens decorativos.');

-- ============================================================
-- ENTIDADES PRINCIPAIS
-- ============================================================

-- 1. CLIENTES
INSERT INTO clientes (cli_nome, cli_email, cli_rgcpf, cli_telefone) VALUES
('João Carlos',   'joao.carlos@email.com',   '123.456.789-01', '(11) 98765-4321'),
('Maria Oliveira', 'maria.oliveira@email.com', '987.654.321-09', '(11) 91234-5678'),
('Pedro Santos',  'pedro.santos@email.com',  '111.222.333-44', '(11) 99999-8888');

-- 2. FORNECEDORES
INSERT INTO fornecedores (for_nome, for_email, for_cnpj, for_telefone, for_caf_id) VALUES
('Doces & Bolos Ltda',           'contato@docesebolos.com.br', '12.345.678/0001-90', '(11) 3333-4444', (SELECT caf_id FROM categorias_fornecedor WHERE caf_nome = 'Alimentos')),
('Balões e Decorações ME',        'ola@baloesdecor.com.br',     '98.765.432/0001-10', '(11) 4444-5555', (SELECT caf_id FROM categorias_fornecedor WHERE caf_nome = 'Decoração')),
('Distribuidora de Bebidas Sul', 'vendas@bebidasul.com.br',    '55.444.333/0001-22', '(11) 5555-6666', (SELECT caf_id FROM categorias_fornecedor WHERE caf_nome = 'Bebidas'));

-- 3. FUNCIONARIOS
INSERT INTO funcionarios (fun_nome, fun_email, fun_telefone, fun_fnc_id) VALUES
('Ana Clara',    'ana.clara@maisalegria.com',    '(11) 97777-6666', (SELECT fnc_id FROM funcoes WHERE fnc_nome = 'Recreador')),
('Lucas Mendes', 'lucas.mendes@maisalegria.com', '(11) 95555-4444', (SELECT fnc_id FROM funcoes WHERE fnc_nome = 'Garçom')),
('Bia Costa',    'bia.costa@maisalegria.com',    '(11) 93333-2222', (SELECT fnc_id FROM funcoes WHERE fnc_nome = 'Cozinheiro')),
('Marcos Silva', 'marcos.silva@maisalegria.com', '(11) 91111-0000', (SELECT fnc_id FROM funcoes WHERE fnc_nome = 'Segurança'));

-- 4. PRODUTOS (ESTOQUE)
INSERT INTO produtos (prd_nome, prd_cap_id, prd_quantidade, prd_estoque_minimo, prd_unidade_medida, prd_custo_unitario) VALUES
('Bolo de Chocolate',      (SELECT cap_id FROM categorias_produto WHERE cap_nome = 'Alimento'),    5,    2,   'un',  150.00),
('Refrigerante Cola 2L',   (SELECT cap_id FROM categorias_produto WHERE cap_nome = 'Bebida'),     50,   10,   'un',    8.50),
('Copo Descartável 200ml', (SELECT cap_id FROM categorias_produto WHERE cap_nome = 'Descartável'), 1000, 200, 'un',    0.05),
('Salgadinhos Sortidos',   (SELECT cap_id FROM categorias_produto WHERE cap_nome = 'Alimento'),   2000, 500, 'un',    0.50),
('Balões Coloridos',       (SELECT cap_id FROM categorias_produto WHERE cap_nome = 'Decoração'),   500, 100, 'un',    0.20);

-- 5. ORCAMENTOS
INSERT INTO orcamentos (orc_cli_id, orc_loc_id, orc_valor_total, orc_data_validade, orc_status, orc_observacoes) VALUES
(
    (SELECT cli_id FROM clientes WHERE cli_nome = 'João Carlos'),
    (SELECT loc_id FROM locais   WHERE loc_nome = 'Salão 1 - Sede Mais Alegria'),
    2500.00, '2026-04-01', 'aprovado',
    'Festa infantil completa para 60 pessoas.'
),
(
    (SELECT cli_id FROM clientes WHERE cli_nome = 'Maria Oliveira'),
    (SELECT loc_id FROM locais   WHERE loc_nome = 'Salão 2 - Sede Mais Alegria'),
    1200.00, '2026-04-10', 'pendente',
    'Apenas salgados e bebidas.'
),
(
    (SELECT cli_id FROM clientes WHERE cli_nome = 'Pedro Santos'),
    (SELECT loc_id FROM locais   WHERE loc_nome = 'Chácara das Flores'),
    4000.00, '2026-04-05', 'aprovado',
    'Casamento com buffet e recreação infantil.'
);

-- 6. EVENTOS
INSERT INTO eventos (evt_cli_id, evt_orc_id, evt_loc_id, evt_nome, evt_data_evento, evt_status, evt_qtd_pessoas, evt_qtd_adultos, evt_qtd_criancas, evt_qtd_bebes, evt_observacoes) VALUES
(
    (SELECT cli_id FROM clientes   WHERE cli_nome        = 'João Carlos'),
    (SELECT orc_id FROM orcamentos WHERE orc_observacoes LIKE '%Festa infantil completa%'),
    (SELECT loc_id FROM locais     WHERE loc_nome        = 'Salão 1 - Sede Mais Alegria'),
    'Aniversário do Pedrinho - 5 anos', '2026-05-10 14:00:00', 'confirmado',
    60, 30, 25, 5, 'Tema: Super-heróis. Montagem às 10h.'
),
(
    (SELECT cli_id FROM clientes   WHERE cli_nome        = 'Pedro Santos'),
    (SELECT orc_id FROM orcamentos WHERE orc_observacoes LIKE '%Casamento%'),
    (SELECT loc_id FROM locais     WHERE loc_nome        = 'Chácara das Flores'),
    'Casamento Maria e José', '2026-06-20 19:00:00', 'confirmado',
    150, 120, 20, 10, 'Buffet completo. Chegar 4 horas antes.'
);

-- 7. DOCUMENTOS
INSERT INTO documentos (doc_cli_id, doc_evt_id, doc_nome_arquivo, doc_caminho_url, doc_tipo_arquivo) VALUES
(
    (SELECT cli_id FROM clientes WHERE cli_nome = 'João Carlos'),
    (SELECT evt_id FROM eventos  WHERE evt_nome LIKE '%Aniversário%'),
    'Contrato Assinado - João', 'https://storage.mock/contrato_joao.pdf', 'pdf'
),
(
    (SELECT cli_id FROM clientes WHERE cli_nome = 'Pedro Santos'),
    (SELECT evt_id FROM eventos  WHERE evt_nome LIKE '%Casamento%'),
    'Contrato Casamento - Maria', 'https://storage.mock/contrato_maria_jose.pdf', 'pdf'
);

-- 8. ESCALA
INSERT INTO escala (esc_evt_id, esc_fun_id, esc_observacoes) VALUES
((SELECT evt_id FROM eventos WHERE evt_nome LIKE '%Aniversário%'), (SELECT fun_id FROM funcionarios WHERE fun_nome = 'Ana Clara'),    'Ficar na área das crianças menores'),
((SELECT evt_id FROM eventos WHERE evt_nome LIKE '%Aniversário%'), (SELECT fun_id FROM funcionarios WHERE fun_nome = 'Lucas Mendes'), 'Servir área vip'),
((SELECT evt_id FROM eventos WHERE evt_nome LIKE '%Aniversário%'), (SELECT fun_id FROM funcionarios WHERE fun_nome = 'Bia Costa'),    'Preparar os salgados e o bolo'),
((SELECT evt_id FROM eventos WHERE evt_nome LIKE '%Casamento%'),   (SELECT fun_id FROM funcionarios WHERE fun_nome = 'Ana Clara'),    'Recreação infantil no salão anexo'),
((SELECT evt_id FROM eventos WHERE evt_nome LIKE '%Casamento%'),   (SELECT fun_id FROM funcionarios WHERE fun_nome = 'Lucas Mendes'), 'Coordenar garçons do salão principal');

-- 9. EVENTO_PRODUTO
INSERT INTO evento_produto (evp_evt_id, evp_prd_id, evp_quantidade) VALUES
((SELECT evt_id FROM eventos WHERE evt_nome LIKE '%Aniversário%'), (SELECT prd_id FROM produtos WHERE prd_nome = 'Bolo de Chocolate'),      1),
((SELECT evt_id FROM eventos WHERE evt_nome LIKE '%Aniversário%'), (SELECT prd_id FROM produtos WHERE prd_nome = 'Refrigerante Cola 2L'),   20),
((SELECT evt_id FROM eventos WHERE evt_nome LIKE '%Aniversário%'), (SELECT prd_id FROM produtos WHERE prd_nome = 'Copo Descartável 200ml'), 200),
((SELECT evt_id FROM eventos WHERE evt_nome LIKE '%Aniversário%'), (SELECT prd_id FROM produtos WHERE prd_nome = 'Salgadinhos Sortidos'),   800),
((SELECT evt_id FROM eventos WHERE evt_nome LIKE '%Casamento%'),   (SELECT prd_id FROM produtos WHERE prd_nome = 'Refrigerante Cola 2L'),   50),
((SELECT evt_id FROM eventos WHERE evt_nome LIKE '%Casamento%'),   (SELECT prd_id FROM produtos WHERE prd_nome = 'Salgadinhos Sortidos'),   1200);

-- 10. ORCAMENTO_PRODUTO
INSERT INTO orcamento_produto (orp_orc_id, orp_prd_id, orp_quantidade, orp_preco_unitario) VALUES
((SELECT orc_id FROM orcamentos WHERE orc_observacoes LIKE '%Festa infantil completa%'), (SELECT prd_id FROM produtos WHERE prd_nome = 'Bolo de Chocolate'),      1,   150.00),
((SELECT orc_id FROM orcamentos WHERE orc_observacoes LIKE '%Festa infantil completa%'), (SELECT prd_id FROM produtos WHERE prd_nome = 'Refrigerante Cola 2L'),   20,    8.50),
((SELECT orc_id FROM orcamentos WHERE orc_observacoes LIKE '%Festa infantil completa%'), (SELECT prd_id FROM produtos WHERE prd_nome = 'Copo Descartável 200ml'), 200,   0.05),
((SELECT orc_id FROM orcamentos WHERE orc_observacoes LIKE '%Festa infantil completa%'), (SELECT prd_id FROM produtos WHERE prd_nome = 'Salgadinhos Sortidos'),   800,   0.50);

-- 11. CATALOGOS
INSERT INTO catalogos (cat_titulo, cat_descricao, cat_preco_base, cat_url_externa, cat_ativo) VALUES
('Buffet Infantil Completo',  'Ideal para festas de aniversário infantis. Inclui salgadinhos, doces, bolo temático e refrigerantes para até 60 pessoas.', 1800.00, NULL, true),
('Buffet Premium Casamento',  'Buffet sofisticado para casamentos e eventos corporativos. Entrada, prato principal, sobremesa e open bar para até 200 pessoas.', 8500.00, NULL, true),
('Petiscos & Finger Foods',   'Perfeito para eventos informais e confraternizações. Mix de frios, bruschetas, canapés e drinks especiais.', 950.00, NULL, true);
