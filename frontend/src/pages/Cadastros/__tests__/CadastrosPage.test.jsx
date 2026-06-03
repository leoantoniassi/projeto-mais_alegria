import React from 'react';
import '@testing-library/jest-dom';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import CadastrosPage from '../CadastrosPage';
import { useAuth } from '../../../contexts/AuthContext';
import { useConfirm } from '../../../contexts/ConfirmContext';
import api from '../../../services/api';

jest.mock('../../../contexts/AuthContext');
jest.mock('../../../contexts/ConfirmContext');
jest.mock('../../../services/api');

const mockLocais = [
  {
    id: '1',
    nome: 'Salão Principal',
    logradouro: 'Rua A',
    numero: '100',
    bairro: 'Centro',
    cidade: 'São Paulo',
    estado: 'SP',
    cep: '00000-000',
    capacidadeMaxima: 150,
    observacoes: '',
  },
];

const mockFuncoes = [
  { id: '1', nome: 'Garçom', descricao: 'Serviço de mesa' },
];

function setupApiMock() {
  api.get.mockImplementation((url) => {
    if (url === '/locais?limit=1000') {
      return Promise.resolve({ data: { data: mockLocais } });
    }
    if (url === '/lookup/funcoes') {
      return Promise.resolve({ data: { data: mockFuncoes } });
    }
    if (url === '/lookup/categorias-fornecedor') {
      return Promise.resolve({ data: { data: [] } });
    }
    if (url === '/lookup/categorias-produto') {
      return Promise.resolve({ data: { data: [] } });
    }
    return Promise.resolve({ data: { data: [] } });
  });
}

describe('CadastrosPage — capacidadeMaxima', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    useAuth.mockReturnValue({ user: { id: 1, nome: 'Gerente', role: 'gerente' } });
    useConfirm.mockReturnValue(jest.fn().mockResolvedValue(true));
    setupApiMock();
  });

  test('deve exibir campo "Capacidade Máxima" no formulário da aba Locais', async () => {
    render(<CadastrosPage />);

    const locaisTab = await screen.findByRole('button', { name: /locais/i });
    await userEvent.click(locaisTab);

    const novoRegistroBtn = await screen.findByText('Novo Registro');
    await userEvent.click(novoRegistroBtn);

    expect(screen.getByText('Capacidade Máxima')).toBeInTheDocument();
  });

  test('NÃO deve exibir campo "Capacidade Máxima" no formulário da aba Funções', async () => {
    render(<CadastrosPage />);

    const funcoesTab = await screen.findByRole('button', { name: /funções/i });
    await userEvent.click(funcoesTab);

    const novoRegistroBtn = await screen.findByText('Novo Registro');
    await userEvent.click(novoRegistroBtn);

    expect(screen.queryByText('Capacidade Máxima')).not.toBeInTheDocument();
  });

  test('deve exibir coluna "Capacidade" na tabela de Locais', async () => {
    render(<CadastrosPage />);

    const locaisTab = await screen.findByRole('button', { name: /locais/i });
    await userEvent.click(locaisTab);

    expect(await screen.findByText('Capacidade')).toBeInTheDocument();
    expect(screen.getByText('150 pessoas')).toBeInTheDocument();
  });
});
