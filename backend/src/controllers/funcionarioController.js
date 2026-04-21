// ============================================================
// Controller: Funcionários
// ============================================================
const { Op } = require('sequelize');
const { Funcionario } = require('../models');

// GET /api/funcionarios
async function listar(req, res, next) {
  try {
    const { page = 1, limit = 20, busca, funcao } = req.query;
    const offset = (page - 1) * limit;

    const where = {};
    if (busca) {
      where[Op.or] = [
        { nome: { [Op.iLike]: `%${busca}%` } },
        { email: { [Op.iLike]: `%${busca}%` } },
      ];
    }
    if (funcao) {
      where.funcao = { [Op.iLike]: `%${funcao}%` };
    }

    const { count, rows } = await Funcionario.findAndCountAll({
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

// GET /api/funcionarios/:id
async function buscarPorId(req, res, next) {
  try {
    const funcionario = await Funcionario.findByPk(req.params.id);
    if (!funcionario) {
      return res.status(404).json({
        success: false,
        message: 'Funcionário não encontrado.',
      });
    }

    return res.json({ success: true, data: funcionario });
  } catch (error) {
    return next(error);
  }
}

// POST /api/funcionarios
async function criar(req, res, next) {
  try {
    const { nome, email, telefone, funcao } = req.body;

    if (!nome || !email || !funcao) {
      return res.status(400).json({
        success: false,
        message: 'Nome, email e função são obrigatórios.',
      });
    }

    const funcionario = await Funcionario.create({ nome, email, telefone, funcao });

    return res.status(201).json({
      success: true,
      message: 'Funcionário criado com sucesso!',
      data: funcionario,
    });
  } catch (error) {
    return next(error);
  }
}

// PUT /api/funcionarios/:id
async function atualizar(req, res, next) {
  try {
    const funcionario = await Funcionario.findByPk(req.params.id);
    if (!funcionario) {
      return res.status(404).json({
        success: false,
        message: 'Funcionário não encontrado.',
      });
    }

    const { nome, email, telefone, funcao } = req.body;
    await funcionario.update({
      nome: nome || funcionario.nome,
      email: email || funcionario.email,
      telefone: telefone !== undefined ? telefone : funcionario.telefone,
      funcao: funcao || funcionario.funcao,
      atualizadoEm: new Date(),
    });

    return res.json({
      success: true,
      message: 'Funcionário atualizado com sucesso!',
      data: funcionario,
    });
  } catch (error) {
    return next(error);
  }
}

// DELETE /api/funcionarios/:id (soft delete)
async function remover(req, res, next) {
  try {
    const funcionario = await Funcionario.findByPk(req.params.id);
    if (!funcionario) {
      return res.status(404).json({
        success: false,
        message: 'Funcionário não encontrado.',
      });
    }

    await funcionario.update({ deletadoEm: new Date() });

    return res.json({
      success: true,
      message: 'Funcionário removido com sucesso!',
    });
  } catch (error) {
    return next(error);
  }
}

module.exports = { listar, buscarPorId, criar, atualizar, remover };
