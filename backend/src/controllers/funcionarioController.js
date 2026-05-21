// ============================================================
// Controller: Funcionários
// ============================================================
const { Op } = require('sequelize');
const { Funcionario, Funcao } = require('../models');
const { gerarLinkWhatsApp } = require('../utils/whatsapp');

// GET /api/funcionarios
async function listar(req, res, next) {
  try {
    const { page = 1, limit = 20, busca, funcaoId } = req.query;
    const offset = (page - 1) * limit;

    const where = {};
    if (busca) {
      where[Op.or] = [
        { nome:  { [Op.iLike]: `%${busca}%` } },
        { email: { [Op.iLike]: `%${busca}%` } },
      ];
    }
    if (funcaoId) {
      where.funcaoId = funcaoId;
    }

    const { count, rows } = await Funcionario.findAndCountAll({
      where,
      include: [{ model: Funcao, as: 'funcao', attributes: ['id', 'nome'] }],
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
    const funcionario = await Funcionario.findByPk(req.params.id, {
      include: [{ model: Funcao, as: 'funcao', attributes: ['id', 'nome'] }],
    });
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
    const { nome, email, telefone, funcaoId } = req.body;

    if (!nome || !email || !funcaoId) {
      return res.status(400).json({
        success: false,
        message: 'Nome, email e função são obrigatórios.',
      });
    }

    const funcaoExiste = await Funcao.findByPk(funcaoId);
    if (!funcaoExiste) {
      return res.status(404).json({ success: false, message: 'Função não encontrada.' });
    }

    const funcionario = await Funcionario.create({ nome, email, telefone, funcaoId });
    const funcionarioCompleto = await Funcionario.findByPk(funcionario.id, {
      include: [{ model: Funcao, as: 'funcao', attributes: ['id', 'nome'] }],
    });

    return res.status(201).json({
      success: true,
      message: 'Funcionário criado com sucesso!',
      data: funcionarioCompleto,
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

    const { nome, email, telefone, funcaoId } = req.body;

    if (funcaoId) {
      const funcaoExiste = await Funcao.findByPk(funcaoId);
      if (!funcaoExiste) {
        return res.status(404).json({ success: false, message: 'Função não encontrada.' });
      }
    }

    await funcionario.update({
      nome:     nome     || funcionario.nome,
      email:    email    || funcionario.email,
      telefone: telefone !== undefined ? telefone : funcionario.telefone,
      funcaoId: funcaoId || funcionario.funcaoId,
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

// GET /api/funcionarios/:id/whatsapp
async function whatsapp(req, res, next) {
  try {
    const funcionario = await Funcionario.findByPk(req.params.id);
    if (!funcionario) {
      return res.status(404).json({
        success: false,
        message: 'Funcionário não encontrado.',
      });
    }

    if (!funcionario.telefone) {
      return res.status(400).json({
        success: false,
        message: 'Funcionário não possui telefone cadastrado.',
      });
    }

    const link = gerarLinkWhatsApp(
      funcionario.telefone,
      `Olá ${funcionario.nome}, aqui é a equipe Mais Alegria.`
    );

    return res.json({
      success: true,
      data: { link, telefone: funcionario.telefone },
    });
  } catch (error) {
    return next(error);
  }
}

module.exports = { listar, buscarPorId, criar, atualizar, remover, whatsapp };
