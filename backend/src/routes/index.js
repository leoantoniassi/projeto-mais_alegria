// ============================================================
// Routes Index — Agrupa todas as rotas sob /api
// ============================================================
const router = require('express').Router();

router.use('/auth', require('./auth.routes'));
router.use('/clientes', require('./clientes.routes'));
router.use('/funcionarios', require('./funcionarios.routes'));
router.use('/produtos', require('./produtos.routes'));
router.use('/orcamentos', require('./orcamentos.routes'));
router.use('/eventos', require('./eventos.routes'));
router.use('/documentos', require('./documentos.routes'));
router.use('/escala', require('./escala.routes'));
router.use('/dashboard', require('./dashboard.routes'));

module.exports = router;
