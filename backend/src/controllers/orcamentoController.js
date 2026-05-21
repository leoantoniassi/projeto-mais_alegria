// ============================================================
// Controller: Orçamentos
// ============================================================
const { Op } = require("sequelize");
const {
  Orcamento,
  Cliente,
  Local,
  OrcamentoProduto,
  Produto,
  CategoriaProduto,
  Evento,
} = require("../models");
const { gerarLinkWhatsApp } = require('../utils/whatsapp');

// GET /api/orcamentos
async function listar(req, res, next) {
  try {
    const { page = 1, limit = 20, status, localId } = req.query;
    const offset = (page - 1) * limit;

    const where = {};
    if (status) {
      where.status = status;
    }
    if (localId) {
      where.localId = localId;
    }

    const { count, rows } = await Orcamento.findAndCountAll({
      where,
      include: [
        {
          model: Cliente,
          as: "cliente",
          attributes: ["id", "nome", "email", "telefone"],
        },
        {
          model: Local,
          as: "local",
          attributes: ["id", "nome", "cidade", "estado"],
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
          model: Local,
          as: "local",
        },
        {
          model: OrcamentoProduto,
          as: "orcamentoProdutos",
          include: [{ model: Produto, as: "produto", include: [{ model: CategoriaProduto, as: 'categoria' }] }],
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
      localId,
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

    const cliente = await Cliente.findByPk(clienteId);
    if (!cliente) {
      return res.status(404).json({
        success: false,
        message: "Cliente não encontrado.",
      });
    }

    if (localId) {
      const localExiste = await Local.findByPk(localId);
      if (!localExiste) {
        return res.status(404).json({ success: false, message: "Local não encontrado." });
      }
    }

    const orcamento = await Orcamento.create({
      clienteId,
      localId: localId || null,
      valorTotal: valorTotal || 0,
      dataValidade,
      status: status || "pendente",
      observacoes,
    });

    if (produtos && Array.isArray(produtos) && produtos.length > 0) {
      const orcamentoProdutos = produtos.map((p) => ({
        orcamentoId: orcamento.id,
        produtoId:   p.produtoId,
        quantidade:  p.quantidade  || 0,
        precoUnitario: p.precoUnitario || 0,
      }));
      await OrcamentoProduto.bulkCreate(orcamentoProdutos);
    }

    const orcamentoCompleto = await Orcamento.findByPk(orcamento.id, {
      include: [
        { model: Cliente, as: "cliente", attributes: ["id", "nome"] },
        { model: Local,   as: "local",   attributes: ["id", "nome", "cidade", "estado"] },
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

    const { clienteId, localId, valorTotal, dataValidade, observacoes } = req.body;

    if (localId !== undefined && localId !== null) {
      const localExiste = await Local.findByPk(localId);
      if (!localExiste) {
        return res.status(404).json({ success: false, message: "Local não encontrado." });
      }
    }

    await orcamento.update({
      clienteId:    clienteId    || orcamento.clienteId,
      localId:      localId      !== undefined ? localId      : orcamento.localId,
      valorTotal:   valorTotal   !== undefined ? valorTotal   : orcamento.valorTotal,
      dataValidade: dataValidade !== undefined ? dataValidade : orcamento.dataValidade,
      observacoes:  observacoes  !== undefined ? observacoes  : orcamento.observacoes,
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
      include: [{ model: Cliente, as: "cliente" }],
    });

    if (!orcamento) {
      return res
        .status(404)
        .json({ success: false, message: "Orçamento não encontrado." });
    }

    // Converte dataValidade (DATEONLY) para TIMESTAMP sem deslocamento de fuso
    let dataEvento = new Date();
    if (orcamento.dataValidade) {
      const dv = String(orcamento.dataValidade);
      dataEvento = /^\d{4}-\d{2}-\d{2}$/.test(dv)
        ? new Date(dv + 'T12:00:00')
        : new Date(dv);
    }

    // Cria um evento a partir do orçamento, herdando o local
    const evento = await Evento.create({
      orcamentoId:   orcamento.id,
      clienteId:     orcamento.clienteId,
      localId:       orcamento.localId || null,
      nome:          `Evento de ${orcamento.cliente ? orcamento.cliente.nome : "Cliente"}`,
      dataEvento,
      observacoes:   orcamento.observacoes,
      valorOrcamento: orcamento.valorTotal || 0,
      status:        "pendente",
    });

    await orcamento.update({
      status:       "aprovado",
      deletadoEm:   new Date(),
      atualizadoEm: new Date(),
    });

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
      return res
        .status(404)
        .json({ success: false, message: "Orçamento não encontrado." });
    }

    await orcamento.update({ status: "reprovado", deletadoEm: new Date() });

    return res.json({
      success: true,
      message: "Orçamento rejeitado e removido com sucesso!",
    });
  } catch (error) {
    return next(error);
  }
}

// GET /api/orcamentos/:id/whatsapp
async function whatsapp(req, res, next) {
  try {
    const orcamento = await Orcamento.findByPk(req.params.id, {
      include: [{ model: Cliente, as: 'cliente' }]
    });

    if (!orcamento) {
      return res.status(404).json({
        success: false,
        message: 'Orçamento não encontrado.',
      });
    }

    if (!orcamento.cliente || !orcamento.cliente.telefone) {
      return res.status(400).json({
        success: false,
        message: 'Cliente do orçamento não possui telefone cadastrado.',
      });
    }

    const link = gerarLinkWhatsApp(
      orcamento.cliente.telefone,
      `Olá ${orcamento.cliente.nome}, aqui é a equipe Mais Alegria falando sobre o seu orçamento.`
    );

    return res.json({
      success: true,
      data: { link, telefone: orcamento.cliente.telefone },
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
  whatsapp,
};
