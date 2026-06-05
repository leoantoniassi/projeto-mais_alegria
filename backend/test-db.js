const { Orcamento, Cliente, Local, OrcamentoProduto, Produto } = require('./src/models');
const sequelize = require('./src/config/database');

const includesOrcamentoDetalhado = [
  { model: Cliente, as: "cliente", attributes: ["id", "nome"] },
  { model: Local,   as: "local",   attributes: ["id", "nome", "cidade", "estado"] },
  { model: OrcamentoProduto, as: "orcamentoProdutos", separate: true, include: [{ model: Produto, as: "produto" }] },
];

async function test() {
  try {
    console.log('Testing reload query...');
    const orc = await Orcamento.findOne();
    if (orc) {
      await orc.reload({ include: includesOrcamentoDetalhado });
      console.log('Success reloading!');
    } else {
      console.log('No budget found to reload');
    }
  } catch (err) {
    console.error('ERROR STACK:');
    console.error(err);
  } finally {
    await sequelize.close();
  }
}

test();
