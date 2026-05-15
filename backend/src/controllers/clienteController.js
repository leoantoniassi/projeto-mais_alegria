// ============================================================
// Controller: Clientes
// ============================================================
const { Op } = require('sequelize');
const { Cliente, Orcamento, Evento, Documento } = require('../models');
const { gerarLinkWhatsApp } = require('../utils/whatsapp');

// GET /api/clientes
async function listar(req, res, next) {
  try {
    const { page = 1, limit = 20, busca } = req.query;
    const offset = (page - 1) * limit;

    const where = {};
    if (busca) {
      where[Op.or] = [
        { nome: { [Op.iLike]: `%${busca}%` } },
        { email: { [Op.iLike]: `%${busca}%` } },
        { rgCpf: { [Op.iLike]: `%${busca}%` } },
      ];
    }

    const { count, rows } = await Cliente.findAndCountAll({
      where,
      limit: parseInt(limit),
      offset: parseInt(offset),
      order: [['nome', 'ASC']],
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

// GET /api/clientes/:id
async function buscarPorId(req, res, next) {
  try {
    const cliente = await Cliente.findByPk(req.params.id, {
      include: [
        { model: Orcamento, as: 'orcamentos' },
        { model: Evento, as: 'eventos' },
        { model: Documento, as: 'documentos' },
      ],
    });

    if (!cliente) {
      return res.status(404).json({
        success: false,
        message: 'Cliente não encontrado.',
      });
    }

    return res.json({ success: true, data: cliente });
  } catch (error) {
    return next(error);
  }
}

// POST /api/clientes
async function criar(req, res, next) {
  try {
    const { nome, email, rgCpf, telefone } = req.body;

    if (!nome || !email || !rgCpf || !telefone) {
      return res.status(400).json({
        success: false,
        message: 'Nome, email, RG/CPF e telefone são obrigatórios.',
      });
    }

    const cliente = await Cliente.create({ nome, email, rgCpf, telefone });

    return res.status(201).json({
      success: true,
      message: 'Cliente criado com sucesso!',
      data: cliente,
    });
  } catch (error) {
    return next(error);
  }
}

// PUT /api/clientes/:id
async function atualizar(req, res, next) {
  try {
    const cliente = await Cliente.findByPk(req.params.id);
    if (!cliente) {
      return res.status(404).json({
        success: false,
        message: 'Cliente não encontrado.',
      });
    }

    const { nome, email, rgCpf, telefone } = req.body;
    await cliente.update({
      nome: nome || cliente.nome,
      email: email || cliente.email,
      rgCpf: rgCpf || cliente.rgCpf,
      telefone: telefone || cliente.telefone,
      atualizadoEm: new Date(),
    });

    return res.json({
      success: true,
      message: 'Cliente atualizado com sucesso!',
      data: cliente,
    });
  } catch (error) {
    return next(error);
  }
}

// DELETE /api/clientes/:id (soft delete)
async function remover(req, res, next) {
  try {
    const cliente = await Cliente.findByPk(req.params.id);
    if (!cliente) {
      return res.status(404).json({
        success: false,
        message: 'Cliente não encontrado.',
      });
    }

    await cliente.update({ deletadoEm: new Date() });

    return res.json({
      success: true,
      message: 'Cliente removido com sucesso!',
    });
  } catch (error) {
    return next(error);
  }
}

// GET /api/clientes/:id/whatsapp
async function whatsapp(req, res, next) {
  try {
    const cliente = await Cliente.findByPk(req.params.id);
    if (!cliente) {
      return res.status(404).json({
        success: false,
        message: 'Cliente não encontrado.',
      });
    }

    const link = gerarLinkWhatsApp(
      cliente.telefone,
      `Ola ${cliente.nome}, aqui e a equipe Mais Alegria.`
    );

    return res.json({
      success: true,
      data: { link, telefone: cliente.telefone },
    });
  } catch (error) {
    return next(error);
  }
}

module.exports = { listar, buscarPorId, criar, atualizar, remover, whatsapp };
