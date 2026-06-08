// ============================================================
// Controller: Autenticação (Login / Register)
// ============================================================
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const { Op } = require('sequelize');
const { Usuario } = require('../models');
const { enviarEmailRecuperacaoSenha } = require('../services/emailService');

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

    // Verifica senha (converte hash $2y$ para $2a$ para garantir compatibilidade com o bcryptjs)
    const hashCompativel = usuario.senha.replace(/^\$2y\$/, '$2a$');
    const senhaValida = await bcrypt.compare(senha, hashCompativel);
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

// POST /api/auth/recuperar-senha (público)
async function solicitarRecuperacaoSenha(req, res, next) {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        success: false,
        message: 'O e-mail é obrigatório.',
      });
    }

    // Validação de formato simples
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(email))) {
      return res.status(400).json({
        success: false,
        message: 'Formato de e-mail inválido.',
      });
    }

    const usuario = await Usuario.findOne({ where: { email } });

    // [OWASP A07] Anti-enumeração de contas: sempre retorna resposta genérica de sucesso
    const mensagemSucesso = 'Se o e-mail estiver cadastrado, você receberá um link para redefinir sua senha.';

    if (!usuario) {
      return res.json({
        success: true,
        message: mensagemSucesso,
      });
    }

    // Gera token de 32 bytes (hex de 64 caracteres)
    const token = crypto.randomBytes(32).toString('hex');
    const expiracao = new Date(Date.now() + 60 * 60 * 1000); // 1 hora de expiração

    await usuario.update({
      resetToken: token,
      resetExpiracao: expiracao,
    });

    // Envia o e-mail de recuperação de forma assíncrona
    await enviarEmailRecuperacaoSenha({
      nome: usuario.nome,
      email: usuario.email,
      token,
    });

    return res.json({
      success: true,
      message: mensagemSucesso,
    });
  } catch (error) {
    return next(error);
  }
}

// POST /api/auth/redefinir-senha (público)
async function redefinirSenha(req, res, next) {
  try {
    const { token, senha } = req.body;

    if (!token || !senha) {
      return res.status(400).json({
        success: false,
        message: 'Token e senha são obrigatórios.',
      });
    }

    const senhaTrimmed = String(senha).trim();
    if (senhaTrimmed.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'A senha deve ter no mínimo 6 caracteres.',
      });
    }

    // Valida se token é hex de 64 caracteres
    if (!/^[a-f0-9]{64}$/.test(String(token))) {
      return res.status(400).json({
        success: false,
        message: 'Token inválido ou expirado. Solicite a redefinição de senha novamente.',
      });
    }

    // Busca usuário pelo token e expiração
    const usuario = await Usuario.findOne({
      where: {
        resetToken: token,
        resetExpiracao: { [Op.gt]: new Date() },
      },
    });

    if (!usuario) {
      return res.status(400).json({
        success: false,
        message: 'Token inválido ou expirado. Solicite a redefinição de senha novamente.',
      });
    }

    // Hash da nova senha
    const salt = await bcrypt.genSalt(10);
    const senhaHash = await bcrypt.hash(senhaTrimmed, salt);

    // Atualiza senha e anula campos de reset
    await usuario.update({
      senha: senhaHash,
      resetToken: null,
      resetExpiracao: null,
    });

    return res.json({
      success: true,
      message: 'Senha redefinida com sucesso! Você já pode fazer login.',
    });
  } catch (error) {
    return next(error);
  }
}

module.exports = { register, login, solicitarRecuperacaoSenha, redefinirSenha };
