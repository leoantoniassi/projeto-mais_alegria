// ============================================================
// Model: Fornecedor (tabela: fornecedores)
// ============================================================
const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Fornecedor = sequelize.define('Fornecedor', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
    field: 'for_id',
  },
  nome: {
    type: DataTypes.STRING(150),
    allowNull: false,
    field: 'for_nome',
  },
  email: {
    type: DataTypes.STRING(150),
    allowNull: false,
    unique: true,
    field: 'for_email',
  },
  cnpj: {
    type: DataTypes.STRING(20),
    allowNull: false,
    unique: true,
    field: 'for_cnpj',
  },
  telefone: {
    type: DataTypes.STRING(20),
    allowNull: false,
    field: 'for_telefone',
  },
  categoria: {
    type: DataTypes.STRING(80),
    allowNull: false,
    field: 'for_categoria',
  },
  criadoEm: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: DataTypes.NOW,
    field: 'for_criado_em',
  },
  atualizadoEm: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: DataTypes.NOW,
    field: 'for_atualizado_em',
  },
  deletadoEm: {
    type: DataTypes.DATE,
    allowNull: true,
    field: 'for_deletado_em',
  },
}, {
  tableName: 'fornecedores',
  timestamps: false,
  defaultScope: {
    where: { deletadoEm: null },
  },
  scopes: {
    comDeletados: {},
  },
});

module.exports = Fornecedor;
