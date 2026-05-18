// ============================================================
// Rotas de Usuários
// ============================================================
const router = require('express').Router();
const auth = require('../middleware/auth');
const authorize = require('../middleware/roles');
const controller = require('../controllers/usuarioController');

// Todas as rotas exigem autenticação
router.use(auth);

// Listagem de usuários
router.get('/', controller.listar);

// Criação, atualização e remoção exigem perfil 'gerente'
router.post('/', authorize('gerente'), controller.criar);
router.put('/:id', authorize('gerente'), controller.atualizar);
router.delete('/:id', authorize('gerente'), controller.remover);

module.exports = router;
