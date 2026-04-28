// ============================================================
// Rotas: Orçamentos
// ============================================================
const router = require('express').Router();
const auth = require('../middleware/auth');
const authorize = require('../middleware/roles');
const controller = require('../controllers/orcamentoController');

router.use(auth);

router.get('/', controller.listar);
router.get('/:id', controller.buscarPorId);
router.post('/', controller.criar);
router.put('/:id', controller.atualizar);
router.patch('/:id/status', authorize('admin', 'gerente'), controller.mudarStatus);
router.post('/:id/confirmar', authorize('admin', 'gerente'), controller.confirmarOrcamento);
router.post('/:id/rejeitar', authorize('admin', 'gerente'), controller.rejeitarOrcamento);
router.delete('/:id', authorize('admin', 'gerente'), controller.remover);

module.exports = router;
