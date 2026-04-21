// ============================================================
// Utilitário: Gerar link WhatsApp
// ============================================================

/**
 * Gera a URL do WhatsApp Web/App a partir de um número de telefone.
 * Remove caracteres não numéricos e assume DDI 55 (Brasil) se não presente.
 *
 * @param {string} telefone - Número do telefone (ex: "(11) 98765-4321")
 * @param {string} [mensagem] - Mensagem pré-preenchida (opcional)
 * @returns {string} URL do WhatsApp
 */
function gerarLinkWhatsApp(telefone, mensagem = '') {
  // Remove tudo que não é dígito
  let numero = telefone.replace(/\D/g, '');

  // Adiciona DDI 55 (Brasil) se não começar com 55
  if (!numero.startsWith('55')) {
    numero = '55' + numero;
  }

  const url = `https://wa.me/${numero}`;

  if (mensagem) {
    return `${url}?text=${encodeURIComponent(mensagem)}`;
  }

  return url;
}

module.exports = { gerarLinkWhatsApp };
