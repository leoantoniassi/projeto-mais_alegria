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
router.post('/', controller.criar);
router.put('/:id', controller.atualizar);
router.delete('/:id', authorize('admin', 'gerente'), controller.remover);

module.exports = router;
