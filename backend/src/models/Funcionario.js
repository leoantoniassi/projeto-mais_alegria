// ============================================================
// Model: Funcionario (tabela: funcionarios)
// ============================================================
const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Funcionario = sequelize.define('Funcionario', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
    field: 'fun_id',
  },
  nome: {
    type: DataTypes.STRING(150),
    allowNull: false,
    field: 'fun_nome',
  },
  email: {
    type: DataTypes.STRING(150),
    allowNull: false,
    unique: true,
    field: 'fun_email',
  },
  telefone: {
    type: DataTypes.STRING(20),
    allowNull: true,
    field: 'fun_telefone',
  },
  funcao: {
    type: DataTypes.STRING(80),
    allowNull: false,
    field: 'fun_funcao',
  },
  criadoEm: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: DataTypes.NOW,
    field: 'fun_criado_em',
  },
  atualizadoEm: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: DataTypes.NOW,
    field: 'fun_atualizado_em',
  },
  deletadoEm: {
    type: DataTypes.DATE,
    allowNull: true,
    field: 'fun_deletado_em',
  },
}, {
  tableName: 'funcionarios',
  timestamps: false,
  defaultScope: {
    where: { deletadoEm: null },
  },
  scopes: {
    comDeletados: {},
  },
});

module.exports = Funcionario;
