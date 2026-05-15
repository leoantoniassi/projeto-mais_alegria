-- ============================================================
-- PROJETO MAIS ALEGRIA - DADOS FICTÍCIOS COM UUID DINÂMICO
-- ============================================================

TRUNCATE usuarios, clientes, funcionarios, fornecedores, produtos, orcamentos, eventos, documentos, catalogos, escala, evento_produto, orcamento_produto RESTART IDENTITY CASCADE;

-- 0. USUARIOS
INSERT INTO usuarios (usr_nome, usr_email, usr_senha, usr_role) VALUES
('Admin Silva', 'admin@maisalegria.com', '$2y$10$wWwMj.Q9Gq.i0v7Y.9c3.u.V4nB0q0t3eXZ.P1yI0aQ2hE8c3L9oK', 'admin'),
('Gerente Souza', 'gerente@maisalegria.com', '$2y$10$wWwMj.Q9Gq.i0v7Y.9c3.u.V4nB0q0t3eXZ.P1yI0aQ2hE8c3L9oK', 'gerente'),
('Operador Lima', 'operador@maisalegria.com', '$2y$10$wWwMj.Q9Gq.i0v7Y.9c3.u.V4nB0q0t3eXZ.P1yI0aQ2hE8c3L9oK', 'operador');

-- 1. CLIENTES
INSERT INTO clientes (cli_nome, cli_email, cli_rgcpf, cli_telefone) VALUES
('João Carlos', 'joao.carlos@email.com', '123.456.789-01', '(11) 98765-4321'),
('Maria Oliveira', 'maria.oliveira@email.com', '987.654.321-09', '(11) 91234-5678'),
('Pedro Santos', 'pedro.santos@email.com', '111.222.333-44', '(11) 99999-8888');

-- 2. FORNECEDORES
INSERT INTO fornecedores (for_nome, for_email, for_cnpj, for_telefone, for_categoria) VALUES
('Doces & Bolos Ltda', 'contato@docesebolos.com.br', '12.345.678/0001-90', '(11) 3333-4444', 'Alimentos'),
('Balões e Decorações ME', 'ola@baloesdecor.com.br', '98.765.432/0001-10', '(11) 4444-5555', 'Decoração'),
('Distribuidora de Bebidas Sul', 'vendas@bebidasul.com.br', '55.444.333/0001-22', '(11) 5555-6666', 'Bebidas');

-- 2. FUNCIONARIOS
INSERT INTO funcionarios (fun_nome, fun_email, fun_telefone, fun_funcao) VALUES
('Ana Clara', 'ana.clara@maisalegria.com', '(11) 97777-6666', 'Recreador'),
('Lucas Mendes', 'lucas.mendes@maisalegria.com', '(11) 95555-4444', 'Garçom'),
('Bia Costa', 'bia.costa@maisalegria.com', '(11) 93333-2222', 'Cozinheiro'),
('Marcos Silva', 'marcos.silva@maisalegria.com', '(11) 91111-0000', 'Segurança');

-- 3. PRODUTOS (ESTOQUE)
INSERT INTO produtos (prd_nome, prd_categoria, prd_quantidade, prd_unidade_medida, prd_custo_unitario) VALUES
('Bolo de Chocolate', 'Alimento', 5, 'un', 150.00),
('Refrigerante Cola 2L', 'Bebida', 50, 'un', 8.50),
('Copo Descartável 200ml', 'Descartável', 1000, 'un', 0.05),
('Salgadinhos Sortidos', 'Alimento', 2000, 'un', 0.50),
('Balões Coloridos', 'Decoração', 500, 'un', 0.20);

-- 4. ORCAMENTOS
INSERT INTO orcamentos (orc_cli_id, orc_valor_total, orc_data_validade, orc_status, orc_local, orc_observacoes) VALUES
((SELECT cli_id FROM clientes WHERE cli_nome = 'João Carlos'), 2500.00, '2026-04-01', 'aprovado', 'salão 1', 'Festa infantil completa para 60 pessoas.'),
((SELECT cli_id FROM clientes WHERE cli_nome = 'Maria Oliveira'), 1200.00, '2026-04-10', 'pendente', 'salão 2', 'Apenas salgados e bebidas.'),
((SELECT cli_id FROM clientes WHERE cli_nome = 'Pedro Santos'), 4000.00, '2026-04-05', 'aprovado', 'externo', 'Casamento com buffet e recreação infantil.');

-- 5. EVENTOS
INSERT INTO eventos (evt_cli_id, evt_orc_id, evt_nome, evt_data_evento, evt_local, evt_status, evt_qtd_pessoas, evt_qtd_adultos, evt_qtd_criancas, evt_qtd_bebes, evt_observacoes) VALUES
((SELECT cli_id FROM clientes WHERE cli_nome = 'João Carlos'), (SELECT orc_id FROM orcamentos WHERE orc_observacoes LIKE '%Festa infantil completa%'), 'Aniversário do Pedrinho - 5 anos', '2026-05-10 14:00:00', 'salão 1', 'confirmado', 60, 30, 25, 5, 'Tema: Super-heróis. Montagem às 10h.'),
((SELECT cli_id FROM clientes WHERE cli_nome = 'Pedro Santos'), (SELECT orc_id FROM orcamentos WHERE orc_observacoes LIKE '%Casamento%'), 'Casamento Maria e José', '2026-06-20 19:00:00', 'externo', 'confirmado', 150, 120, 20, 10, 'Buffet completo. Chegar 4 horas antes. Endereço: Chácara das Flores');

-- 6. DOCUMENTOS
INSERT INTO documentos (doc_cli_id, doc_evt_id, doc_nome_arquivo, doc_caminho_url, doc_tipo_arquivo) VALUES
((SELECT cli_id FROM clientes WHERE cli_nome = 'João Carlos'), (SELECT evt_id FROM eventos WHERE evt_nome LIKE '%Aniversário%'), 'Contrato Assinado - João', 'https://storage.mock/contrato_joao.pdf', 'pdf'),
((SELECT cli_id FROM clientes WHERE cli_nome = 'Pedro Santos'), (SELECT evt_id FROM eventos WHERE evt_nome LIKE '%Casamento%'), 'Contrato Casamento - Maria', 'https://storage.mock/contrato_maria_jose.pdf', 'pdf');

-- 7. ESCALA
INSERT INTO escala (esc_evt_id, esc_fun_id, esc_observacoes) VALUES
((SELECT evt_id FROM eventos WHERE evt_nome LIKE '%Aniversário%'), (SELECT fun_id FROM funcionarios WHERE fun_nome = 'Ana Clara'), 'Ficar na área das crianças menores'),
((SELECT evt_id FROM eventos WHERE evt_nome LIKE '%Aniversário%'), (SELECT fun_id FROM funcionarios WHERE fun_nome = 'Lucas Mendes'), 'Servir área vip'),
((SELECT evt_id FROM eventos WHERE evt_nome LIKE '%Aniversário%'), (SELECT fun_id FROM funcionarios WHERE fun_nome = 'Bia Costa'), 'Preparar os salgados e o bolo'),
((SELECT evt_id FROM eventos WHERE evt_nome LIKE '%Casamento%'), (SELECT fun_id FROM funcionarios WHERE fun_nome = 'Ana Clara'), 'Recreação infantil no salão anexo'),
((SELECT evt_id FROM eventos WHERE evt_nome LIKE '%Casamento%'), (SELECT fun_id FROM funcionarios WHERE fun_nome = 'Lucas Mendes'), 'Coordenar garçons do salão principal');

-- 8. EVENTO_PRODUTO
INSERT INTO evento_produto (evp_evt_id, evp_prd_id, evp_quantidade) VALUES
((SELECT evt_id FROM eventos WHERE evt_nome LIKE '%Aniversário%'), (SELECT prd_id FROM produtos WHERE prd_nome = 'Bolo de Chocolate'), 1),
((SELECT evt_id FROM eventos WHERE evt_nome LIKE '%Aniversário%'), (SELECT prd_id FROM produtos WHERE prd_nome = 'Refrigerante Cola 2L'), 20),
((SELECT evt_id FROM eventos WHERE evt_nome LIKE '%Aniversário%'), (SELECT prd_id FROM produtos WHERE prd_nome = 'Copo Descartável 200ml'), 200),
((SELECT evt_id FROM eventos WHERE evt_nome LIKE '%Aniversário%'), (SELECT prd_id FROM produtos WHERE prd_nome = 'Salgadinhos Sortidos'), 800),
((SELECT evt_id FROM eventos WHERE evt_nome LIKE '%Casamento%'), (SELECT prd_id FROM produtos WHERE prd_nome = 'Refrigerante Cola 2L'), 50),
((SELECT evt_id FROM eventos WHERE evt_nome LIKE '%Casamento%'), (SELECT prd_id FROM produtos WHERE prd_nome = 'Salgadinhos Sortidos'), 1200);

-- 9. ORCAMENTO_PRODUTO
INSERT INTO orcamento_produto (orp_orc_id, orp_prd_id, orp_quantidade, orp_preco_unitario) VALUES
((SELECT orc_id FROM orcamentos WHERE orc_observacoes LIKE '%Festa infantil completa%'), (SELECT prd_id FROM produtos WHERE prd_nome = 'Bolo de Chocolate'), 1, 150.00),
((SELECT orc_id FROM orcamentos WHERE orc_observacoes LIKE '%Festa infantil completa%'), (SELECT prd_id FROM produtos WHERE prd_nome = 'Refrigerante Cola 2L'), 20, 8.50),
((SELECT orc_id FROM orcamentos WHERE orc_observacoes LIKE '%Festa infantil completa%'), (SELECT prd_id FROM produtos WHERE prd_nome = 'Copo Descartável 200ml'), 200, 0.05),
((SELECT orc_id FROM orcamentos WHERE orc_observacoes LIKE '%Festa infantil completa%'), (SELECT prd_id FROM produtos WHERE prd_nome = 'Salgadinhos Sortidos'), 800, 0.50);
-- 10. CATALOGOS
INSERT INTO catalogos (cat_titulo, cat_descricao, cat_preco_base, cat_url_externa, cat_ativo) VALUES
('Buffet Infantil Completo', 'Ideal para festas de aniversário infantis. Inclui salgadinhos, doces, bolo temático e refrigerantes para até 60 pessoas.', 1800.00, NULL, true),
('Buffet Premium Casamento', 'Buffet sofisticado para casamentos e eventos corporativos. Entrada, prato principal, sobremesa e open bar para até 200 pessoas.', 8500.00, NULL, true),
('Petiscos & Finger Foods', 'Perfeito para eventos informais e confraternizações. Mix de frios, bruschetas, canapés e drinks especiais.', 950.00, NULL, true);
