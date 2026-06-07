# Plano de Implementação: Correção e Filtros no Cadastro de Documentos

## Descrição do Problema
1. O cadastro e a visualização de documentos não estão funcionando para o perfil `operador`, pois o backend restringe o acesso aos métodos GET, POST e PUT de `/api/documentos` para as roles `admin`, `gerente` e `usuario`. Porém, as únicas roles válidas configuradas no banco de dados do sistema são `gerente` e `operador`.
2. No modal de cadastro/edição de documentos, os campos **Cliente** e **Evento** não estão relacionados. Precisamos que:
   - Ao selecionar um cliente, apenas os eventos daquele cliente sejam exibidos no campo Evento (e desmarque o evento anterior se ele pertencer a outro cliente).
   - Ao selecionar um evento, o cliente correspondente seja automaticamente selecionado e a lista de clientes seja filtrada/restringida para esse cliente.

---

## Proposta de Alterações

### Backend (Correção de Permissões)

#### [MODIFY] [documentos.routes.js](file:///c:/Users/franc/OneDrive/Área%20de%20Trabalho/vero/Fatec/pi-mais-alegria/projeto-mais-alegria/projeto-mais_alegria/backend/src/routes/documentos.routes.js)
- Ajustar os middlewares `authorize` para incluir a role `operador` no lugar de `usuario` (que não existe no sistema).
- Permitir que `operador` liste (`GET /`), abra arquivos (`GET /:id/arquivo`), crie (`POST /`) e edite (`PUT /:id`) documentos, restringindo apenas a exclusão (`DELETE /:id`) para `gerente`.

---

### Frontend (Filtro Cruzado no Modal)

#### [MODIFY] [DocumentosPage.jsx](file:///c:/Users/franc/OneDrive/Área%20de%20Trabalho/vero/Fatec/pi-mais-alegria/projeto-mais-alegria/projeto-mais_alegria/frontend/src/pages/Documentos/DocumentosPage.jsx)
- Definir listas filtradas (`filteredClientes` e `filteredEventos`) no escopo do componente:
  - `filteredClientes`: se houver evento selecionado, mostra apenas o cliente desse evento. Caso contrário, todos.
  - `filteredEventos`: se houver cliente selecionado, mostra apenas eventos vinculados a ele. Caso contrário, todos.
- Implementar `handleClienteChange` e `handleEventoChange` para atualizar o estado de forma integrada e limpar incompatibilidades.
- Vincular os handlers e as opções filtradas aos elementos `<select>`.

---

### Testes Unitários e Integração

#### [MODIFY] [DocumentosPage.test.jsx](file:///c:/Users/franc/OneDrive/Área%20de%20Trabalho/vero/Fatec/pi-mais-alegria/projeto-mais-alegria/projeto-mais_alegria/frontend/src/pages/Documentos/DocumentosPage.test.jsx)
- Adicionar casos de teste para verificar o filtro cruzado entre Cliente e Evento no modal.

#### [NEW] [documentosController.test.js](file:///c:/Users/franc/OneDrive/Área%20de%20Trabalho/vero/Fatec/pi-mais-alegria/projeto-mais-alegria/projeto-mais_alegria/backend/src/__tests__/documentosController.test.js)
- Criar testes de integração no backend para garantir que as rotas de documentos funcionam para o `operador` e são devidamente restritas quando necessário.

---

## Fluxo de Orquestração (Conforme AGENTS.md)
O ciclo completo passará por 4 etapas simuladas sequencialmente:
1. **Desenvolvimento**: Alterar código de backend e frontend.
2. **Revisão de Código**: Refatorar aplicando Clean Code/SOLID.
3. **Auditoria de Segurança**: Garantir controle de acesso e sanitização de dados.
4. **Engenheiro de Testes**: Implementar testes automatizados e rodar o suite de testes.

---

## Plano de Verificação

### Testes Automatizados
- Executar `npm test` no backend para garantir que nenhum teste existente quebrou e que os novos testes passam.
- Executar testes do frontend na pasta correspondente.

### Verificação Manual
- Simular logins como `gerente` e `operador` e testar o fluxo completo de cadastro, edição e exclusão de documentos.
- Validar se o filtro de Cliente e Evento funciona como esperado no modal.
