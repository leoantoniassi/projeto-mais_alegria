// ============================================================
// Controller: Eventos
// ============================================================
const { Op } = require('sequelize');
const {
  Evento, Cliente, Orcamento, Funcionario,
  Escala, EventoProduto, Produto, Documento,
} = require('../models');

// GET /api/eventos
async function listar(req, res, next) {
  try {
    const { page = 1, limit = 20, status } = req.query;
    const offset = (page - 1) * limit;

    const where = {};
    if (status) {
      where.status = status;
    }

    const { count, rows } = await Evento.findAndCountAll({
      where,
      include: [
        { model: Cliente, as: 'cliente', attributes: ['id', 'nome', 'telefone'] },
      ],
      limit: parseInt(limit),
      offset: parseInt(offset),
      order: [['dataEvento', 'ASC']],
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
        { model: Cliente, as: 'cliente', attributes: ['id', 'nome', 'email', 'telefone'] },
        { model: Orcamento, as: 'orcamento' },
        {
          model: Escala,
          as: 'escala',
          include: [{ model: Funcionario, as: 'funcionario' }],
        },
        {
          model: EventoProduto,
          as: 'eventoProdutos',
          include: [{ model: Produto, as: 'produto' }],
        },
        { model: Documento, as: 'documentos' },
      ],
    });

    if (!evento) {
      return res.status(404).json({
        success: false,
        message: 'Evento não encontrado.',
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
      clienteId, orcamentoId, nome, dataEvento, local,
      status, qtdPessoas, qtdAdultos, qtdCriancas, qtdBebes, observacoes,
    } = req.body;

    if (!clienteId || !nome || !dataEvento) {
      return res.status(400).json({
        success: false,
        message: 'Cliente, nome e data do evento são obrigatórios.',
      });
    }

    // Verifica se cliente existe
    const cliente = await Cliente.findByPk(clienteId);
    if (!cliente) {
      return res.status(404).json({
        success: false,
        message: 'Cliente não encontrado.',
      });
    }

    // RN Canvas 2: Evento confirmado requer orçamento aprovado
    if (status === 'confirmado') {
      if (!orcamentoId) {
        return res.status(400).json({
          success: false,
          message: 'Um evento confirmado precisa de um orçamento aprovado associado.',
        });
      }
      const orcamento = await Orcamento.findByPk(orcamentoId);
      if (!orcamento || orcamento.status !== 'aprovado') {
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
          message: 'Para eventos com mais de 50 pessoas, é obrigatório informar a quantidade de adultos, crianças e bebês.',
        });
      }
    }

    const evento = await Evento.create({
      clienteId,
      orcamentoId: orcamentoId || null,
      nome,
      dataEvento,
      local,
      status: status || 'pendente',
      qtdPessoas,
      qtdAdultos,
      qtdCriancas,
      qtdBebes,
      observacoes,
    });

    return res.status(201).json({
      success: true,
      message: 'Evento criado com sucesso!',
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
        message: 'Evento não encontrado.',
      });
    }

    const {
      clienteId, orcamentoId, nome, dataEvento, local,
      qtdPessoas, qtdAdultos, qtdCriancas, qtdBebes, observacoes,
    } = req.body;

    // RN4: Controle de público > 50
    const novaPessoas = qtdPessoas !== undefined ? qtdPessoas : evento.qtdPessoas;
    if (novaPessoas && novaPessoas > 50) {
      const novoAdultos = qtdAdultos !== undefined ? qtdAdultos : evento.qtdAdultos;
      const novoCriancas = qtdCriancas !== undefined ? qtdCriancas : evento.qtdCriancas;
      const novoBebes = qtdBebes !== undefined ? qtdBebes : evento.qtdBebes;
      if (!novoAdultos && !novoCriancas && !novoBebes) {
        return res.status(400).json({
          success: false,
          message: 'Para eventos com mais de 50 pessoas, é obrigatório informar a quantidade de adultos, crianças e bebês.',
        });
      }
    }

    await evento.update({
      clienteId: clienteId || evento.clienteId,
      orcamentoId: orcamentoId !== undefined ? orcamentoId : evento.orcamentoId,
      nome: nome || evento.nome,
      dataEvento: dataEvento || evento.dataEvento,
      local: local !== undefined ? local : evento.local,
      qtdPessoas: qtdPessoas !== undefined ? qtdPessoas : evento.qtdPessoas,
      qtdAdultos: qtdAdultos !== undefined ? qtdAdultos : evento.qtdAdultos,
      qtdCriancas: qtdCriancas !== undefined ? qtdCriancas : evento.qtdCriancas,
      qtdBebes: qtdBebes !== undefined ? qtdBebes : evento.qtdBebes,
      observacoes: observacoes !== undefined ? observacoes : evento.observacoes,
      atualizadoEm: new Date(),
    });

    return res.json({
      success: true,
      message: 'Evento atualizado com sucesso!',
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
        message: 'Evento não encontrado.',
      });
    }

    const { status } = req.body;
    if (!['pendente', 'confirmado', 'concluido', 'cancelado'].includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Status inválido. Use: pendente, confirmado, concluido ou cancelado.',
      });
    }

    // RN Canvas 2: Evento confirmado requer orçamento aprovado
    if (status === 'confirmado' && !evento.orcamentoId) {
      return res.status(400).json({
        success: false,
        message: 'Para confirmar o evento, é necessário um orçamento aprovado associado.',
      });
    }

    if (status === 'confirmado' && evento.orcamentoId) {
      const orcamento = await Orcamento.findByPk(evento.orcamentoId);
      if (!orcamento || orcamento.status !== 'aprovado') {
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
        message: 'Evento não encontrado.',
      });
    }

    await evento.update({ deletadoEm: new Date() });

    return res.json({
      success: true,
      message: 'Evento removido com sucesso!',
    });
  } catch (error) {
    return next(error);
  }
}

module.exports = { listar, buscarPorId, criar, atualizar, mudarStatus, remover };
