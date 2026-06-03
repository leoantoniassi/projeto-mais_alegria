const request = require('supertest');
const express = require('express');
const { Evento, Cliente, Local, Orcamento } = require('../models');

jest.mock('../middleware/auth', () => (req, res, next) => next());
jest.mock('../middleware/roles', () => () => (req, res, next) => next());

jest.mock('../models', () => ({
  Evento: { create: jest.fn(), findByPk: jest.fn(), findAndCountAll: jest.fn(), update: jest.fn() },
  Cliente: { findByPk: jest.fn() },
  Local: { findByPk: jest.fn() },
  Orcamento: { findByPk: jest.fn() },
}));

describe('EventoController — verificação de capacidade', () => {
  let app;

  beforeEach(() => {
    jest.clearAllMocks();
    app = express();
    app.use(express.json());
    app.use('/api/eventos', require('../routes/eventos.routes'));
    app.use((err, _req, res, _next) => {
      res.status(500).json({ success: false, message: err.message });
    });
  });

  const mockCliente = { id: 'cli-1', nome: 'Cliente Teste' };
  const mockLocalComCapacidade = { id: 'loc-1', nome: 'Salão Festas', capacidadeMaxima: 100 };
  const mockLocalSemCapacidade = { id: 'loc-2', nome: 'Salão Sem Cap', capacidadeMaxima: null };
  const mockEvento = {
    id: 'evt-1',
    clienteId: 'cli-1',
    localId: 'loc-1',
    nome: 'Evento Teste',
    dataEvento: '2026-12-31',
    qtdPessoas: 80,
    qtdAdultos: 60,
    qtdCriancas: 15,
    qtdBebes: 5,
    status: 'pendente',
  };

  const eventoPayload = {
    clienteId: 'cli-1',
    nome: 'Evento Teste',
    dataEvento: '2026-12-31',
    horarioTermino: '2026-12-31T23:59:59.000Z',
  };

  describe('POST /api/eventos', () => {
    test('deve criar evento com qtdPessoas dentro da capacidade (sem warning)', async () => {
      Cliente.findByPk.mockResolvedValue(mockCliente);
      Local.findByPk.mockResolvedValue(mockLocalComCapacidade);
      Evento.create.mockResolvedValue({ ...mockEvento, qtdPessoas: 40 });

      const res = await request(app)
        .post('/api/eventos')
        .send({ ...eventoPayload, localId: 'loc-1', qtdPessoas: 40 });

      expect(res.status).toBe(201);
      expect(res.body.warning).toBeNull();
    });

    test('deve criar evento com qtdPessoas EXCEDENDO capacidade (retornar warning)', async () => {
      Cliente.findByPk.mockResolvedValue(mockCliente);
      Local.findByPk.mockResolvedValue(mockLocalComCapacidade);
      Evento.create.mockResolvedValue({ ...mockEvento, qtdPessoas: 150 });

      const res = await request(app)
        .post('/api/eventos')
        .send({ ...eventoPayload, localId: 'loc-1', qtdPessoas: 150, qtdAdultos: 100, qtdCriancas: 40, qtdBebes: 10 });

      expect(res.status).toBe(201);
      expect(res.body.warning).toBeTruthy();
      expect(res.body.warning).toContain('excede a capacidade máxima');
      expect(res.body.warning).toContain('Salão Festas');
      expect(res.body.warning).toContain('150');
    });

    test('deve criar evento sem localId (sem warning de capacidade)', async () => {
      Cliente.findByPk.mockResolvedValue(mockCliente);
      Evento.create.mockResolvedValue(mockEvento);

      const res = await request(app)
        .post('/api/eventos')
        .send({ ...eventoPayload, qtdPessoas: 80 });

      expect(res.status).toBe(201);
      expect(res.body.warning).toBeUndefined();
    });

    test('deve criar evento com local sem capacidade definida (sem warning)', async () => {
      Cliente.findByPk.mockResolvedValue(mockCliente);
      Local.findByPk.mockResolvedValue(mockLocalSemCapacidade);
      Evento.create.mockResolvedValue({ ...mockEvento, localId: 'loc-2', qtdPessoas: 150 });

      const res = await request(app)
        .post('/api/eventos')
        .send({ ...eventoPayload, localId: 'loc-2', qtdPessoas: 150, qtdAdultos: 100, qtdCriancas: 40, qtdBebes: 10 });

      expect(res.status).toBe(201);
      expect(res.body.warning).toBeNull();
    });

    test('deve criar evento com horarioTermino válido', async () => {
      Cliente.findByPk.mockResolvedValue(mockCliente);
      Evento.create.mockResolvedValue({ ...mockEvento, horarioTermino: '2026-12-31T23:59:59.000Z' });

      const res = await request(app)
        .post('/api/eventos')
        .send({ ...eventoPayload, horarioTermino: '2026-12-31T23:59:59.000Z', qtdPessoas: 50 });

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
    });

    test('deve retornar 400 se horarioTermino não for informado', async () => {
      const res = await request(app)
        .post('/api/eventos')
        .send({ clienteId: 'cli-1', nome: 'Evento Teste', dataEvento: '2026-12-31', qtdPessoas: 50 });

      expect(res.status).toBe(400);
      expect(res.body.message).toContain('horário de término');
    });

    test('deve retornar 400 se horarioTermino for anterior a dataEvento', async () => {
      const res = await request(app)
        .post('/api/eventos')
        .send({ ...eventoPayload, horarioTermino: '2026-12-30T10:00:00.000Z', qtdPessoas: 50 });

      expect(res.status).toBe(400);
      expect(res.body.message).toContain('deve ser maior');
    });

    test('deve retornar 400 se horarioTermino for inválido (string não-datável)', async () => {
      const res = await request(app)
        .post('/api/eventos')
        .send({ ...eventoPayload, horarioTermino: 'invalido', qtdPessoas: 50 });

      expect(res.status).toBe(400);
      expect(res.body.message).toContain('data válida');
    });
  });

  describe('PUT /api/eventos/:id', () => {
    test('deve atualizar evento excedendo capacidade (retornar warning)', async () => {
      Evento.findByPk.mockResolvedValue({ ...mockEvento, update: jest.fn().mockResolvedValue(true) });
      Local.findByPk.mockResolvedValue(mockLocalComCapacidade);

      const res = await request(app)
        .put('/api/eventos/evt-1')
        .send({ localId: 'loc-1', qtdPessoas: 150, qtdAdultos: 100, qtdCriancas: 40, qtdBebes: 10 });

      expect(res.status).toBe(200);
      expect(res.body.warning).toBeTruthy();
      expect(res.body.warning).toContain('excede a capacidade máxima');
    });

    test('deve atualizar evento com qtdPessoas = 0 (sem warning)', async () => {
      Evento.findByPk.mockResolvedValue({ ...mockEvento, update: jest.fn().mockResolvedValue(true) });
      Local.findByPk.mockResolvedValue(mockLocalComCapacidade);

      const res = await request(app)
        .put('/api/eventos/evt-1')
        .send({ localId: 'loc-1', qtdPessoas: 0 });

      expect(res.status).toBe(200);
      expect(res.body.warning).toBeNull();
    });

    test('deve atualizar evento sem localId (sem warning)', async () => {
      const updateMock = jest.fn().mockResolvedValue(true);
      Evento.findByPk.mockResolvedValue({ ...mockEvento, update: updateMock });

      const res = await request(app)
        .put('/api/eventos/evt-1')
        .send({ nome: 'Evento Atualizado' });

      expect(res.status).toBe(200);
      expect(res.body.warning).toBeUndefined();
    });

    test('deve atualizar evento com horarioTermino válido', async () => {
      Evento.findByPk.mockResolvedValue({ ...mockEvento, update: jest.fn().mockResolvedValue(true) });

      const res = await request(app)
        .put('/api/eventos/evt-1')
        .send({ horarioTermino: '2026-12-31T23:59:59.000Z' });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
    });

    test('deve retornar 400 se horarioTermino for inválido no PUT', async () => {
      Evento.findByPk.mockResolvedValue({ ...mockEvento, update: jest.fn().mockResolvedValue(true) });

      const res = await request(app)
        .put('/api/eventos/evt-1')
        .send({ horarioTermino: 'invalido' });

      expect(res.status).toBe(400);
      expect(res.body.message).toContain('data válida');
    });
  });
});
