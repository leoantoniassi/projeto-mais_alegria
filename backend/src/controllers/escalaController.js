// ============================================================
// Controller: Escala (Alocação Funcionário ↔ Evento)
// ============================================================
const { Op } = require('sequelize');
const { Escala, Evento, Funcionario, Funcao } = require('../models');

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
        {
          model: Funcionario,
          as: 'funcionario',
          include: [{ model: Funcao, as: 'funcao', attributes: ['id', 'nome'] }],
        },
      ],
      order: [[{ model: Funcionario, as: 'funcionario' }, 'nome', 'ASC']],
    });

    return res.json({ success: true, data: escalas });
  } catch (error) {
    return next(error);
  }
}

// GET /api/escala/disponiveis/:eventoId
// Retorna funcionários que NÃO estão escalados em nenhum evento no mesmo dia
async function listarDisponiveis(req, res, next) {
  try {
    const evento = await Evento.findByPk(req.params.eventoId);
    if (!evento) {
      return res.status(404).json({ success: false, message: 'Evento não encontrado.' });
    }

    const dataEvento = new Date(evento.dataEvento);
    const inicioDia = new Date(dataEvento);
    inicioDia.setHours(0, 0, 0, 0);
    const fimDia = new Date(dataEvento);
    fimDia.setHours(23, 59, 59, 999);

    // IDs dos funcionários já escalados neste evento
    const jaEscalados = await Escala.findAll({
      where: { eventoId: req.params.eventoId },
      attributes: ['funcionarioId'],
    });
    const idsJaEscalados = jaEscalados.map(e => e.funcionarioId);

    // IDs dos funcionários ocupados em outro evento no mesmo dia
    const ocupados = await Escala.findAll({
      where: {
        eventoId: { [Op.ne]: req.params.eventoId },
      },
      include: [{
        model: Evento,
        as: 'evento',
        where: { dataEvento: { [Op.between]: [inicioDia, fimDia] } },
        attributes: [],
      }],
      attributes: ['funcionarioId'],
    });
    const idsOcupados = ocupados.map(e => e.funcionarioId);

    // Todos os IDs indisponíveis (já escalados neste evento OU ocupados em outro)
    const idsIndisponiveis = [...new Set([...idsJaEscalados, ...idsOcupados])];

    const where = idsIndisponiveis.length > 0
      ? { id: { [Op.notIn]: idsIndisponiveis } }
      : {};

    const disponiveis = await Funcionario.findAll({
      where,
      include: [{ model: Funcao, as: 'funcao', attributes: ['id', 'nome'] }],
      order: [['nome', 'ASC']],
    });

    return res.json({ success: true, data: disponiveis });
  } catch (error) {
    return next(error);
  }
}

// POST /api/escala/lote — aloca vários funcionários de uma vez
async function alocarLote(req, res, next) {
  try {
    const { eventoId, funcionarioIds } = req.body;

    if (!eventoId || !Array.isArray(funcionarioIds) || funcionarioIds.length === 0) {
      return res.status(400).json({ success: false, message: 'eventoId e funcionarioIds[] são obrigatórios.' });
    }

    const evento = await Evento.findByPk(eventoId);
    if (!evento) {
      return res.status(404).json({ success: false, message: 'Evento não encontrado.' });
    }

    const dataEvento = new Date(evento.dataEvento);
    const inicioDia = new Date(dataEvento); inicioDia.setHours(0, 0, 0, 0);
    const fimDia = new Date(dataEvento);   fimDia.setHours(23, 59, 59, 999);

    const erros = [];
    const criados = [];

    for (const funcionarioId of funcionarioIds) {
      const funcionario = await Funcionario.findByPk(funcionarioId);
      if (!funcionario) { erros.push(`Funcionário ${funcionarioId} não encontrado.`); continue; }

      const conflito = await Escala.findOne({
        where: { funcionarioId, eventoId: { [Op.ne]: eventoId } },
        include: [{ model: Evento, as: 'evento', where: { dataEvento: { [Op.between]: [inicioDia, fimDia] } } }],
      });
      if (conflito) { erros.push(`"${funcionario.nome}" já está escalado nesta data.`); continue; }

      const jaAlocado = await Escala.findOne({ where: { eventoId, funcionarioId } });
      if (jaAlocado) { erros.push(`"${funcionario.nome}" já está nesta escala.`); continue; }

      const esc = await Escala.create({ eventoId, funcionarioId });
      criados.push(esc);
    }

    return res.status(201).json({
      success: true,
      message: `${criados.length} funcionário(s) alocado(s) com sucesso.`,
      data: { criados: criados.length, erros },
    });
  } catch (error) {
    return next(error);
  }
}

module.exports = { alocar, alocarLote, remover, listarPorEvento, listarDisponiveis };
