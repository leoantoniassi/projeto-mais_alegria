// ============================================================
// PROJETO MAIS ALEGRIA — Seed (popular banco via Sequelize)
// ============================================================
require('dotenv').config();

const bcrypt = require('bcryptjs');
const sequelize = require('./config/database');

// Importa modelos e associações
const {
  Usuario, Cliente,
  Local, Funcao, CategoriaFornecedor, CategoriaProduto,
  Funcionario, Fornecedor, Produto,
  Orcamento, Evento, Documento, Escala,
  EventoProduto, OrcamentoProduto,
} = require('./models');

async function seed() {
  try {
    await sequelize.authenticate();
    console.log('✅ Conectado ao banco.');

    // Limpa dados existentes (em ordem de dependência reversa)
    console.log('🗑️  Limpando dados existentes...');
    await OrcamentoProduto.destroy({ where: {}, force: true });
    await EventoProduto.destroy({ where: {}, force: true });
    await Escala.destroy({ where: {}, force: true });
    await Documento.destroy({ where: {}, force: true });
    await Evento.destroy({ where: {}, force: true });
    await Orcamento.destroy({ where: {}, force: true });
    await Produto.destroy({ where: {}, force: true });
    await Funcionario.destroy({ where: {}, force: true });
    await Fornecedor.destroy({ where: {}, force: true });
    await Cliente.destroy({ where: {}, force: true });
    await Usuario.destroy({ where: {}, force: true });
    await Local.destroy({ where: {}, force: true });
    await Funcao.destroy({ where: {}, force: true });
    await CategoriaFornecedor.destroy({ where: {}, force: true });
    await CategoriaProduto.destroy({ where: {}, force: true });

    // 0. USUARIOS
    console.log('👤 Criando usuários...');
    const senhaHash = await bcrypt.hash('123456', 10);
    await Usuario.bulkCreate([
      { nome: 'Gerente Souza', email: 'gerente@maisalegria.com',  senha: senhaHash, role: 'gerente' },
      { nome: 'Operador Lima', email: 'operador@maisalegria.com', senha: senhaHash, role: 'operador' },
    ]);

    // LOOKUP TABLES
    console.log('🏷️  Criando tabelas de referência...');

    const [salao1, salao2, chacara] = await Local.bulkCreate([
      {
        nome: 'Salão 1 - Sede Mais Alegria', logradouro: 'Rua das Festas', numero: '100',
        complemento: 'Térreo', bairro: 'Centro', cidade: 'São Paulo', estado: 'SP',
        cep: '01310-100', observacoes: 'Estacionamento na rua. Portão azul.',
      },
      {
        nome: 'Salão 2 - Sede Mais Alegria', logradouro: 'Rua das Festas', numero: '100',
        complemento: '1º Andar', bairro: 'Centro', cidade: 'São Paulo', estado: 'SP',
        cep: '01310-100', observacoes: 'Acesso pelo elevador lateral.',
      },
      {
        nome: 'Chácara das Flores', logradouro: 'Estrada das Flores', numero: '450',
        complemento: null, bairro: 'Zona Rural', cidade: 'Mairiporã', estado: 'SP',
        cep: '07600-000', observacoes: 'Chegar 4 horas antes. Portão verde na entrada da estrada.',
      },
    ]);

    const [fRecreador, fGarcom, fCozinheiro, fSeguranca] = await Funcao.bulkCreate([
      { nome: 'Recreador',  descricao: 'Responsável pelas atividades lúdicas e entretenimento infantil.' },
      { nome: 'Garçom',     descricao: 'Responsável pelo serviço de mesa e atendimento aos convidados.' },
      { nome: 'Cozinheiro', descricao: 'Responsável pelo preparo dos alimentos e buffet.' },
      { nome: 'Segurança',  descricao: 'Responsável pela segurança e controle de acesso ao evento.' },
    ]);

    const [catAlimentos, catDecoracao, catBebidas] = await CategoriaFornecedor.bulkCreate([
      { nome: 'Alimentos', descricao: 'Fornecedores de alimentos e produtos comestíveis.' },
      { nome: 'Decoração', descricao: 'Fornecedores de itens decorativos, balões e ornamentos.' },
      { nome: 'Bebidas',   descricao: 'Fornecedores de bebidas alcoólicas e não alcoólicas.' },
    ]);

    const [cpAlimento, cpBebida, cpDescartavel, cpDecoracaoPrd] = await CategoriaProduto.bulkCreate([
      { nome: 'Alimento',    descricao: 'Itens alimentícios consumidos nos eventos.' },
      { nome: 'Bebida',      descricao: 'Bebidas servidas nos eventos.' },
      { nome: 'Descartável', descricao: 'Copos, pratos, talheres e similares descartáveis.' },
      { nome: 'Decoração',   descricao: 'Balões, enfeites e outros itens decorativos.' },
    ]);

    // 1. CLIENTES
    console.log('👥 Criando clientes...');
    const [joao, maria, pedro] = await Cliente.bulkCreate([
      { nome: 'João Carlos',   email: 'joao.carlos@email.com',   rgCpf: '123.456.789-01', telefone: '(11) 98765-4321' },
      { nome: 'Maria Oliveira', email: 'maria.oliveira@email.com', rgCpf: '987.654.321-09', telefone: '(11) 91234-5678' },
      { nome: 'Pedro Santos',  email: 'pedro.santos@email.com',  rgCpf: '111.222.333-44', telefone: '(11) 99999-8888' },
    ]);

    // 2. FORNECEDORES
    console.log('🏭 Criando fornecedores...');
    await Fornecedor.bulkCreate([
      { nome: 'Doces & Bolos Ltda',           email: 'contato@docesebolos.com.br', cnpj: '12.345.678/0001-90', telefone: '(11) 3333-4444', categoriaId: catAlimentos.id },
      { nome: 'Balões e Decorações ME',        email: 'ola@baloesdecor.com.br',     cnpj: '98.765.432/0001-10', telefone: '(11) 4444-5555', categoriaId: catDecoracao.id },
      { nome: 'Distribuidora de Bebidas Sul', email: 'vendas@bebidasul.com.br',    cnpj: '55.444.333/0001-22', telefone: '(11) 5555-6666', categoriaId: catBebidas.id },
    ]);

    // 3. FUNCIONARIOS
    console.log('👷 Criando funcionários...');
    const [ana, lucas, bia, marcos] = await Funcionario.bulkCreate([
      { nome: 'Ana Clara',    email: 'ana.clara@maisalegria.com',    telefone: '(11) 97777-6666', funcaoId: fRecreador.id },
      { nome: 'Lucas Mendes', email: 'lucas.mendes@maisalegria.com', telefone: '(11) 95555-4444', funcaoId: fGarcom.id },
      { nome: 'Bia Costa',    email: 'bia.costa@maisalegria.com',    telefone: '(11) 93333-2222', funcaoId: fCozinheiro.id },
      { nome: 'Marcos Silva', email: 'marcos.silva@maisalegria.com', telefone: '(11) 91111-0000', funcaoId: fSeguranca.id },
    ]);

    // 4. PRODUTOS
    console.log('📦 Criando produtos...');
    const [bolo, refri, copo, salgado, balao] = await Produto.bulkCreate([
      { nome: 'Bolo de Chocolate',      categoriaId: cpAlimento.id,      quantidade: 5,    estoqueMinimo: 2,   unidadeMedida: 'un', custoUnitario: 150.00 },
      { nome: 'Refrigerante Cola 2L',   categoriaId: cpBebida.id,        quantidade: 50,   estoqueMinimo: 10,  unidadeMedida: 'un', custoUnitario: 8.50 },
      { nome: 'Copo Descartável 200ml', categoriaId: cpDescartavel.id,   quantidade: 1000, estoqueMinimo: 200, unidadeMedida: 'un', custoUnitario: 0.05 },
      { nome: 'Salgadinhos Sortidos',   categoriaId: cpAlimento.id,      quantidade: 2000, estoqueMinimo: 500, unidadeMedida: 'un', custoUnitario: 0.50 },
      { nome: 'Balões Coloridos',       categoriaId: cpDecoracaoPrd.id,  quantidade: 500,  estoqueMinimo: 100, unidadeMedida: 'un', custoUnitario: 0.20 },
    ]);

    // 5. ORCAMENTOS
    console.log('💰 Criando orçamentos...');
    const [orcJoao, orcMaria, orcPedro] = await Orcamento.bulkCreate([
      { clienteId: joao.id,  localId: salao1.id,  valorTotal: 2500.00, dataValidade: '2026-04-01', status: 'aprovado', observacoes: 'Festa infantil completa para 60 pessoas.' },
      { clienteId: maria.id, localId: salao2.id,  valorTotal: 1200.00, dataValidade: '2026-04-10', status: 'pendente', observacoes: 'Apenas salgados e bebidas.' },
      { clienteId: pedro.id, localId: chacara.id, valorTotal: 4000.00, dataValidade: '2026-04-05', status: 'aprovado', observacoes: 'Casamento com buffet e recreação infantil.' },
    ]);

    // 6. EVENTOS
    console.log('🎉 Criando eventos...');
    const [evtAniversario, evtCasamento] = await Evento.bulkCreate([
      {
        clienteId: joao.id, orcamentoId: orcJoao.id, localId: salao1.id,
        nome: 'Aniversário do Pedrinho - 5 anos',
        dataEvento: '2026-05-10 14:00:00', status: 'confirmado',
        qtdPessoas: 60, qtdAdultos: 30, qtdCriancas: 25, qtdBebes: 5,
        observacoes: 'Tema: Super-heróis. Montagem às 10h.',
      },
      {
        clienteId: pedro.id, orcamentoId: orcPedro.id, localId: chacara.id,
        nome: 'Casamento Maria e José',
        dataEvento: '2026-06-20 19:00:00', status: 'confirmado',
        qtdPessoas: 150, qtdAdultos: 120, qtdCriancas: 20, qtdBebes: 10,
        observacoes: 'Buffet completo. Chegar 4 horas antes.',
      },
    ]);

    // 7. DOCUMENTOS
    console.log('📄 Criando documentos...');
    await Documento.bulkCreate([
      { clienteId: joao.id,  eventoId: evtAniversario.id, nomeArquivo: 'Contrato Assinado - João',    caminhoUrl: '/uploads/contrato_joao.pdf',        tipoArquivo: 'pdf' },
      { clienteId: pedro.id, eventoId: evtCasamento.id,   nomeArquivo: 'Contrato Casamento - Maria',  caminhoUrl: '/uploads/contrato_maria_jose.pdf',  tipoArquivo: 'pdf' },
    ]);

    // 8. ESCALA
    console.log('📋 Alocando funcionários...');
    await Escala.bulkCreate([
      { eventoId: evtAniversario.id, funcionarioId: ana.id,    observacoes: 'Ficar na área das crianças menores' },
      { eventoId: evtAniversario.id, funcionarioId: lucas.id,  observacoes: 'Servir área vip' },
      { eventoId: evtAniversario.id, funcionarioId: bia.id,    observacoes: 'Preparar os salgados e o bolo' },
      { eventoId: evtCasamento.id,   funcionarioId: ana.id,    observacoes: 'Recreação infantil no salão anexo' },
      { eventoId: evtCasamento.id,   funcionarioId: lucas.id,  observacoes: 'Coordenar garçons do salão principal' },
    ]);

    // 9. EVENTO_PRODUTO
    console.log('📦 Vinculando produtos aos eventos...');
    await EventoProduto.bulkCreate([
      { eventoId: evtAniversario.id, produtoId: bolo.id,    quantidade: 1 },
      { eventoId: evtAniversario.id, produtoId: refri.id,   quantidade: 20 },
      { eventoId: evtAniversario.id, produtoId: copo.id,    quantidade: 200 },
      { eventoId: evtAniversario.id, produtoId: salgado.id, quantidade: 800 },
      { eventoId: evtCasamento.id,   produtoId: refri.id,   quantidade: 50 },
      { eventoId: evtCasamento.id,   produtoId: salgado.id, quantidade: 1200 },
    ]);

    // 10. ORCAMENTO_PRODUTO
    console.log('📦 Vinculando produtos aos orçamentos...');
    await OrcamentoProduto.bulkCreate([
      { orcamentoId: orcJoao.id, produtoId: bolo.id,    quantidade: 1,   precoUnitario: 150.00 },
      { orcamentoId: orcJoao.id, produtoId: refri.id,   quantidade: 20,  precoUnitario: 8.50 },
      { orcamentoId: orcJoao.id, produtoId: copo.id,    quantidade: 200, precoUnitario: 0.05 },
      { orcamentoId: orcJoao.id, produtoId: salgado.id, quantidade: 800, precoUnitario: 0.50 },
    ]);

    console.log('');
    console.log('✅ Seed concluído com sucesso!');
    console.log('');
    console.log('📌 Credenciais de acesso:');
    console.log('   Gerente:  gerente@maisalegria.com  / 123456');
    console.log('   Operador: operador@maisalegria.com / 123456');
    console.log('');

    process.exit(0);
  } catch (error) {
    console.error('❌ Erro no seed:', error);
    process.exit(1);
  }
}

seed();
