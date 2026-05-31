// ============================================================
// Controller: Dashboard (Dados Agregados)
// ============================================================
const { Op, fn, col, literal } = require('sequelize');
const { Cliente, Funcionario, Produto, Orcamento, Evento, Local } = require('../models');

// GET /api/dashboard/stats
async function stats(req, res, next) {
  try {
    const [
      totalClientes,
      totalFuncionarios,
      totalProdutos,
      totalOrcamentos,
      totalEventos,
      orcamentosPendentes,
      orcamentosAprovados,
      eventosConfirmados,
      eventosPendentes,
      eventosProximos30Dias,
    ] = await Promise.all([
      Cliente.count(),
      Funcionario.count(),
      Produto.count(),
      Orcamento.count(),
      Evento.count(),
      Orcamento.count({ where: { status: 'pendente' } }),
      Orcamento.count({ where: { status: 'aprovado' } }),
      Evento.count({ where: { status: 'confirmado' } }),
      Evento.count({ where: { status: 'pendente' } }),
      Evento.count({
        where: {
          dataEvento: {
            [Op.gte]: new Date(),
            [Op.lte]: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
          },
        },
      }),
    ]);

    return res.json({
      success: true,
      data: {
        totalClientes,
        totalFuncionarios,
        totalProdutos,
        totalOrcamentos,
        totalEventos,
        orcamentosPendentes,
        orcamentosAprovados,
        eventosConfirmados,
        eventosPendentes,
        eventosProximos30Dias,
      },
    });
  } catch (error) {
    return next(error);
  }
}

// GET /api/dashboard/proximos-eventos
async function proximosEventos(req, res, next) {
  try {
    const eventos = await Evento.findAll({
      where: {
        dataEvento: { [Op.gte]: new Date() },
        status: { [Op.in]: ['pendente', 'confirmado'] },
      },
      include: [
        { model: Cliente, as: 'cliente', attributes: ['id', 'nome', 'telefone'] },
        { model: Local, as: 'local', attributes: ['id', 'nome'] },
      ],
      order: [['dataEvento', 'ASC']],
      limit: 5,
    });

    return res.json({ success: true, data: eventos });
  } catch (error) {
    return next(error);
  }
}

// GET /api/dashboard/charts
async function charts(req, res, next) {
  try {
    const eventos = await Evento.findAll({
      where: {
        status: { [Op.ne]: 'cancelado' },
      },
      attributes: ['id', 'nome', 'dataEvento', 'qtdPessoas'],
      include: [
        { model: Orcamento, as: 'orcamento', attributes: ['valorTotal'] },
        { model: Local,     as: 'local',     attributes: ['nome'] },
      ]
    });

    // 1. Scatter (Convidados vs Custo)
    const scatter = eventos
      .filter(e => e.qtdPessoas > 0 && e.orcamento && e.orcamento.valorTotal > 0)
      .map(e => ({
        convidados: e.qtdPessoas,
        custo: Number(e.orcamento.valorTotal),
        nome: e.nome
      }));

    // 2. TimeSeries (Sazonalidade - Agrupado por Mês do ano atual)
    const currentYear = new Date().getFullYear();
    const months = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];
    const timeSeriesMap = {};
    months.forEach(m => timeSeriesMap[m] = 0);

    eventos.forEach(e => {
      if (e.dataEvento) {
        const d = new Date(e.dataEvento);
        if (d.getFullYear() === currentYear) {
          const monthName = months[d.getMonth()];
          timeSeriesMap[monthName]++;
        }
      }
    });
    const timeSeries = months.map(m => ({ mes: m, eventos: timeSeriesMap[m] }));

    // 3. Infra (Pie Chart - Local do Evento)
    const infraMap = {};
    eventos.forEach(e => {
      const loc = e.local ? e.local.nome.toLowerCase() : 'não definido';
      infraMap[loc] = (infraMap[loc] || 0) + 1;
    });
    const infra = Object.keys(infraMap).map(k => ({
      name: k.charAt(0).toUpperCase() + k.slice(1),
      value: infraMap[k]
    }));

    return res.json({
      success: true,
      data: { scatter, timeSeries, infra }
    });
  } catch (error) {
    return next(error);
  }
}

module.exports = { stats, proximosEventos, charts };
