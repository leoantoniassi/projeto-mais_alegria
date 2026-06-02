const path = require('path');
const { detectarTipo, isUrlExterna, sanitizarCaminhoLocal } = require('../utils/fileUtils');

describe('fileUtils', () => {
  describe('detectarTipo', () => {
    test('deve retornar jpg para extensões jpg e jpeg', () => {
      expect(detectarTipo('documento.jpg')).toBe('jpg');
      expect(detectarTipo('documento.jpeg')).toBe('jpg');
    });

    test('deve retornar png para extensão png', () => {
      expect(detectarTipo('imagem.png')).toBe('png');
    });

    test('deve retornar pdf para outras extensões ou caminhos sem extensão reconhecida', () => {
      expect(detectarTipo('documento.pdf')).toBe('pdf');
      expect(detectarTipo('documento.txt')).toBe('pdf');
      expect(detectarTipo('')).toBe('pdf');
    });
  });

  describe('isUrlExterna', () => {
    test('deve retornar true para urls http ou https', () => {
      expect(isUrlExterna('http://exemplo.com/docs/contrato.pdf')).toBe(true);
      expect(isUrlExterna('https://drive.google.com/doc')).toBe(true);
      expect(isUrlExterna('HTTP://EXEMPLO.COM')).toBe(true);
    });

    test('deve retornar false para caminhos locais', () => {
      expect(isUrlExterna('C:\\Users\\documento.pdf')).toBe(false);
      expect(isUrlExterna('/Users/documento.pdf')).toBe(false);
      expect(isUrlExterna('contrato.pdf')).toBe(false);
      expect(isUrlExterna('')).toBe(false);
      expect(isUrlExterna(null)).toBe(false);
    });
  });

  describe('sanitizarCaminhoLocal', () => {
    const originalPlatform = process.platform;

    afterEach(() => {
      Object.defineProperty(process, 'platform', {
        value: originalPlatform,
        configurable: true,
      });
    });

    test('deve retornar null para caminhos com parent directory traversal (..)', async () => {
      const res = await sanitizarCaminhoLocal('C:\\Users\\..\\documento.pdf');
      expect(res).toBeNull();
    });

    test('deve retornar null para extensões não permitidas', async () => {
      const res = await sanitizarCaminhoLocal('documento.exe');
      expect(res).toBeNull();
    });

    test('deve traduzir caminhos absolutos do Windows para Unix quando rodando no Linux', async () => {
      Object.defineProperty(process, 'platform', {
        value: 'linux',
        configurable: true,
      });

      const winPath = 'C:\\Users\\franc\\OneDrive\\documento.pdf';
      const res = await sanitizarCaminhoLocal(winPath);

      // Como o caminho traduzido '/Users/franc/OneDrive/documento.pdf' é absoluto,
      // a função testa o fs.access. Se não existir, ela continuaria tentando buscar nos diretórios
      // base, mas no final resolveria a partir do cwd ou retornaria o caminho traduzido.
      // Como simulamos Linux e o arquivo não existe, ela retorna o path resolved do processo com o caminho.
      // Vamos verificar se o caminho resultante contém a tradução '/Users/franc/OneDrive/documento.pdf'.
      expect(res).toContain('/Users/franc/OneDrive/documento.pdf');
    });
  });
});
