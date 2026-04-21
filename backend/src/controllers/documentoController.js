// ============================================================
// Controller: Documentos (Upload / Download)
// ============================================================
const path = require('path');
const fs = require('fs');
const multer = require('multer');
const { Documento, Cliente, Evento } = require('../models');

// ── Configuração do Multer ─────────────────────────────────
const storage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    const uploadDir = path.join(__dirname, '..', '..', 'uploads');
    // Garante que o diretório existe
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: (_req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    const ext = path.extname(file.originalname);
    cb(null, `${uniqueSuffix}${ext}`);
  },
});

const fileFilter = (_req, file, cb) => {
  const allowedTypes = ['application/pdf', 'image/jpeg', 'image/png'];
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Tipo de arquivo não permitido. Use PDF, JPG ou PNG.'), false);
  }
};

const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
});

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

// POST /api/documentos/upload
async function uploadDocumento(req, res, next) {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'Nenhum arquivo enviado.',
      });
    }

    const { clienteId, eventoId, nomeArquivo } = req.body;

    // Determina o tipo do arquivo
    const ext = path.extname(req.file.originalname).replace('.', '').toLowerCase();
    const tipoArquivo = ext === 'jpeg' ? 'jpg' : ext;

    const documento = await Documento.create({
      clienteId: clienteId || null,
      eventoId: eventoId || null,
      nomeArquivo: nomeArquivo || req.file.originalname,
      caminhoUrl: `/uploads/${req.file.filename}`,
      tipoArquivo,
    });

    return res.status(201).json({
      success: true,
      message: 'Documento enviado com sucesso!',
      data: documento,
    });
  } catch (error) {
    return next(error);
  }
}

// GET /api/documentos/:id/download
async function download(req, res, next) {
  try {
    const documento = await Documento.findByPk(req.params.id);
    if (!documento) {
      return res.status(404).json({
        success: false,
        message: 'Documento não encontrado.',
      });
    }

    const filePath = path.join(__dirname, '..', '..', documento.caminhoUrl);
    if (!fs.existsSync(filePath)) {
      return res.status(404).json({
        success: false,
        message: 'Arquivo não encontrado no servidor.',
      });
    }

    return res.download(filePath, documento.nomeArquivo);
  } catch (error) {
    return next(error);
  }
}

// DELETE /api/documentos/:id (soft delete)
async function remover(req, res, next) {
  try {
    const documento = await Documento.findByPk(req.params.id);
    if (!documento) {
      return res.status(404).json({
        success: false,
        message: 'Documento não encontrado.',
      });
    }

    await documento.update({ deletadoEm: new Date() });

    return res.json({
      success: true,
      message: 'Documento removido com sucesso!',
    });
  } catch (error) {
    return next(error);
  }
}

module.exports = { listar, upload, uploadDocumento, download, remover };
