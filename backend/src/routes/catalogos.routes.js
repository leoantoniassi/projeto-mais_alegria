// ============================================================
// Routes: Catálogos
// ============================================================
const router = require('express').Router();
const auth = require('../middleware/auth');
const ctrl = require('../controllers/catalogoController');

// Todas as rotas exigem autenticação
router.use(auth);

router.get('/', ctrl.listar);
router.post('/', ctrl.criar);
router.put('/:id', ctrl.atualizar);
router.delete('/:id', ctrl.remover);

module.exports = router;
