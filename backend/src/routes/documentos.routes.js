// ============================================================
// Rotas: Documentos
// ============================================================
const router = require('express').Router();
const auth = require('../middleware/auth');
const authorize = require('../middleware/roles');
const controller = require('../controllers/documentoController');

router.use(auth);

router.get('/', controller.listar);
router.post('/', controller.criar);
router.put('/:id', controller.atualizar);
router.delete('/:id', authorize('admin'), controller.remover);

module.exports = router;
