// ============================================================
// Models Index — Registra todos os modelos e suas associações
// ============================================================
const Usuario = require('./Usuario');
const Cliente = require('./Cliente');
const Funcionario = require('./Funcionario');
const Produto = require('./Produto');
const Orcamento = require('./Orcamento');
const Evento = require('./Evento');
const Documento = require('./Documento');
const Escala = require('./Escala');
const EventoProduto = require('./EventoProduto');
const OrcamentoProduto = require('./OrcamentoProduto');

// ── Cliente 1:N Orcamento ──────────────────────────────────
Cliente.hasMany(Orcamento, { foreignKey: 'clienteId', as: 'orcamentos' });
Orcamento.belongsTo(Cliente, { foreignKey: 'clienteId', as: 'cliente' });

// ── Cliente 1:N Evento ─────────────────────────────────────
Cliente.hasMany(Evento, { foreignKey: 'clienteId', as: 'eventos' });
Evento.belongsTo(Cliente, { foreignKey: 'clienteId', as: 'cliente' });

// ── Orcamento 1:N Evento ───────────────────────────────────
Orcamento.hasMany(Evento, { foreignKey: 'orcamentoId', as: 'eventos' });
Evento.belongsTo(Orcamento, { foreignKey: 'orcamentoId', as: 'orcamento' });

// ── Cliente 1:N Documento ──────────────────────────────────
Cliente.hasMany(Documento, { foreignKey: 'clienteId', as: 'documentos' });
Documento.belongsTo(Cliente, { foreignKey: 'clienteId', as: 'cliente' });

// ── Evento 1:N Documento ───────────────────────────────────
Evento.hasMany(Documento, { foreignKey: 'eventoId', as: 'documentos' });
Documento.belongsTo(Evento, { foreignKey: 'eventoId', as: 'evento' });

// ── Evento N:M Funcionario (via Escala) ────────────────────
Evento.belongsToMany(Funcionario, {
  through: Escala,
  foreignKey: 'eventoId',
  otherKey: 'funcionarioId',
  as: 'funcionarios',
});
Funcionario.belongsToMany(Evento, {
  through: Escala,
  foreignKey: 'funcionarioId',
  otherKey: 'eventoId',
  as: 'eventos',
});

// Associações diretas na tabela Escala (para queries diretas)
Escala.belongsTo(Evento, { foreignKey: 'eventoId', as: 'evento' });
Escala.belongsTo(Funcionario, { foreignKey: 'funcionarioId', as: 'funcionario' });
Evento.hasMany(Escala, { foreignKey: 'eventoId', as: 'escala' });
Funcionario.hasMany(Escala, { foreignKey: 'funcionarioId', as: 'escala' });

// ── Evento N:M Produto (via EventoProduto) ─────────────────
Evento.belongsToMany(Produto, {
  through: EventoProduto,
  foreignKey: 'eventoId',
  otherKey: 'produtoId',
  as: 'produtos',
});
Produto.belongsToMany(Evento, {
  through: EventoProduto,
  foreignKey: 'produtoId',
  otherKey: 'eventoId',
  as: 'eventos',
});

EventoProduto.belongsTo(Evento, { foreignKey: 'eventoId', as: 'evento' });
EventoProduto.belongsTo(Produto, { foreignKey: 'produtoId', as: 'produto' });
Evento.hasMany(EventoProduto, { foreignKey: 'eventoId', as: 'eventoProdutos' });
Produto.hasMany(EventoProduto, { foreignKey: 'produtoId', as: 'eventoProdutos' });

// ── Orcamento N:M Produto (via OrcamentoProduto) ───────────
Orcamento.belongsToMany(Produto, {
  through: OrcamentoProduto,
  foreignKey: 'orcamentoId',
  otherKey: 'produtoId',
  as: 'produtos',
});
Produto.belongsToMany(Orcamento, {
  through: OrcamentoProduto,
  foreignKey: 'produtoId',
  otherKey: 'orcamentoId',
  as: 'orcamentos',
});

OrcamentoProduto.belongsTo(Orcamento, { foreignKey: 'orcamentoId', as: 'orcamento' });
OrcamentoProduto.belongsTo(Produto, { foreignKey: 'produtoId', as: 'produto' });
Orcamento.hasMany(OrcamentoProduto, { foreignKey: 'orcamentoId', as: 'orcamentoProdutos' });
Produto.hasMany(OrcamentoProduto, { foreignKey: 'produtoId', as: 'orcamentoProdutos' });

module.exports = {
  Usuario,
  Cliente,
  Funcionario,
  Produto,
  Orcamento,
  Evento,
  Documento,
  Escala,
  EventoProduto,
  OrcamentoProduto,
};
