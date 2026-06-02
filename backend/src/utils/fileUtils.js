const path = require('path');
const fs = require('fs').promises;

const EXT_PARA_TIPO = {
  jpg: 'jpg',
  jpeg: 'jpg',
  png: 'png',
};

const EXTENSOES_PERMITIDAS = new Set(['.jpg', '.jpeg', '.png', '.pdf']);

const DIRETORIOS_BASE = [
  process.env.DOCS_DIR,
  path.resolve(__dirname, '..', '..', '..', 'docs'),
  path.resolve(__dirname, '..', '..', '..'),
  path.resolve(__dirname, '..', '..'),
  __dirname,
].filter(Boolean);

function detectarTipo(caminho) {
  if (!caminho) return 'pdf';
  const ext = path.extname(caminho).replace('.', '').toLowerCase();
  return EXT_PARA_TIPO[ext] || 'pdf';
}

function isUrlExterna(caminho) {
  return !!caminho && /^https?:\/\//i.test(caminho);
}

async function arquivoExiste(caminho) {
  try {
    await fs.access(caminho);
    return true;
  } catch {
    return false;
  }
}

async function sanitizarCaminhoLocal(caminho) {
  if (!caminho || typeof caminho !== 'string') return null;

  if (caminho.includes('..')) return null;

  // Tradução de caminho do Windows para ambiente Unix (ex: Docker)
  let caminhoTratado = caminho;
  if (process.platform !== 'win32' && /^[a-zA-Z]:[/\\]/i.test(caminho)) {
    caminhoTratado = caminho.replace(/^[a-zA-Z]:[/\\]/i, '/').replace(/\\/g, '/');
  }

  const ext = path.extname(caminhoTratado).toLowerCase();
  if (!EXTENSOES_PERMITIDAS.has(ext)) return null;

  if (path.isAbsolute(caminhoTratado)) {
    return caminhoTratado;
  }

  for (const dir of DIRETORIOS_BASE) {
    if (!dir) continue;
    const tentativa = path.resolve(dir, caminhoTratado);
    try {
      await fs.access(tentativa);
      return tentativa;
    } catch {}
  }

  return path.resolve(process.cwd(), caminhoTratado);
}

module.exports = {
  detectarTipo,
  isUrlExterna,
  arquivoExiste,
  sanitizarCaminhoLocal,
};
