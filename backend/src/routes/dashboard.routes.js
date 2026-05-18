// ============================================================
// Rotas: Dashboard
// ============================================================
const router = require('express').Router();
const auth = require('../middleware/auth');
const controller = require('../controllers/dashboardController');

router.use(auth);

router.get('/stats', controller.stats);
router.get('/proximos-eventos', controller.proximosEventos);
router.get('/charts', controller.charts);

module.exports = router;
