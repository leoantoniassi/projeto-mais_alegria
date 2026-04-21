// ============================================================
// Rotas: Documentos
// ============================================================
const router = require('express').Router();
const auth = require('../middleware/auth');
const authorize = require('../middleware/roles');
const controller = require('../controllers/documentoController');

router.use(auth);

router.get('/', controller.listar);
router.post('/upload', controller.upload.single('arquivo'), controller.uploadDocumento);
router.get('/:id/download', controller.download);
router.delete('/:id', authorize('admin'), controller.remover);

module.exports = router;
