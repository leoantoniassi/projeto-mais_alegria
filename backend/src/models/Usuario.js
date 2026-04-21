// ============================================================
// Model: Usuario (tabela: usuarios)
// ============================================================
const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Usuario = sequelize.define('Usuario', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
    field: 'usr_id',
  },
  nome: {
    type: DataTypes.STRING(150),
    allowNull: false,
    field: 'usr_nome',
  },
  email: {
    type: DataTypes.STRING(150),
    allowNull: false,
    unique: true,
    field: 'usr_email',
  },
  senha: {
    type: DataTypes.STRING(255),
    allowNull: false,
    field: 'usr_senha',
  },
  role: {
    type: DataTypes.STRING(20),
    allowNull: false,
    defaultValue: 'operador',
    field: 'usr_role',
    validate: {
      isIn: [['admin', 'gerente', 'operador']],
    },
  },
  criadoEm: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: DataTypes.NOW,
    field: 'usr_criado_em',
  },
}, {
  tableName: 'usuarios',
  timestamps: false,
});

module.exports = Usuario;
