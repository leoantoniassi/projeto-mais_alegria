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
router.patch('/:id/status', authorize('gerente'), controller.mudarStatus);
router.post('/:id/confirmar', authorize('gerente'), controller.confirmarOrcamento);
router.post('/:id/rejeitar', authorize('gerente'), controller.rejeitarOrcamento);
router.delete('/:id', authorize('gerente'), controller.remover);

module.exports = router;
