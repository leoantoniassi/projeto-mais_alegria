const router = require('express').Router();
const auth = require('../middleware/auth');
const authorize = require('../middleware/roles');
const controller = require('../controllers/documentoController');

router.use(auth);

router.get('/', authorize('admin', 'gerente', 'usuario'), controller.listar);
router.get('/:id/arquivo', authorize('admin', 'gerente', 'usuario'), controller.abrirArquivo);
router.post('/', authorize('admin', 'gerente'), controller.criar);
router.put('/:id', authorize('admin', 'gerente'), controller.atualizar);
router.delete('/:id', authorize('gerente'), controller.remover);

module.exports = router;
