// ============================================================
// Routes: Catálogos
// ============================================================
const router = require('express').Router();
const auth = require('../middleware/auth');
const ctrl = require('../controllers/catalogoController');
const authorize = require('../middleware/roles');

// Todas as rotas exigem autenticação
router.use(auth);

router.get('/', ctrl.listar);
router.post('/', ctrl.criar);
router.put('/:id', ctrl.atualizar);
router.delete('/:id', authorize('gerente'), ctrl.remover);

module.exports = router;
