import React from 'react';
import '@testing-library/jest-dom';
import { render, screen } from '@testing-library/react';
import OrcamentosPage from './OrcamentosPage';
import { useAuth } from '../../contexts/AuthContext';
import { useConfirm } from '../../contexts/ConfirmContext';
import api from '../../services/api';

// ---------------------------------------------------------------------------
// Mocks
// ---------------------------------------------------------------------------
jest.mock('../../contexts/AuthContext');
jest.mock('../../contexts/ConfirmContext');
jest.mock('../../services/api');

// ---------------------------------------------------------------------------
// Fixtures
// ---------------------------------------------------------------------------
const mockLocais = [
  { id: 1, nome: 'Salão Principal' },
  { id: 2, nome: 'Salão VIP' },
];

const mockPendente = {
  id: 1,
  cliente: { nome: 'Cliente Pendente' },
  local: { nome: 'Salão' },
  dataValidade: '2026-06-15',
  valorTotal: 5000,
  status: 'pendente',
  clienteId: 1,
  localId: 1,
  observacoes: '',
};

const mockAprovado = {
  id: 2,
  cliente: { nome: 'Cliente Aprovado' },
  local: { nome: 'Salão VIP' },
  dataValidade: '2026-07-01',
  valorTotal: 8000,
  status: 'aprovado',
  clienteId: 2,
  localId: 2,
  observacoes: '',
};

const mockReprovado = {
  id: 3,
  cliente: { nome: 'Cliente Reprovado' },
  local: { nome: 'Salão' },
  dataValidade: '2026-05-01',
  valorTotal: 3000,
  status: 'reprovado',
  clienteId: 3,
  localId: 1,
  observacoes: '',
};

// ---------------------------------------------------------------------------
// Helper: configura o mock da api.get com a lista de orçamentos desejada
// ---------------------------------------------------------------------------
function setupApiMock(orcamentos = [mockPendente]) {
  api.get.mockImplementation((url) => {
    if (url === '/locais?limit=100') {
      return Promise.resolve({ data: { data: mockLocais } });
    }
    if (url === '/orcamentos') {
      return Promise.resolve({
        data: { data: orcamentos, pagination: { total: orcamentos.length } },
      });
    }
    return Promise.resolve({ data: {} });
  });
}

// ---------------------------------------------------------------------------
// Suíte de testes
// ---------------------------------------------------------------------------
describe('OrcamentosPage — controle de acesso por papel (role)', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    useConfirm.mockReturnValue(jest.fn().mockResolvedValue(true));
    setupApiMock([mockPendente]);
  });

  // ---------------------------------------------------------------
  // Teste 1 — Renderização básica
  // ---------------------------------------------------------------
  test('1 - renderiza o título e os dados do orçamento para gerente', async () => {
    useAuth.mockReturnValue({
      user: { id: 1, nome: 'Gerente', email: 'g@test.com', role: 'gerente' },
    });

    render(<OrcamentosPage />);

    expect(await screen.findByText('Orçamentos')).toBeInTheDocument();
    expect(await screen.findByText('Cliente Pendente')).toBeInTheDocument();
  });

  // ---------------------------------------------------------------
  // Teste 2 — Operador VÊ botões aprovar / reprovar (role alterada)
  // ---------------------------------------------------------------
  test('2 - operador VE botoes aprovar/reprovar em orcamento pendente (role alterada)', async () => {
    useAuth.mockReturnValue({
      user: { id: 2, nome: 'Operador', email: 'o@test.com', role: 'operador' },
    });

    render(<OrcamentosPage />);

    expect(await screen.findByTitle('Aprovar e Confirmar')).toBeInTheDocument();
    expect(screen.getByTitle('Rejeitar')).toBeInTheDocument();
  });

  // ---------------------------------------------------------------
  // Teste 3 — Gerente VÊ botões aprovar / reprovar
  // ---------------------------------------------------------------
  test('3 - gerente VE botoes aprovar/reprovar em orcamento pendente', async () => {
    useAuth.mockReturnValue({
      user: { id: 1, nome: 'Gerente', email: 'g@test.com', role: 'gerente' },
    });

    render(<OrcamentosPage />);

    expect(await screen.findByTitle('Aprovar e Confirmar')).toBeInTheDocument();
    expect(screen.getByTitle('Rejeitar')).toBeInTheDocument();
  });

  // ---------------------------------------------------------------
  // Teste 4 — Operador VÊ botão Editar mas NÃO vê Excluir
  // ---------------------------------------------------------------
  test('4 - operador VE Editar mas NAO ve Excluir', async () => {
    useAuth.mockReturnValue({
      user: { id: 2, nome: 'Operador', email: 'o@test.com', role: 'operador' },
    });

    render(<OrcamentosPage />);

    await screen.findByText('Cliente Pendente');

    expect(screen.getByTitle('Editar')).toBeInTheDocument();
    expect(screen.queryByTitle('Excluir')).not.toBeInTheDocument();
  });

  // ---------------------------------------------------------------
  // Teste 5 — Gerente VÊ botões editar / excluir
  // ---------------------------------------------------------------
  test('5 - gerente VE botoes editar/excluir', async () => {
    useAuth.mockReturnValue({
      user: { id: 1, nome: 'Gerente', email: 'g@test.com', role: 'gerente' },
    });

    render(<OrcamentosPage />);

    expect(await screen.findByTitle('Editar')).toBeInTheDocument();
    expect(screen.getByTitle('Excluir')).toBeInTheDocument();
  });

  // ---------------------------------------------------------------
  // Teste 6 — WhatsApp visível para todos os papéis
  // ---------------------------------------------------------------
  test('6 - WhatsApp visivel tanto para operador quanto para gerente', async () => {
    // -- operador --
    useAuth.mockReturnValue({
      user: { id: 2, nome: 'Operador', email: 'o@test.com', role: 'operador' },
    });

    const { unmount } = render(<OrcamentosPage />);
    expect(await screen.findByTitle('WhatsApp')).toBeInTheDocument();
    unmount();

    // -- gerente --
    useAuth.mockReturnValue({
      user: { id: 1, nome: 'Gerente', email: 'g@test.com', role: 'gerente' },
    });

    render(<OrcamentosPage />);
    expect(await screen.findByTitle('WhatsApp')).toBeInTheDocument();
  });

  // ---------------------------------------------------------------
  // Teste 7a — Operador vê botão Excluir em orçamento? NÃO.
  // ---------------------------------------------------------------
  test('7a - operador NAO ve botao Excluir em orcamento pendente', async () => {
    useAuth.mockReturnValue({
      user: { id: 2, nome: 'Operador', email: 'o@test.com', role: 'operador' },
    });

    render(<OrcamentosPage />);

    await screen.findByText('Cliente Pendente');

    expect(screen.queryByTitle('Excluir')).not.toBeInTheDocument();
  });

  // ---------------------------------------------------------------
  // Teste 7b — Gerente vê botão Excluir em orçamento
  // ---------------------------------------------------------------
  test('7b - gerente VE botao Excluir em orcamento pendente', async () => {
    useAuth.mockReturnValue({
      user: { id: 1, nome: 'Gerente', email: 'g@test.com', role: 'gerente' },
    });

    render(<OrcamentosPage />);

    await screen.findByText('Cliente Pendente');

    expect(screen.getByTitle('Excluir')).toBeInTheDocument();
  });

  // ---------------------------------------------------------------
  // Teste 7c — Operador vê botão Editar em orçamento
  // ---------------------------------------------------------------
  test('7c - operador VE botao Editar em orcamento pendente', async () => {
    useAuth.mockReturnValue({
      user: { id: 2, nome: 'Operador', email: 'o@test.com', role: 'operador' },
    });

    render(<OrcamentosPage />);

    await screen.findByText('Cliente Pendente');

    expect(screen.getByTitle('Editar')).toBeInTheDocument();
  });

  // ---------------------------------------------------------------
  // Teste 7d — Operador vê botões Aprovar/Rejeitar em orçamento pendente
  // ---------------------------------------------------------------
  test('7d - operador VE botoes Aprovar/Rejeitar em orcamento pendente', async () => {
    useAuth.mockReturnValue({
      user: { id: 2, nome: 'Operador', email: 'o@test.com', role: 'operador' },
    });

    render(<OrcamentosPage />);

    await screen.findByText('Cliente Pendente');

    expect(screen.getByTitle('Aprovar e Confirmar')).toBeInTheDocument();
    expect(screen.getByTitle('Rejeitar')).toBeInTheDocument();
  });

  // ---------------------------------------------------------------
  // Teste 8 — Orçamento não-pendente: gerente NÃO vê aprovar/reprovar
  // ---------------------------------------------------------------
  test.each([
    ['aprovado', mockAprovado],
    ['reprovado', mockReprovado],
  ])(
    '7 - orcamento %s: gerente NAO ve botoes aprovar/reprovar mas VE editar/excluir',
    async (_label, orcamento) => {
      useAuth.mockReturnValue({
        user: { id: 1, nome: 'Gerente', email: 'g@test.com', role: 'gerente' },
      });

      setupApiMock([orcamento]);

      render(<OrcamentosPage />);

      // Aguarda o nome do cliente aparecer (dado carregado)
      await screen.findByText(orcamento.cliente.nome);

      // Não deve ter botões de aprovar/reprovar
      expect(
        screen.queryByTitle('Aprovar e Confirmar'),
      ).not.toBeInTheDocument();
      expect(screen.queryByTitle('Rejeitar')).not.toBeInTheDocument();

      // Mas ainda deve ter editar e excluir
      expect(screen.getByTitle('Editar')).toBeInTheDocument();
      expect(screen.getByTitle('Excluir')).toBeInTheDocument();
    },
  );
});
