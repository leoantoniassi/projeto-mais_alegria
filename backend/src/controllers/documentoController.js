// ============================================================
// Controller: Documentos (sem upload — caminho/link manual)
// ============================================================
const path = require('path');
const { Documento, Cliente, Evento } = require('../models');

// Detecta o tipo pelo caminho/URL do arquivo
function detectarTipo(caminho) {
  if (!caminho) return 'pdf';
  const ext = path.extname(caminho).replace('.', '').toLowerCase();
  if (ext === 'jpg' || ext === 'jpeg') return 'jpg';
  if (ext === 'png') return 'png';
  return 'pdf'; // padrão para .pdf, .docx, etc.
}

// GET /api/documentos
async function listar(req, res, next) {
  try {
    const { clienteId, eventoId } = req.query;

    const where = {};
    if (clienteId) where.clienteId = clienteId;
    if (eventoId) where.eventoId = eventoId;

    const documentos = await Documento.findAll({
      where,
      include: [
        { model: Cliente, as: 'cliente', attributes: ['id', 'nome'] },
        { model: Evento, as: 'evento', attributes: ['id', 'nome'] },
      ],
      order: [['criadoEm', 'DESC']],
    });

    return res.json({ success: true, data: documentos });
  } catch (error) {
    return next(error);
  }
}

// POST /api/documentos
async function criar(req, res, next) {
  try {
    const { nomeArquivo, caminhoUrl, clienteId, eventoId } = req.body;

    if (!nomeArquivo) {
      return res.status(400).json({ success: false, message: 'O nome do documento é obrigatório.' });
    }
    if (!caminhoUrl) {
      return res.status(400).json({ success: false, message: 'A localização do arquivo é obrigatória.' });
    }

    const tipoArquivo = detectarTipo(caminhoUrl);

    const documento = await Documento.create({
      nomeArquivo,
      caminhoUrl,
      tipoArquivo,
      clienteId: clienteId || null,
      eventoId: eventoId || null,
    });

    return res.status(201).json({
      success: true,
      message: 'Documento cadastrado com sucesso!',
      data: documento,
    });
  } catch (error) {
    return next(error);
  }
}

// PUT /api/documentos/:id
async function atualizar(req, res, next) {
  try {
    const documento = await Documento.findByPk(req.params.id);
    if (!documento) {
      return res.status(404).json({ success: false, message: 'Documento não encontrado.' });
    }

    const { nomeArquivo, caminhoUrl, clienteId, eventoId } = req.body;

    const novoTipo = caminhoUrl ? detectarTipo(caminhoUrl) : documento.tipoArquivo;

    await documento.update({
      nomeArquivo: nomeArquivo || documento.nomeArquivo,
      caminhoUrl: caminhoUrl || documento.caminhoUrl,
      tipoArquivo: novoTipo,
      clienteId: clienteId !== undefined ? (clienteId || null) : documento.clienteId,
      eventoId: eventoId !== undefined ? (eventoId || null) : documento.eventoId,
      atualizadoEm: new Date(),
    });

    return res.json({
      success: true,
      message: 'Documento atualizado com sucesso!',
      data: documento,
    });
  } catch (error) {
    return next(error);
  }
}

// DELETE /api/documentos/:id (soft delete)
async function remover(req, res, next) {
  try {
    const documento = await Documento.findByPk(req.params.id);
    if (!documento) {
      return res.status(404).json({ success: false, message: 'Documento não encontrado.' });
    }

    await documento.update({ deletadoEm: new Date() });

    return res.json({ success: true, message: 'Documento removido com sucesso!' });
  } catch (error) {
    return next(error);
  }
}

module.exports = { listar, criar, atualizar, remover };
