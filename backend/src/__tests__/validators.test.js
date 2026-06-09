const { isValidUUID, gerarWarningPessoas } = require('../utils/validators');

describe('Validators utils', () => {
  describe('gerarWarningPessoas', () => {
    it('deve retornar null se as quantidades de pessoas baterem', () => {
      const result = gerarWarningPessoas(10, 5, 3, 2, "no evento");
      expect(result).toBeNull();
    });

    it('deve retornar null se não houver detalhamento e as pessoas baterem', () => {
      const result = gerarWarningPessoas(0, 0, 0, 0, "no orçamento");
      expect(result).toBeNull();
    });

    it('deve retornar warning se a soma for diferente do total e detalhado for maior', () => {
      const result = gerarWarningPessoas(10, 5, 5, 2, "no evento");
      expect(result).toBe('As informações de pessoas no evento não coincidem: a soma de adultos, crianças e bebês (12) é diferente do total de pessoas (10).');
    });

    it('deve retornar warning se a soma for diferente do total e detalhado for menor', () => {
      const result = gerarWarningPessoas(10, 5, 0, 0, "no orçamento");
      expect(result).toBe('As informações de pessoas no orçamento não coincidem: a soma de adultos, crianças e bebês (5) é diferente do total de pessoas (10).');
    });
  });

  describe('isValidUUID', () => {
    it('deve retornar true para UUID válido', () => {
      expect(isValidUUID('123e4567-e89b-12d3-a456-426614174000')).toBe(true);
    });

    it('deve retornar false para UUID inválido', () => {
      expect(isValidUUID('123e4567-e89b-12d3-a456')).toBe(false);
    });
  });
});
