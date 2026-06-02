import React from 'react';
import '@testing-library/jest-dom';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import DocumentosPage from './DocumentosPage';
import { useAuth } from '../../contexts/AuthContext';
import { useConfirm } from '../../contexts/ConfirmContext';
import api from '../../services/api';

jest.mock('../../contexts/AuthContext');
jest.mock('../../contexts/ConfirmContext');
jest.mock('../../services/api');

const mockOpen = jest.fn();
const mockCreateObjectURL = jest.fn(() => 'blob:http://localhost/test-blob');
const mockRevokeObjectURL = jest.fn();

const docSemCaminho = {
  id: 1,
  nomeArquivo: 'Sem Caminho',
  caminhoUrl: '',
  tipoArquivo: 'pdf',
  cliente: { nome: 'Cliente A' },
  evento: null,
};

const docExterno = {
  id: 2,
  nomeArquivo: 'Link Externo',
  caminhoUrl: 'https://drive.google.com/file.pdf',
  tipoArquivo: 'pdf',
  cliente: null,
  evento: { nome: 'Evento B' },
};

const docLocal = {
  id: 3,
  nomeArquivo: 'Local.pdf',
  caminhoUrl: 'contratos/doc.pdf',
  tipoArquivo: 'pdf',
  cliente: { nome: 'Cliente C' },
  evento: null,
};

function setupApiMock(documentos = []) {
  api.get.mockImplementation((url, config) => {
    if (url === '/documentos') {
      return Promise.resolve({ data: { data: documentos } });
    }
    if (url === '/clientes') {
      return Promise.resolve({ data: { data: [] } });
    }
    if (url === '/eventos') {
      return Promise.resolve({ data: { data: [] } });
    }
    if (url?.startsWith('/documentos/') && url.endsWith('/arquivo')) {
      const blob = new Blob(['fake-content'], { type: 'application/pdf' });
      return Promise.resolve({ data: blob });
    }
    return Promise.reject(new Error('not found'));
  });
}

describe('DocumentosPage — handleAbrir', () => {
  beforeAll(() => {
    window.open = mockOpen;
    window.URL.createObjectURL = mockCreateObjectURL;
    window.URL.revokeObjectURL = mockRevokeObjectURL;
  });

  beforeEach(() => {
    jest.clearAllMocks();
    useAuth.mockReturnValue({ user: { id: 1, nome: 'Gerente', role: 'gerente' } });
    useConfirm.mockReturnValue(jest.fn().mockResolvedValue(true));
  });

  describe('quando doc não possui caminhoUrl', () => {
    test('não chama window.open nem api.get', async () => {
      setupApiMock([docSemCaminho]);
      render(<DocumentosPage />);

      const btn = await screen.findByTitle('Ver localização');
      await userEvent.click(btn);

      expect(mockOpen).not.toHaveBeenCalled();
      expect(api.get).toHaveBeenCalledTimes(3);
      expect(api.get).toHaveBeenCalledWith('/documentos');
      expect(api.get).toHaveBeenCalledWith('/clientes', expect.any(Object));
      expect(api.get).toHaveBeenCalledWith('/eventos', expect.any(Object));
    });
  });

  describe('quando doc possui URL http', () => {
    test('abre window.open com a URL e opções de segurança', async () => {
      setupApiMock([docExterno]);
      render(<DocumentosPage />);

      const btn = await screen.findByTitle('Abrir link');
      await userEvent.click(btn);

      expect(mockOpen).toHaveBeenCalledWith(
        'https://drive.google.com/file.pdf',
        '_blank',
        'noopener,noreferrer',
      );
    });
  });

  describe('quando doc possui caminho local', () => {
    test('faz requisição à API com responseType blob e cria blob URL', async () => {
      setupApiMock([docLocal]);
      render(<DocumentosPage />);

      const btn = await screen.findByTitle('Ver localização');
      await userEvent.click(btn);

      await waitFor(() => {
        expect(api.get).toHaveBeenCalledWith('/documentos/3/arquivo', {
          responseType: 'blob',
        });
      });

      expect(mockCreateObjectURL).toHaveBeenCalled();
    });
  });

  describe('quando API retorna erro no caminho local', () => {
    test('exibe alerta de erro', async () => {
      const alertSpy = jest.spyOn(window, 'alert').mockImplementation(() => {});
      api.get.mockImplementation((url, config) => {
        if (url === '/documentos') {
          return Promise.resolve({ data: { data: [docLocal] } });
        }
        if (url === '/clientes') {
          return Promise.resolve({ data: { data: [] } });
        }
        if (url === '/eventos') {
          return Promise.resolve({ data: { data: [] } });
        }
        if (url?.startsWith('/documentos/') && url.endsWith('/arquivo')) {
          return Promise.reject(new Error('Network error'));
        }
        return Promise.reject(new Error('not found'));
      });

      render(<DocumentosPage />);

      const btn = await screen.findByTitle('Ver localização');
      await userEvent.click(btn);

      await waitFor(() => {
        expect(alertSpy).toHaveBeenCalledWith(
          'Erro ao abrir o arquivo. Verifique se o caminho está acessível pelo servidor.',
        );
      });

      alertSpy.mockRestore();
    });
  });
});
