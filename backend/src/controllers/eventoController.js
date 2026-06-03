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

// ─── Funções auxiliares (DRY) ──────────────────────────────────

function gerarWarningCapacidade(local, qtdPessoas) {
  if (!local || !local.capacidadeMaxima || qtdPessoas === undefined || qtdPessoas === null) return null;
  if (typeof qtdPessoas !== 'number' || Number.isNaN(qtdPessoas) || qtdPessoas < 0) return null;
  if (qtdPessoas > local.capacidadeMaxima) {
    return `A quantidade de convidados (${qtdPessoas}) excede a capacidade máxima do local "${local.nome}" (${local.capacidadeMaxima} pessoas).`;
  }
  return null;
}

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
        { model: Local,   as: "local",   attributes: ["id", "nome", "cidade", "estado", "capacidadeMaxima"] },
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

    if (qtdPessoas === undefined || qtdPessoas === null || qtdPessoas < 0) {
      return res.status(400).json({
        success: false,
        message: "O campo Total de Pessoas é obrigatório e deve ser um número não negativo.",
      });
    }

    const camposNumericos = { qtdPessoas, qtdAdultos, qtdCriancas, qtdBebes };
    for (const [chave, valor] of Object.entries(camposNumericos)) {
      if (valor !== undefined && valor !== null && (typeof valor !== 'number' || Number.isNaN(valor) || valor < 0)) {
        return res.status(400).json({
          success: false,
          message: `O campo ${chave} deve ser um número não negativo.`,
        });
      }
    }

    const cliente = await Cliente.findByPk(clienteId);
    if (!cliente) {
      return res.status(404).json({
        success: false,
        message: "Cliente não encontrado.",
      });
    }

    let warning;

    if (localId) {
      const localExiste = await Local.findByPk(localId);
      if (!localExiste) {
        return res.status(404).json({ success: false, message: "Local não encontrado." });
      }
      warning = gerarWarningCapacidade(localExiste, qtdPessoas);
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
      warning,
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

    let warning;

    if (localId !== undefined && localId !== null) {
      const localExiste = await Local.findByPk(localId);
      if (!localExiste) {
        return res.status(404).json({ success: false, message: "Local não encontrado." });
      }
      const novaQtd = qtdPessoas !== undefined ? qtdPessoas : evento.qtdPessoas;
      warning = gerarWarningCapacidade(localExiste, novaQtd);
    }

    const novoOrcamentoId = orcamentoId ? orcamentoId : orcamentoId === "" ? null : evento.orcamentoId;
    if (orcamentoId && orcamentoId !== evento.orcamentoId) {
      const orcObj = await Orcamento.findByPk(orcamentoId);
      if (orcObj) {
        orcamentoValor = Number(orcObj.valorTotal);
      }
    }

    const novaPessoas = qtdPessoas !== undefined ? qtdPessoas : evento.qtdPessoas;

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
      warning,
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
