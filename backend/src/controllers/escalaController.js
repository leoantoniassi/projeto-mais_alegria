// ============================================================
// Controller: Escala (Alocação Funcionário ↔ Evento)
// ============================================================
const { Op } = require('sequelize');
const { Escala, Evento, Funcionario } = require('../models');

// POST /api/escala
async function alocar(req, res, next) {
  try {
    const { eventoId, funcionarioId, observacoes } = req.body;

    if (!eventoId || !funcionarioId) {
      return res.status(400).json({
        success: false,
        message: 'ID do evento e ID do funcionário são obrigatórios.',
      });
    }

    // Verifica se evento existe
    const evento = await Evento.findByPk(eventoId);
    if (!evento) {
      return res.status(404).json({
        success: false,
        message: 'Evento não encontrado.',
      });
    }

    // Verifica se funcionário existe
    const funcionario = await Funcionario.findByPk(funcionarioId);
    if (!funcionario) {
      return res.status(404).json({
        success: false,
        message: 'Funcionário não encontrado.',
      });
    }

    // RN2: Verifica conflito de horário — funcionário já alocado em evento no mesmo dia
    const dataEvento = new Date(evento.dataEvento);
    const inicioDia = new Date(dataEvento);
    inicioDia.setHours(0, 0, 0, 0);
    const fimDia = new Date(dataEvento);
    fimDia.setHours(23, 59, 59, 999);

    const conflito = await Escala.findOne({
      where: {
        funcionarioId,
        eventoId: { [Op.ne]: eventoId },
      },
      include: [{
        model: Evento,
        as: 'evento',
        where: {
          dataEvento: {
            [Op.between]: [inicioDia, fimDia],
          },
        },
      }],
    });

    if (conflito) {
      return res.status(409).json({
        success: false,
        message: `O funcionário "${funcionario.nome}" já está alocado em outro evento nesta data (${dataEvento.toLocaleDateString('pt-BR')}).`,
      });
    }

    // Verifica se já está alocado neste evento
    const jaAlocado = await Escala.findOne({
      where: { eventoId, funcionarioId },
    });

    if (jaAlocado) {
      return res.status(409).json({
        success: false,
        message: 'Funcionário já está alocado neste evento.',
      });
    }

    const escala = await Escala.create({ eventoId, funcionarioId, observacoes });

    // Retorna com dados completos
    const escalaCriada = await Escala.findByPk(escala.id, {
      include: [
        { model: Evento, as: 'evento', attributes: ['id', 'nome', 'dataEvento'] },
        { model: Funcionario, as: 'funcionario', attributes: ['id', 'nome', 'funcao'] },
      ],
    });

    return res.status(201).json({
      success: true,
      message: 'Funcionário alocado no evento com sucesso!',
      data: escalaCriada,
    });
  } catch (error) {
    return next(error);
  }
}

// DELETE /api/escala/:id
async function remover(req, res, next) {
  try {
    const escala = await Escala.findByPk(req.params.id);
    if (!escala) {
      return res.status(404).json({
        success: false,
        message: 'Alocação não encontrada.',
      });
    }

    await escala.update({ deletadoEm: new Date() });

    return res.json({
      success: true,
      message: 'Alocação removida com sucesso!',
    });
  } catch (error) {
    return next(error);
  }
}

// GET /api/escala/evento/:eventoId
async function listarPorEvento(req, res, next) {
  try {
    const escalas = await Escala.findAll({
      where: { eventoId: req.params.eventoId },
      include: [
        { model: Funcionario, as: 'funcionario' },
      ],
      order: [[{ model: Funcionario, as: 'funcionario' }, 'nome', 'ASC']],
    });

    return res.json({ success: true, data: escalas });
  } catch (error) {
    return next(error);
  }
}

module.exports = { alocar, remover, listarPorEvento };
