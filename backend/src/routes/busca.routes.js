// ============================================================
// Rotas: Busca Global
// ============================================================
const router = require('express').Router();
const auth = require('../middleware/auth');
const controller = require('../controllers/buscaGlobalController');

router.use(auth); // Requer autenticação

router.get('/', controller.buscar);

module.exports = router;
