import React from 'react';
import '@testing-library/jest-dom';
import { render, screen, waitFor } from '@testing-library/react';
import EstoquePage from '../EstoquePage';
import { useAuth } from '../../../contexts/AuthContext';
import { useConfirm } from '../../../contexts/ConfirmContext';
import api from '../../../services/api';

jest.mock('../../../contexts/AuthContext');
jest.mock('../../../contexts/ConfirmContext');
jest.mock('../../../services/api');

const mockProdutos = [
  {
    id: 1,
    nome: 'Item com Estoque Suficiente',
    categoria: { id: 1, nome: 'Alimento' },
    quantidade: '10.00',
    estoqueMinimo: '3.00',
    unidadeMedida: 'un',
    custoUnitario: '1.00',
  },
  {
    id: 2,
    nome: 'Item com Estoque Baixo',
    categoria: { id: 1, nome: 'Alimento' },
    quantidade: '2.00',
    estoqueMinimo: '3.00',
    unidadeMedida: 'un',
    custoUnitario: '1.00',
  },
];

describe('EstoquePage — Alerta de Estoque Baixo', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    useAuth.mockReturnValue({ user: { id: 1, nome: 'Gerente', role: 'gerente' } });
    useConfirm.mockReturnValue(jest.fn().mockResolvedValue(true));
    
    api.get.mockImplementation((url) => {
      if (url === '/lookup/categorias-produto') {
        return Promise.resolve({ data: { data: [] } });
      }
      if (url === '/produtos') {
        return Promise.resolve({ data: { data: mockProdutos, pagination: { total: 2 } } });
      }
      return Promise.reject(new Error('not found'));
    });
  });

  test('deve contar e exibir corretamente apenas itens com estoque realmente baixo', async () => {
    render(<EstoquePage />);

    // Deve buscar produtos da API
    await waitFor(() => {
      expect(api.get).toHaveBeenCalledWith('/produtos', expect.any(Object));
    });

    // O contador de "Estoque Baixo" deve mostrar apenas 1 item
    const counterElement = await screen.findByText('1');
    expect(counterElement).toBeInTheDocument();

    // O item com estoque suficiente não deve ter o ícone ou classe de alerta de perigo (animate-pulse/text-error)
    const sufItem = screen.getByText('Item com Estoque Suficiente');
    expect(sufItem).toBeInTheDocument();

    const sufQty = screen.getByText('10.00');
    expect(sufQty).not.toHaveClass('text-error');

    // O item com estoque baixo deve possuir classe text-error e ícone de alerta
    const lowQty = screen.getByText('2.00');
    expect(lowQty).toHaveClass('text-error');
  });
});
