// ============================================================
// Routes: Locais
// ============================================================
const router = require('express').Router();
const auth = require('../middleware/auth');
const ctrl = require('../controllers/localController');

router.use(auth);

router.get('/',    ctrl.listar);
router.get('/:id', ctrl.buscarPorId);
router.post('/',   ctrl.criar);
router.put('/:id', ctrl.atualizar);
router.delete('/:id', ctrl.remover);

module.exports = router;
