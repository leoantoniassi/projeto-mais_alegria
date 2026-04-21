// ============================================================
// Controller: Autenticação (Login / Register)
// ============================================================
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const { Usuario } = require('../models');

// POST /api/auth/register
async function register(req, res, next) {
  try {
    const { nome, email, senha, role } = req.body;

    if (!nome || !email || !senha) {
      return res.status(400).json({
        success: false,
        message: 'Nome, email e senha são obrigatórios.',
      });
    }

    // Verifica se email já existe
    const existente = await Usuario.findOne({ where: { email } });
    if (existente) {
      return res.status(409).json({
        success: false,
        message: 'Este email já está cadastrado.',
      });
    }

    // Hash da senha
    const salt = await bcrypt.genSalt(10);
    const senhaHash = await bcrypt.hash(senha, salt);

    const usuario = await Usuario.create({
      nome,
      email,
      senha: senhaHash,
      role: role || 'operador',
    });

    // Gera token
    const token = jwt.sign(
      { id: usuario.id, email: usuario.email, role: usuario.role },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN || '24h' }
    );

    return res.status(201).json({
      success: true,
      message: 'Usuário criado com sucesso!',
      data: {
        id: usuario.id,
        nome: usuario.nome,
        email: usuario.email,
        role: usuario.role,
      },
      token,
    });
  } catch (error) {
    return next(error);
  }
}

// POST /api/auth/login
async function login(req, res, next) {
  try {
    const { email, senha } = req.body;

    if (!email || !senha) {
      return res.status(400).json({
        success: false,
        message: 'Email e senha são obrigatórios.',
      });
    }

    // Busca usuário pelo email
    const usuario = await Usuario.findOne({ where: { email } });
    if (!usuario) {
      return res.status(401).json({
        success: false,
        message: 'Credenciais inválidas.',
      });
    }

    // Verifica senha
    const senhaValida = await bcrypt.compare(senha, usuario.senha);
    if (!senhaValida) {
      return res.status(401).json({
        success: false,
        message: 'Credenciais inválidas.',
      });
    }

    // Gera token
    const token = jwt.sign(
      { id: usuario.id, email: usuario.email, role: usuario.role },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN || '24h' }
    );

    return res.json({
      success: true,
      message: 'Login realizado com sucesso!',
      data: {
        id: usuario.id,
        nome: usuario.nome,
        email: usuario.email,
        role: usuario.role,
      },
      token,
    });
  } catch (error) {
    return next(error);
  }
}

module.exports = { register, login };
