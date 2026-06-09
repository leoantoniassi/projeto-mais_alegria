const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

function isValidUUID(value) {
  return typeof value === 'string' && UUID_REGEX.test(value);
}

function gerarWarningPessoas(qtdPessoas, qtdAdultos, qtdCriancas, qtdBebes, contexto = "no evento") {
  const totalPessoas = Number(qtdPessoas) || 0;
  const totalDetalhado = (Number(qtdAdultos) || 0) + (Number(qtdCriancas) || 0) + (Number(qtdBebes) || 0);
  
  if (totalPessoas !== totalDetalhado) {
    return `As informações de pessoas ${contexto} não coincidem: a soma de adultos, crianças e bebês (${totalDetalhado}) é diferente do total de pessoas (${totalPessoas}).`;
  }
  return null;
}

module.exports = { isValidUUID, gerarWarningPessoas };