// ============================================================
// Controller: Dashboard (Dados Agregados)
// ============================================================
const { Op } = require('sequelize');
const { Cliente, Funcionario, Produto, Orcamento, Evento } = require('../models');

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
      ],
      order: [['dataEvento', 'ASC']],
      limit: 5,
    });

    return res.json({ success: true, data: eventos });
  } catch (error) {
    return next(error);
  }
}

module.exports = { stats, proximosEventos };
