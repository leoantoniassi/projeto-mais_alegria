// ============================================================
// Rotas: Escala (Alocação de Funcionários em Eventos)
// ============================================================
const router = require('express').Router();
const auth = require('../middleware/auth');
const controller = require('../controllers/escalaController');

router.use(auth);

router.post('/', controller.alocar);
router.delete('/:id', controller.remover);
router.get('/evento/:eventoId', controller.listarPorEvento);

module.exports = router;
