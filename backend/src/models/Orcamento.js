// ============================================================
// Model: Orcamento (tabela: orcamentos)
// ============================================================
const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

const Orcamento = sequelize.define(
  "Orcamento",
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
      field: "orc_id",
    },
    clienteId: {
      type: DataTypes.UUID,
      allowNull: false,
      field: "orc_cli_id",
    },
    valorTotal: {
      type: DataTypes.DECIMAL(12, 2),
      allowNull: false,
      defaultValue: 0,
      field: "orc_valor_total",
    },
    dataValidade: {
      type: DataTypes.DATEONLY,
      allowNull: true,
      field: "orc_data_validade",
    },
    status: {
      type: DataTypes.STRING(20),
      allowNull: false,
      defaultValue: "pendente",
      field: "orc_status",
      validate: {
        isIn: [["pendente", "aprovado", "reprovado"]],
      },
    },
    local: {
      type: DataTypes.STRING(255),
      allowNull: true,
      field: "orc_local",
    },
    observacoes: {
      type: DataTypes.TEXT,
      allowNull: true,
      field: "orc_observacoes",
    },
    criadoEm: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
      field: "orc_criado_em",
    },
    atualizadoEm: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
      field: "orc_atualizado_em",
    },
    deletadoEm: {
      type: DataTypes.DATE,
      allowNull: true,
      field: "orc_deletado_em",
    },
  },
  {
    tableName: "orcamentos",
    timestamps: false,
    defaultScope: {
      where: { deletadoEm: null },
    },
    scopes: {
      comDeletados: {},
    },
  },
);

module.exports = Orcamento;
