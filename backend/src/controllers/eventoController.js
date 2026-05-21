// ============================================================
// Controller: Eventos
// ============================================================
const { Op } = require("sequelize");
const {
  Evento,
  Cliente,
  Local,
  Orcamento,
  Funcionario,
  Funcao,
  Escala,
  EventoProduto,
  Produto,
  CategoriaProduto,
  Documento,
} = require("../models");
const { gerarLinkWhatsApp } = require('../utils/whatsapp');

// GET /api/eventos
async function listar(req, res, next) {
  try {
    // Auto-concluir eventos cuja data já passou
    const hoje = new Date();
    hoje.setHours(0, 0, 0, 0);
    await Evento.update(
      { status: 'concluido', atualizadoEm: new Date() },
      {
        where: {
          dataEvento: { [Op.lt]: hoje },
          status: { [Op.in]: ['pendente', 'confirmado'] },
          deletadoEm: null,
        },
      }
    );

    const { page = 1, limit = 20, status, localId, incluirConcluidos } = req.query;
    const offset = (page - 1) * limit;

    const where = { deletadoEm: null };
    if (status) {
      where.status = status;
    } else if (incluirConcluidos !== 'true') {
      where.status = { [Op.ne]: 'concluido' };
    }
    if (localId) {
      where.localId = localId;
    }

    const { count, rows } = await Evento.findAndCountAll({
      where,
      include: [
        { model: Cliente, as: "cliente", attributes: ["id", "nome"] },
        { model: Local,   as: "local",   attributes: ["id", "nome", "cidade", "estado"] },
      ],
      limit: parseInt(limit),
      offset: parseInt(offset),
      order: [["dataEvento", "ASC"]],
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

// GET /api/eventos/:id
async function buscarPorId(req, res, next) {
  try {
    const evento = await Evento.findByPk(req.params.id, {
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
        { model: Orcamento, as: "orcamento" },
        {
          model: Escala,
          as: "escala",
          include: [{ model: Funcionario, as: "funcionario", include: [{ model: Funcao, as: 'funcao' }] }],
        },
        {
          model: EventoProduto,
          as: "eventoProdutos",
          include: [{ model: Produto, as: "produto", include: [{ model: CategoriaProduto, as: 'categoria' }] }],
        },
        { model: Documento, as: "documentos" },
      ],
    });

    if (!evento) {
      return res.status(404).json({
        success: false,
        message: "Evento não encontrado.",
      });
    }

    return res.json({ success: true, data: evento });
  } catch (error) {
    return next(error);
  }
}

// POST /api/eventos
async function criar(req, res, next) {
  try {
    const {
      clienteId,
      orcamentoId,
      localId,
      nome,
      dataEvento,
      status,
      qtdPessoas,
      qtdAdultos,
      qtdCriancas,
      qtdBebes,
      observacoes,
    } = req.body;

    let { orcamento: orcamentoValor } = req.body;

    if (!clienteId || !nome || !dataEvento) {
      return res.status(400).json({
        success: false,
        message: "Cliente, nome e data do evento são obrigatórios.",
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

    if (orcamentoId) {
      const orcObj = await Orcamento.findByPk(orcamentoId);
      if (orcObj) {
        orcamentoValor = Number(orcObj.valorTotal);
      }
    }

    // RN Canvas 2: Evento confirmado requer orçamento aprovado
    if (status === "confirmado") {
      if (!orcamentoId) {
        return res.status(400).json({
          success: false,
          message: "Um evento confirmado precisa de um orçamento aprovado associado.",
        });
      }
      const orcamento = await Orcamento.findByPk(orcamentoId);
      if (!orcamento || orcamento.status !== "aprovado") {
        return res.status(400).json({
          success: false,
          message: 'O orçamento associado precisa estar com status "aprovado".',
        });
      }
    }

    // RN4: Controle de público > 50 pessoas
    if (qtdPessoas && qtdPessoas > 50) {
      if (!qtdAdultos && !qtdCriancas && !qtdBebes) {
        return res.status(400).json({
          success: false,
          message: "Para eventos com mais de 50 pessoas, é obrigatório informar a quantidade de adultos, crianças e bebês.",
        });
      }
    }

    const evento = await Evento.create({
      clienteId,
      orcamentoId: orcamentoId || null,
      localId:     localId     || null,
      nome,
      dataEvento,
      status: status || "pendente",
      qtdPessoas,
      qtdAdultos,
      qtdCriancas,
      qtdBebes,
      valorOrcamento: orcamentoValor || 0,
      observacoes,
    });

    return res.status(201).json({
      success: true,
      message: "Evento criado com sucesso!",
      data: evento,
    });
  } catch (error) {
    return next(error);
  }
}

// PUT /api/eventos/:id
async function atualizar(req, res, next) {
  try {
    const evento = await Evento.findByPk(req.params.id);
    if (!evento) {
      return res.status(404).json({
        success: false,
        message: "Evento não encontrado.",
      });
    }

    const {
      clienteId,
      orcamentoId,
      localId,
      nome,
      dataEvento,
      qtdPessoas,
      qtdAdultos,
      qtdCriancas,
      qtdBebes,
      observacoes,
    } = req.body;

    let { orcamento: orcamentoValor } = req.body;

    if (localId !== undefined && localId !== null) {
      const localExiste = await Local.findByPk(localId);
      if (!localExiste) {
        return res.status(404).json({ success: false, message: "Local não encontrado." });
      }
    }

    const novoOrcamentoId = orcamentoId ? orcamentoId : orcamentoId === "" ? null : evento.orcamentoId;
    if (orcamentoId && orcamentoId !== evento.orcamentoId) {
      const orcObj = await Orcamento.findByPk(orcamentoId);
      if (orcObj) {
        orcamentoValor = Number(orcObj.valorTotal);
      }
    }

    // RN4: Controle de público > 50
    const novaPessoas = qtdPessoas !== undefined ? qtdPessoas : evento.qtdPessoas;
    if (novaPessoas && novaPessoas > 50) {
      const novoAdultos  = qtdAdultos  !== undefined ? qtdAdultos  : evento.qtdAdultos;
      const novoCriancas = qtdCriancas !== undefined ? qtdCriancas : evento.qtdCriancas;
      const novoBebes    = qtdBebes    !== undefined ? qtdBebes    : evento.qtdBebes;
      if (!novoAdultos && !novoCriancas && !novoBebes) {
        return res.status(400).json({
          success: false,
          message: "Para eventos com mais de 50 pessoas, é obrigatório informar a quantidade de adultos, crianças e bebês.",
        });
      }
    }

    await evento.update({
      clienteId:     clienteId     || evento.clienteId,
      orcamentoId:   novoOrcamentoId,
      localId:       localId       !== undefined ? localId       : evento.localId,
      nome:          nome          || evento.nome,
      dataEvento:    dataEvento    || evento.dataEvento,
      qtdPessoas:    qtdPessoas    !== undefined ? qtdPessoas    : evento.qtdPessoas,
      qtdAdultos:    qtdAdultos    !== undefined ? qtdAdultos    : evento.qtdAdultos,
      qtdCriancas:   qtdCriancas   !== undefined ? qtdCriancas   : evento.qtdCriancas,
      qtdBebes:      qtdBebes      !== undefined ? qtdBebes      : evento.qtdBebes,
      valorOrcamento: orcamentoValor !== undefined ? orcamentoValor : evento.valorOrcamento,
      observacoes:   observacoes   !== undefined ? observacoes   : evento.observacoes,
      atualizadoEm: new Date(),
    });

    return res.json({
      success: true,
      message: "Evento atualizado com sucesso!",
      data: evento,
    });
  } catch (error) {
    return next(error);
  }
}

// PATCH /api/eventos/:id/status
async function mudarStatus(req, res, next) {
  try {
    const evento = await Evento.findByPk(req.params.id);
    if (!evento) {
      return res.status(404).json({
        success: false,
        message: "Evento não encontrado.",
      });
    }

    const { status } = req.body;
    if (!["pendente", "confirmado", "concluido", "cancelado"].includes(status)) {
      return res.status(400).json({
        success: false,
        message: "Status inválido. Use: pendente, confirmado, concluido ou cancelado.",
      });
    }

    // RN Canvas 2: Evento confirmado requer orçamento aprovado
    if (status === "confirmado" && !evento.orcamentoId) {
      return res.status(400).json({
        success: false,
        message: "Para confirmar o evento, é necessário um orçamento aprovado associado.",
      });
    }

    if (status === "confirmado" && evento.orcamentoId) {
      const orcamento = await Orcamento.findByPk(evento.orcamentoId);
      if (!orcamento || orcamento.status !== "aprovado") {
        return res.status(400).json({
          success: false,
          message: 'O orçamento associado precisa estar com status "aprovado".',
        });
      }
    }

    await evento.update({ status, atualizadoEm: new Date() });

    return res.json({
      success: true,
      message: `Status do evento alterado para "${status}"!`,
      data: evento,
    });
  } catch (error) {
    return next(error);
  }
}

// DELETE /api/eventos/:id (soft delete)
async function remover(req, res, next) {
  try {
    const evento = await Evento.findByPk(req.params.id);
    if (!evento) {
      return res.status(404).json({
        success: false,
        message: "Evento não encontrado.",
      });
    }

    await evento.update({ deletadoEm: new Date() });

    return res.json({
      success: true,
      message: "Evento removido com sucesso!",
    });
  } catch (error) {
    return next(error);
  }
}

// GET /api/eventos/:id/whatsapp
async function whatsapp(req, res, next) {
  try {
    const evento = await Evento.findByPk(req.params.id, {
      include: [{ model: Cliente, as: 'cliente' }]
    });

    if (!evento) {
      return res.status(404).json({
        success: false,
        message: 'Evento não encontrado.',
      });
    }

    if (!evento.cliente || !evento.cliente.telefone) {
      return res.status(400).json({
        success: false,
        message: 'Cliente do evento não possui telefone cadastrado.',
      });
    }

    const link = gerarLinkWhatsApp(
      evento.cliente.telefone,
      `Olá ${evento.cliente.nome}, aqui é a equipe Mais Alegria falando sobre o evento "${evento.nome}".`
    );

    return res.json({
      success: true,
      data: { link, telefone: evento.cliente.telefone },
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
  whatsapp,
};
