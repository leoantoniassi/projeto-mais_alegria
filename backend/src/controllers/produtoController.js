// ============================================================
// Controller: Produtos (Estoque)
// ============================================================
const { Op } = require('sequelize');
const { Produto } = require('../models');

// GET /api/produtos
async function listar(req, res, next) {
  try {
    const { page = 1, limit = 20, busca, categoria } = req.query;
    const offset = (page - 1) * limit;

    const where = {};
    if (busca) {
      where.nome = { [Op.iLike]: `%${busca}%` };
    }
    if (categoria) {
      where.categoria = { [Op.iLike]: `%${categoria}%` };
    }

    const { count, rows } = await Produto.findAndCountAll({
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

// GET /api/produtos/:id
async function buscarPorId(req, res, next) {
  try {
    const produto = await Produto.findByPk(req.params.id);
    if (!produto) {
      return res.status(404).json({
        success: false,
        message: 'Produto não encontrado.',
      });
    }

    return res.json({ success: true, data: produto });
  } catch (error) {
    return next(error);
  }
}

// POST /api/produtos
async function criar(req, res, next) {
  try {
    const { nome, categoria, quantidade, unidadeMedida, custoUnitario } = req.body;

    if (!nome || !categoria || !unidadeMedida) {
      return res.status(400).json({
        success: false,
        message: 'Nome, categoria e unidade de medida são obrigatórios.',
      });
    }

    const produto = await Produto.create({
      nome,
      categoria,
      quantidade: quantidade || 0,
      unidadeMedida,
      custoUnitario: custoUnitario || 0,
    });

    return res.status(201).json({
      success: true,
      message: 'Produto criado com sucesso!',
      data: produto,
    });
  } catch (error) {
    return next(error);
  }
}

// PUT /api/produtos/:id
async function atualizar(req, res, next) {
  try {
    const produto = await Produto.findByPk(req.params.id);
    if (!produto) {
      return res.status(404).json({
        success: false,
        message: 'Produto não encontrado.',
      });
    }

    const { nome, categoria, quantidade, unidadeMedida, custoUnitario } = req.body;
    await produto.update({
      nome: nome || produto.nome,
      categoria: categoria || produto.categoria,
      quantidade: quantidade !== undefined ? quantidade : produto.quantidade,
      unidadeMedida: unidadeMedida || produto.unidadeMedida,
      custoUnitario: custoUnitario !== undefined ? custoUnitario : produto.custoUnitario,
      atualizadoEm: new Date(),
    });

    return res.json({
      success: true,
      message: 'Produto atualizado com sucesso!',
      data: produto,
    });
  } catch (error) {
    return next(error);
  }
}

// DELETE /api/produtos/:id (soft delete)
async function remover(req, res, next) {
  try {
    const produto = await Produto.findByPk(req.params.id);
    if (!produto) {
      return res.status(404).json({
        success: false,
        message: 'Produto não encontrado.',
      });
    }

    await produto.update({ deletadoEm: new Date() });

    return res.json({
      success: true,
      message: 'Produto removido com sucesso!',
    });
  } catch (error) {
    return next(error);
  }
}

module.exports = { listar, buscarPorId, criar, atualizar, remover };
