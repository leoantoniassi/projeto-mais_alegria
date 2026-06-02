const { Documento, Cliente, Evento } = require('../models');
const documentoService = require('../services/documentoService');
const { arquivoExiste, sanitizarCaminhoLocal } = require('../utils/fileUtils');
const { success, fail } = require('../utils/response');

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

    return success(res, documentos);
  } catch (error) {
    return next(error);
  }
}

async function criar(req, res, next) {
  try {
    const erro = documentoService.validarCriacao(req.body);
    if (erro) return fail(res, erro, 400);

    const payload = documentoService.montarPayloadCriacao(req.body);
    const documento = await Documento.create(payload);

    return success(res, documento, 'Documento cadastrado com sucesso!', 201);
  } catch (error) {
    return next(error);
  }
}

async function atualizar(req, res, next) {
  try {
    const documento = await documentoService.findDocumentoOrFail(req.params.id);
    const payload = documentoService.montarPayloadAtualizacao(req.body);
    await documento.update(payload);

    return success(res, documento, 'Documento atualizado com sucesso!');
  } catch (error) {
    return next(error);
  }
}

async function remover(req, res, next) {
  try {
    const documento = await documentoService.findDocumentoOrFail(req.params.id);
    await documento.update({ deletadoEm: new Date() });

    return success(res, null, 'Documento removido com sucesso!');
  } catch (error) {
    return next(error);
  }
}

async function abrirArquivo(req, res, next) {
  try {
    const documento = await documentoService.findDocumentoOrFail(req.params.id);
    const { caminho, isExterno } = documentoService.infoArquivo(documento);

    if (isExterno) {
      return fail(res, 'Este documento não possui um arquivo local.', 400);
    }

    const caminhoSeguro = await sanitizarCaminhoLocal(caminho);
    if (!caminhoSeguro) {
      return fail(res, 'Caminho de arquivo inválido ou extensão não permitida.', 400);
    }

    if (!(await arquivoExiste(caminhoSeguro))) {
      return fail(res, 'Arquivo não encontrado no diretório de documentos.', 404);
    }

    return res.sendFile(caminhoSeguro);
  } catch (error) {
    return next(error);
  }
}

module.exports = { listar, criar, atualizar, remover, abrirArquivo };
