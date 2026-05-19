// ============================================================
// Routes: Lookup Tables (funcoes, categorias)
// ============================================================
const router = require('express').Router();
const auth = require('../middleware/auth');
const ctrl = require('../controllers/lookupController');

router.use(auth);

// Funcoes
router.get('/funcoes',              ctrl.listarFuncoes);
router.post('/funcoes',             ctrl.criarFuncao);
router.delete('/funcoes/:id',       ctrl.removerFuncao);

// Categorias Fornecedor
router.get('/categorias-fornecedor',         ctrl.listarCategoriasFornecedor);
router.post('/categorias-fornecedor',        ctrl.criarCategoriaFornecedor);
router.delete('/categorias-fornecedor/:id',  ctrl.removerCategoriaFornecedor);

// Categorias Produto
router.get('/categorias-produto',            ctrl.listarCategoriasProduto);
router.post('/categorias-produto',           ctrl.criarCategoriaProduto);
router.delete('/categorias-produto/:id',     ctrl.removerCategoriaProduto);

module.exports = router;
