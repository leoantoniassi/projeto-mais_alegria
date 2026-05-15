// ============================================================
// PROJETO MAIS ALEGRIA — Seed (popular banco via Sequelize)
// ============================================================
require('dotenv').config();

const bcrypt = require('bcryptjs');
const sequelize = require('./config/database');

// Importa modelos e associações
const {
  Usuario, Cliente, Funcionario, Fornecedor, Produto,
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

    // 0. USUARIOS
    console.log('👤 Criando usuários...');
    const senhaHash = await bcrypt.hash('123456', 10);
    const [admin, gerente] = await Usuario.bulkCreate([
      { nome: 'Admin Silva', email: 'admin@maisalegria.com', senha: senhaHash, role: 'admin' },
      { nome: 'Gerente Souza', email: 'gerente@maisalegria.com', senha: senhaHash, role: 'gerente' },
      { nome: 'Operador Lima', email: 'operador@maisalegria.com', senha: senhaHash, role: 'operador' },
    ]);

    // 1. CLIENTES
    console.log('👥 Criando clientes...');
    const [joao, maria, pedro] = await Cliente.bulkCreate([
      { nome: 'João Carlos', email: 'joao.carlos@email.com', rgCpf: '123.456.789-01', telefone: '(11) 98765-4321' },
      { nome: 'Maria Oliveira', email: 'maria.oliveira@email.com', rgCpf: '987.654.321-09', telefone: '(11) 91234-5678' },
      { nome: 'Pedro Santos', email: 'pedro.santos@email.com', rgCpf: '111.222.333-44', telefone: '(11) 99999-8888' },
    ]);

    // 2. FORNECEDORES
    console.log('🏭 Criando fornecedores...');
    await Fornecedor.bulkCreate([
      { nome: 'Doces & Bolos Ltda', email: 'contato@docesebolos.com.br', cnpj: '12.345.678/0001-90', telefone: '(11) 3333-4444', categoria: 'Alimentos' },
      { nome: 'Balões e Decorações ME', email: 'ola@baloesdecor.com.br', cnpj: '98.765.432/0001-10', telefone: '(11) 4444-5555', categoria: 'Decoração' },
      { nome: 'Distribuidora de Bebidas Sul', email: 'vendas@bebidasul.com.br', cnpj: '55.444.333/0001-22', telefone: '(11) 5555-6666', categoria: 'Bebidas' },
    ]);

    // 3. FUNCIONARIOS
    console.log('👷 Criando funcionários...');
    const [ana, lucas, bia, marcos] = await Funcionario.bulkCreate([
      { nome: 'Ana Clara', email: 'ana.clara@maisalegria.com', telefone: '(11) 97777-6666', funcao: 'Recreador' },
      { nome: 'Lucas Mendes', email: 'lucas.mendes@maisalegria.com', telefone: '(11) 95555-4444', funcao: 'Garçom' },
      { nome: 'Bia Costa', email: 'bia.costa@maisalegria.com', telefone: '(11) 93333-2222', funcao: 'Cozinheiro' },
      { nome: 'Marcos Silva', email: 'marcos.silva@maisalegria.com', telefone: '(11) 91111-0000', funcao: 'Segurança' },
    ]);

    // 3. PRODUTOS
    console.log('📦 Criando produtos...');
    const [bolo, refri, copo, salgado, balao] = await Produto.bulkCreate([
      { nome: 'Bolo de Chocolate', categoria: 'Alimento', quantidade: 5, unidadeMedida: 'un', custoUnitario: 150.00 },
      { nome: 'Refrigerante Cola 2L', categoria: 'Bebida', quantidade: 50, unidadeMedida: 'un', custoUnitario: 8.50 },
      { nome: 'Copo Descartável 200ml', categoria: 'Descartável', quantidade: 1000, unidadeMedida: 'un', custoUnitario: 0.05 },
      { nome: 'Salgadinhos Sortidos', categoria: 'Alimento', quantidade: 2000, unidadeMedida: 'un', custoUnitario: 0.50 },
      { nome: 'Balões Coloridos', categoria: 'Decoração', quantidade: 500, unidadeMedida: 'un', custoUnitario: 0.20 },
    ]);

    // 4. ORCAMENTOS
    console.log('💰 Criando orçamentos...');
    const [orcJoao, orcMaria, orcPedro] = await Orcamento.bulkCreate([
      { clienteId: joao.id, valorTotal: 2500.00, dataValidade: '2026-04-01', status: 'aprovado', observacoes: 'Festa infantil completa para 60 pessoas.' },
      { clienteId: maria.id, valorTotal: 1200.00, dataValidade: '2026-04-10', status: 'pendente', observacoes: 'Apenas salgados e bebidas.' },
      { clienteId: pedro.id, valorTotal: 4000.00, dataValidade: '2026-04-05', status: 'aprovado', observacoes: 'Casamento com buffet e recreação infantil.' },
    ]);

    // 5. EVENTOS
    console.log('🎉 Criando eventos...');
    const [evtAniversario, evtCasamento] = await Evento.bulkCreate([
      {
        clienteId: joao.id, orcamentoId: orcJoao.id,
        nome: 'Aniversário do Pedrinho - 5 anos',
        dataEvento: '2026-05-10 14:00:00',
        local: 'Salão de Festas Alegria',
        status: 'confirmado',
        qtdPessoas: 60, qtdAdultos: 30, qtdCriancas: 25, qtdBebes: 5,
        observacoes: 'Tema: Super-heróis. Montagem às 10h.',
      },
      {
        clienteId: pedro.id, orcamentoId: orcPedro.id,
        nome: 'Casamento Maria e José',
        dataEvento: '2026-06-20 19:00:00',
        local: 'Chácara das Flores',
        status: 'confirmado',
        qtdPessoas: 150, qtdAdultos: 120, qtdCriancas: 20, qtdBebes: 10,
        observacoes: 'Buffet completo. Chegar 4 horas antes.',
      },
    ]);

    // 6. DOCUMENTOS
    console.log('📄 Criando documentos...');
    await Documento.bulkCreate([
      { clienteId: joao.id, eventoId: evtAniversario.id, nomeArquivo: 'Contrato Assinado - João', caminhoUrl: '/uploads/contrato_joao.pdf', tipoArquivo: 'pdf' },
      { clienteId: pedro.id, eventoId: evtCasamento.id, nomeArquivo: 'Contrato Casamento - Maria', caminhoUrl: '/uploads/contrato_maria_jose.pdf', tipoArquivo: 'pdf' },
    ]);

    // 7. ESCALA
    console.log('📋 Alocando funcionários...');
    await Escala.bulkCreate([
      { eventoId: evtAniversario.id, funcionarioId: ana.id, observacoes: 'Ficar na área das crianças menores' },
      { eventoId: evtAniversario.id, funcionarioId: lucas.id, observacoes: 'Servir área vip' },
      { eventoId: evtAniversario.id, funcionarioId: bia.id, observacoes: 'Preparar os salgados e o bolo' },
      { eventoId: evtCasamento.id, funcionarioId: ana.id, observacoes: 'Recreação infantil no salão anexo' },
      { eventoId: evtCasamento.id, funcionarioId: lucas.id, observacoes: 'Coordenar garçons do salão principal' },
    ]);

    // 8. EVENTO_PRODUTO
    console.log('📦 Vinculando produtos aos eventos...');
    await EventoProduto.bulkCreate([
      { eventoId: evtAniversario.id, produtoId: bolo.id, quantidade: 1 },
      { eventoId: evtAniversario.id, produtoId: refri.id, quantidade: 20 },
      { eventoId: evtAniversario.id, produtoId: copo.id, quantidade: 200 },
      { eventoId: evtAniversario.id, produtoId: salgado.id, quantidade: 800 },
      { eventoId: evtCasamento.id, produtoId: refri.id, quantidade: 50 },
      { eventoId: evtCasamento.id, produtoId: salgado.id, quantidade: 1200 },
    ]);

    // 9. ORCAMENTO_PRODUTO
    console.log('📦 Vinculando produtos aos orçamentos...');
    await OrcamentoProduto.bulkCreate([
      { orcamentoId: orcJoao.id, produtoId: bolo.id, quantidade: 1, precoUnitario: 150.00 },
      { orcamentoId: orcJoao.id, produtoId: refri.id, quantidade: 20, precoUnitario: 8.50 },
      { orcamentoId: orcJoao.id, produtoId: copo.id, quantidade: 200, precoUnitario: 0.05 },
      { orcamentoId: orcJoao.id, produtoId: salgado.id, quantidade: 800, precoUnitario: 0.50 },
    ]);

    console.log('');
    console.log('✅ Seed concluído com sucesso!');
    console.log('');
    console.log('📌 Credenciais de acesso:');
    console.log('   Admin:    admin@maisalegria.com    / 123456');
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
