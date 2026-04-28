// ============================================================
// Controller: Orçamentos
// ============================================================
const { Op } = require("sequelize");
const { Orcamento, Cliente, OrcamentoProduto, Produto, Evento } = require("../models");

// GET /api/orcamentos
async function listar(req, res, next) {
  try {
    const { page = 1, limit = 20, status } = req.query;
    const offset = (page - 1) * limit;

    const where = {};
    if (status) {
      where.status = status;
    }

    const { count, rows } = await Orcamento.findAndCountAll({
      where,
      include: [
        {
          model: Cliente,
          as: "cliente",
          attributes: ["id", "nome", "email", "telefone"],
        },
      ],
      limit: parseInt(limit),
      offset: parseInt(offset),
      order: [["criadoEm", "DESC"]],
    });

    return res.json({
      success: true,
      data: rows,
      pagination: {
        total: count,
        page: parseInt(page),
        limit: parseInt(limit),
        totalPages: Math.ceil(count / limit),
      },
    });
  } catch (error) {
    return next(error);
  }
}

// GET /api/orcamentos/:id
async function buscarPorId(req, res, next) {
  try {
    const orcamento = await Orcamento.findByPk(req.params.id, {
      include: [
        {
          model: Cliente,
          as: "cliente",
          attributes: ["id", "nome", "email", "telefone"],
        },
        {
          model: OrcamentoProduto,
          as: "orcamentoProdutos",
          include: [{ model: Produto, as: "produto" }],
        },
      ],
    });

    if (!orcamento) {
      return res.status(404).json({
        success: false,
        message: "Orçamento não encontrado.",
      });
    }

    return res.json({ success: true, data: orcamento });
  } catch (error) {
    return next(error);
  }
}

// POST /api/orcamentos
async function criar(req, res, next) {
  try {
    const {
      clienteId,
      valorTotal,
      dataValidade,
      status,
      observacoes,
      produtos,
    } = req.body;

    if (!clienteId) {
      return res.status(400).json({
        success: false,
        message: "O ID do cliente é obrigatório.",
      });
    }

    // Verifica se cliente existe
    const cliente = await Cliente.findByPk(clienteId);
    if (!cliente) {
      return res.status(404).json({
        success: false,
        message: "Cliente não encontrado.",
      });
    }

    const orcamento = await Orcamento.create({
      clienteId,
      valorTotal: valorTotal || 0,
      dataValidade,
      status: status || "pendente",
      observacoes,
    });

    // Se produtos foram enviados, cria os registros na tabela intermediária
    if (produtos && Array.isArray(produtos) && produtos.length > 0) {
      const orcamentoProdutos = produtos.map((p) => ({
        orcamentoId: orcamento.id,
        produtoId: p.produtoId,
        quantidade: p.quantidade || 0,
        precoUnitario: p.precoUnitario || 0,
      }));
      await OrcamentoProduto.bulkCreate(orcamentoProdutos);
    }

    // Retorna com produtos incluídos
    const orcamentoCompleto = await Orcamento.findByPk(orcamento.id, {
      include: [
        { model: Cliente, as: "cliente", attributes: ["id", "nome"] },
        {
          model: OrcamentoProduto,
          as: "orcamentoProdutos",
          include: [{ model: Produto, as: "produto" }],
        },
      ],
    });

    return res.status(201).json({
      success: true,
      message: "Orçamento criado com sucesso!",
      data: orcamentoCompleto,
    });
  } catch (error) {
    return next(error);
  }
}

// PUT /api/orcamentos/:id
async function atualizar(req, res, next) {
  try {
    const orcamento = await Orcamento.findByPk(req.params.id);
    if (!orcamento) {
      return res.status(404).json({
        success: false,
        message: "Orçamento não encontrado.",
      });
    }

    const { clienteId, valorTotal, dataValidade, observacoes } = req.body;
    await orcamento.update({
      clienteId: clienteId || orcamento.clienteId,
      valorTotal: valorTotal !== undefined ? valorTotal : orcamento.valorTotal,
      dataValidade:
        dataValidade !== undefined ? dataValidade : orcamento.dataValidade,
      observacoes:
        observacoes !== undefined ? observacoes : orcamento.observacoes,
      atualizadoEm: new Date(),
    });

    return res.json({
      success: true,
      message: "Orçamento atualizado com sucesso!",
      data: orcamento,
    });
  } catch (error) {
    return next(error);
  }
}

// PATCH /api/orcamentos/:id/status
async function mudarStatus(req, res, next) {
  try {
    const orcamento = await Orcamento.findByPk(req.params.id);
    if (!orcamento) {
      return res.status(404).json({
        success: false,
        message: "Orçamento não encontrado.",
      });
    }

    const { status } = req.body;
    if (!["pendente", "aprovado", "reprovado"].includes(status)) {
      return res.status(400).json({
        success: false,
        message: "Status inválido. Use: pendente, aprovado ou reprovado.",
      });
    }

    await orcamento.update({ status, atualizadoEm: new Date() });

    return res.json({
      success: true,
      message: `Orçamento ${status} com sucesso!`,
      data: orcamento,
    });
  } catch (error) {
    return next(error);
  }
}

// DELETE /api/orcamentos/:id (soft delete)
async function remover(req, res, next) {
  try {
    const orcamento = await Orcamento.findByPk(req.params.id);
    if (!orcamento) {
      return res.status(404).json({
        success: false,
        message: "Orçamento não encontrado.",
      });
    }

    await orcamento.update({ deletadoEm: new Date() });

    return res.json({
      success: true,
      message: "Orçamento removido com sucesso!",
    });
  } catch (error) {
    return next(error);
  }
}

// Confirma o orçamento e envia para Eventos
async function confirmarOrcamento(req, res, next) {
  try {
    const orcamento = await Orcamento.findByPk(req.params.id, {
      include: [{ model: Cliente, as: 'cliente' }]
    });

    if (!orcamento) {
      return res.status(404).json({ success: false, message: "Orçamento não encontrado." });
    }

    // Cria um evento a partir do orçamento
    const evento = await Evento.create({
      orcamentoId: orcamento.id,
      clienteId: orcamento.clienteId,
      nome: `Evento de ${orcamento.cliente ? orcamento.cliente.nome : 'Cliente'}`,
      dataEvento: orcamento.dataValidade || new Date(),
      observacoes: orcamento.observacoes,
      status: 'pendente'
    });

    // remove o orçamento após enviar para eventos
    await orcamento.destroy();

    return res.json({
      success: true,
      message: "Orçamento enviado para eventos com sucesso!",
      data: evento,
    });
  } catch (error) {
    return next(error);
  }
}

// Rejeita o orçamento e o remove
async function rejeitarOrcamento(req, res, next) {
  try {
    const orcamento = await Orcamento.findByPk(req.params.id);
    if (!orcamento) {
      return res.status(404).json({ success: false, message: "Orçamento não encontrado." });
    }

    await orcamento.update({ status: 'reprovado', deletadoEm: new Date() });

    return res.json({
      success: true,
      message: "Orçamento rejeitado e removido com sucesso!",
    });
  } catch (error) {
    return next(error);
  }
}

module.exports = {
  listar,
  buscarPorId,
  criar,
  atualizar,
  mudarStatus,
  remover,
  confirmarOrcamento,
  rejeitarOrcamento,
};
