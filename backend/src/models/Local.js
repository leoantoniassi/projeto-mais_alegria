// ============================================================
// Model: Local (tabela: locais)
// ============================================================
const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Local = sequelize.define('Local', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
    field: 'loc_id',
  },
  nome: {
    type: DataTypes.STRING(150),
    allowNull: false,
    field: 'loc_nome',
  },
  logradouro: {
    type: DataTypes.STRING(200),
    allowNull: false,
    field: 'loc_logradouro',
  },
  numero: {
    type: DataTypes.STRING(10),
    allowNull: false,
    field: 'loc_numero',
  },
  complemento: {
    type: DataTypes.STRING(100),
    allowNull: true,
    field: 'loc_complemento',
  },
  bairro: {
    type: DataTypes.STRING(100),
    allowNull: false,
    field: 'loc_bairro',
  },
  cidade: {
    type: DataTypes.STRING(100),
    allowNull: false,
    field: 'loc_cidade',
  },
  estado: {
    type: DataTypes.CHAR(2),
    allowNull: false,
    field: 'loc_estado',
  },
  cep: {
    type: DataTypes.STRING(9),
    allowNull: false,
    field: 'loc_cep',
  },
  observacoes: {
    type: DataTypes.TEXT,
    allowNull: true,
    field: 'loc_observacoes',
  },
  criadoEm: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: DataTypes.NOW,
    field: 'loc_criado_em',
  },
  atualizadoEm: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: DataTypes.NOW,
    field: 'loc_atualizado_em',
  },
  deletadoEm: {
    type: DataTypes.DATE,
    allowNull: true,
    field: 'loc_deletado_em',
  },
}, {
  tableName: 'locais',
  timestamps: false,
  defaultScope: {
    where: { deletadoEm: null },
  },
  scopes: {
    comDeletados: {},
  },
});

module.exports = Local;
