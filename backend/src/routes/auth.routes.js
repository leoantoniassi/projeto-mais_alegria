// ============================================================
// Rotas: Autenticação
// ============================================================
const router = require('express').Router();
const { register, login, solicitarRecuperacaoSenha, redefinirSenha } = require('../controllers/authController');

router.post('/register', register);
router.post('/login', login);
router.post('/recuperar-senha', solicitarRecuperacaoSenha);
router.post('/redefinir-senha', redefinirSenha);

module.exports = router;
