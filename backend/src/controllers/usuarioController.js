const bcrypt = require('bcryptjs');
const { Usuario } = require('../models');

async function listar(req, res, next) {
  try {
    const usuarios = await Usuario.findAll({
      attributes: ['id', 'nome', 'email', 'role', 'criadoEm'],
      order: [['nome', 'ASC']]
    });
    return res.json({ success: true, data: usuarios, pagination: { total: usuarios.length } });
  } catch (error) {
    return next(error);
  }
}

async function criar(req, res, next) {
  try {
    const { nome, email, senha, role } = req.body;

    if (!nome || !email || !senha) {
      return res.status(400).json({
        success: false,
        message: 'Nome, email e senha são obrigatórios.',
      });
    }

    const userRole = role === 'gerente' ? 'gerente' : 'operador';
    const hash = await bcrypt.hash(senha, 10);

    const usuario = await Usuario.create({
      nome,
      email,
      senha: hash,
      role: userRole
    });

    return res.status(201).json({
      success: true,
      message: 'Usuário criado com sucesso!',
      data: { id: usuario.id, nome: usuario.nome, email: usuario.email, role: usuario.role }
    });
  } catch (error) {
    if (error.name === 'SequelizeUniqueConstraintError') {
      return res.status(400).json({ success: false, message: 'Email já cadastrado.' });
    }
    return next(error);
  }
}

async function atualizar(req, res, next) {
  try {
    const usuario = await Usuario.findByPk(req.params.id);
    if (!usuario) {
      return res.status(404).json({ success: false, message: 'Usuário não encontrado.' });
    }

    const { nome, email, role, senha } = req.body;
    let hash = usuario.senha;
    if (senha) {
      hash = await bcrypt.hash(senha, 10);
    }

    const userRole = role === 'gerente' ? 'gerente' : 'operador';

    await usuario.update({
      nome: nome || usuario.nome,
      email: email || usuario.email,
      role: role ? userRole : usuario.role,
      senha: hash
    });

    return res.json({
      success: true,
      message: 'Usuário atualizado com sucesso!',
      data: { id: usuario.id, nome: usuario.nome, email: usuario.email, role: usuario.role }
    });
  } catch (error) {
    if (error.name === 'SequelizeUniqueConstraintError') {
      return res.status(400).json({ success: false, message: 'Email já cadastrado.' });
    }
    return next(error);
  }
}

async function remover(req, res, next) {
  try {
    const usuario = await Usuario.findByPk(req.params.id);
    if (!usuario) {
      return res.status(404).json({ success: false, message: 'Usuário não encontrado.' });
    }

    await usuario.destroy();

    return res.json({
      success: true,
      message: 'Usuário removido com sucesso!',
    });
  } catch (error) {
    return next(error);
  }
}

module.exports = { listar, criar, atualizar, remover };
