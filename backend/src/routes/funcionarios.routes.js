// ============================================================
// Rotas: Funcionários
// ============================================================
const router = require('express').Router();
const auth = require('../middleware/auth');
const authorize = require('../middleware/roles');
const controller = require('../controllers/funcionarioController');

router.use(auth);

router.get('/', controller.listar);
router.get('/:id', controller.buscarPorId);
router.post('/', authorize('gerente'), controller.criar);
router.put('/:id', authorize('gerente'), controller.atualizar);
router.delete('/:id', authorize('gerente'), controller.remover);
router.get('/:id/whatsapp', controller.whatsapp);


module.exports = router;
