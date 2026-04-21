// ============================================================
// Model: Produto (tabela: produtos)
// ============================================================
const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Produto = sequelize.define('Produto', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
    field: 'prd_id',
  },
  nome: {
    type: DataTypes.STRING(150),
    allowNull: false,
    field: 'prd_nome',
  },
  categoria: {
    type: DataTypes.STRING(80),
    allowNull: false,
    field: 'prd_categoria',
  },
  quantidade: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
    defaultValue: 0,
    field: 'prd_quantidade',
  },
  unidadeMedida: {
    type: DataTypes.STRING(30),
    allowNull: false,
    field: 'prd_unidade_medida',
  },
  custoUnitario: {
    type: DataTypes.DECIMAL(12, 2),
    allowNull: false,
    defaultValue: 0,
    field: 'prd_custo_unitario',
  },
  criadoEm: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: DataTypes.NOW,
    field: 'prd_criado_em',
  },
  atualizadoEm: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: DataTypes.NOW,
    field: 'prd_atualizado_em',
  },
  deletadoEm: {
    type: DataTypes.DATE,
    allowNull: true,
    field: 'prd_deletado_em',
  },
}, {
  tableName: 'produtos',
  timestamps: false,
  defaultScope: {
    where: { deletadoEm: null },
  },
  scopes: {
    comDeletados: {},
  },
});

module.exports = Produto;
