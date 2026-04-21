// ============================================================
// Rotas: Clientes
// ============================================================
const router = require('express').Router();
const auth = require('../middleware/auth');
const authorize = require('../middleware/roles');
const controller = require('../controllers/clienteController');

router.use(auth); // Todas as rotas exigem autenticação

router.get('/', controller.listar);
router.get('/:id', controller.buscarPorId);
router.get('/:id/whatsapp', controller.whatsapp);
router.post('/', controller.criar);
router.put('/:id', controller.atualizar);
router.delete('/:id', authorize('admin', 'gerente'), controller.remover);

module.exports = router;
