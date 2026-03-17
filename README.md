# DOCUMENTAÇÃO DO PROJETO MAIS ALEGRIA

## 1. Introdução

O _Projeto Mais Alegria_ tem como objetivo desenvolver um sistema completo para a gestão de eventos e controle administrativo da equipe. A ausência de um fluxo centralizado para gerenciar contratos, informações de clientes e a escala de funcionários pode gerar desorganização e impactar a qualidade dos serviços prestados em eventos.

A solução proposta utiliza uma arquitetura web moderna para centralizar os dados, facilitando a comunicação com os clientes (incluindo integração ágil via WhatsApp), o armazenamento seguro de documentos e a categorização eficiente dos colaboradores envolvidos em cada evento.

---

### • Objetivos

#### Objetivo Geral

Desenvolver um sistema web funcional para gerenciar clientes, funcionários, documentos e informações de eventos, otimizando a organização e a comunicação da empresa.

#### Objetivos Específicos

- Cadastrar e gerenciar o fluxo de clientes, permitindo contato direto via WhatsApp.
- Categorizar e registrar funcionários com base em suas funções operacionais (ex: recreadores, cozinheiros, garçons).
- Fornecer um ambiente seguro para o armazenamento e gerenciamento de documentos e contratos.
- Centralizar todos os detalhes e requisitos específicos de cada evento realizado.

---

### • Metodologia

Para o desenvolvimento deste projeto, serão utilizadas as seguintes tecnologias e ferramentas:

- _Frontend:_ React
- _Backend:_ Node.js
- _Banco de Dados:_ Banco de Dados Relacional (ex: PostgreSQL ou MySQL)
- _Testes de API:_ Postman
- _Controle de Versão:_ Git e GitHub
- _Planejamento:_ Trello
- _Metodologia de Desenvolvimento:_ Scrum — abordagem ágil que permite adaptações rápidas a mudanças e promove entregas incrementais por meio de sprints.

---

## 2. Requisitos

### • Requisitos Funcionais

- _RF1:_ O sistema deve permitir o CRUD (Criação, Leitura, Atualização e Exclusão) de Clientes, registrando Nome, E-mail, RG/CPF e Número de telefone.
- _RF2:_ O sistema deve possuir uma função/botão de atalho para enviar mensagens diretamente para o WhatsApp do cliente cadastrado.
- _RF3:_ O sistema deve permitir o CRUD de Funcionários, com campos para categorização por funções (ex: recreadores, cozinheiros, garçons, etc.).
- _RF4:_ O sistema deve possuir um módulo de upload e gerenciamento de documentos para adicionar e consultar arquivos, como contratos assinados pelos clientes.
- _RF5:_ O sistema deve permitir o CRUD de Eventos, registrando data, local, funcionários alocados e informações gerais.

### • Requisitos Não Funcionais

- _RNF1: Usabilidade_ — A interface (desenvolvida em React) deve ser intuitiva, responsiva e de fácil navegação para a equipe administrativa.
- _RNF2: Desempenho_ — As requisições (gerenciadas pelo Node.js) devem possuir tempo de resposta ágil, garantindo fluidez no uso diário.
- _RNF3: Integridade_ — O banco de dados relacional deve garantir a consistência das informações, relacionando corretamente clientes aos seus contratos e eventos.
- _RNF4: Segurança_ — Os dados sensíveis dos clientes (como RG/CPF e contratos) devem ser armazenados com proteção contra acessos não autorizados.

---

## 3. Modelo de Casos de Uso

![Diagrama de Casos de Uso](/img/casosUso.png)

### Casos de Uso de Alto Nível

- **Gerenciar Clientes:** Permite cadastrar, visualizar, editar e remover clientes do sistema.
- **Contatar via WhatsApp:** Ação rápida para abrir o chat do WhatsApp utilizando o número registrado no cadastro do cliente.
- **Gerenciar Funcionários:** Registra novos colaboradores e os categoriza por suas respectivas funções (recreador, cozinheiro, garçom, etc.).
- **Gerenciar Documentos:** Permite o upload, visualização e exclusão de arquivos, vinculando contratos aos clientes ou eventos específicos.
- **Gerenciar Orçamentos:** Permite criar, editar, enviar e acompanhar o status de orçamentos (ex: pendente, aprovado, reprovado) para potenciais eventos.
- **Gerenciar Eventos:** Cria novos eventos (geralmente a partir de orçamentos aprovados), definindo data, local e associando o cliente responsável e a equipe de funcionários alocada.

---

## 4. Modelo do Banco de Dados Relacional

O banco de dados do projeto será estruturado utilizando um **Banco de Dados Relacional** (como PostgreSQL ou MySQL), garantindo a integridade referencial dos dados e permitindo o cruzamento de informações entre clientes, eventos e funcionários de forma robusta.

> **Clientes:** Armazena os dados pessoais e de contato (Nome, E-mail, RG/CPF, Telefone).

> **Funcionários:** Armazena os dados da equipe e a função exercida (Recreador, Garçom, etc.).

> **Eventos:** Registra os detalhes das festas/eventos, possuindo uma chave estrangeira (Foreign Key) que o vincula a um Cliente.

> **Documentos:** Armazena o caminho/URL do arquivo (ex: PDF de contrato), referenciando a qual Cliente ou Evento ele pertence.

> **Escala (Evento_Funcionario):** Tabela intermediária (N:M) para registrar quais funcionários estão alocados em quais eventos.

![Diagrama do Banco de Dados Relacional](img/BancoRelacional.png)

---

## 5. Diagrama de Relacionamentos (Entidade-Relacionamento)

O modelo físico segue a estrutura relacional padrão, utilizando tabelas interligadas por chaves primárias (PK) e estrangeiras (FK).

### Relacionamento entre Tabelas

- **Clientes ↔ Eventos:** 1:N (Um cliente pode contratar vários eventos, mas um evento específico pertence a um único cliente).

- **Eventos ↔ Funcionários:** N:M (Um evento possui vários funcionários, e um funcionário pode trabalhar em vários eventos). Relacionamento resolvido através da tabela `Escala`.

- **Clientes ↔ Documentos:** 1:N (Um cliente pode ter vários documentos/contratos anexados ao seu perfil).

---

## 6. Regras de Negócio (Principais)

### RN1: Cadastro Único

- Não será permitido o cadastro de dois clientes com o mesmo RG/CPF ou e-mail.

- Não será permitido o cadastro de dois funcionários com o mesmo e-mail.

### RN2: Alocação em Eventos

- Um funcionário não pode ser alocado em dois eventos que ocorram exatamente na mesma data e horário conflitante.

### RN3: Gestão de Documentos

- Apenas usuários com permissão administrativa podem excluir contratos já assinados e anexados ao sistema.
- O sistema deve aceitar formatos padronizados para documentos (ex: `.pdf`, `.jpg`, `.png`).

---

## 7. Estudo de Viabilidade

### Viabilidade de Mercado

O setor de eventos (festas infantis, casamentos, confraternizações) exige alto nível de organização. A criação de um sistema próprio para o **Projeto Mais Alegria** reduzirá falhas de comunicação, perda de contratos e conflitos de agenda, tornando a empresa mais ágil, profissional e competitiva no mercado.

### Viabilidade de Recursos

- **Humanos:** Desenvolvedores (Frontend React e Backend Node.js), Product Owner/Scrum Master para gerenciar as entregas e equipe de testes.
- **Tecnológicos:** React, Node.js, Banco de Dados Relacional (ex: PostgreSQL ou MySQL), Postman para testes de API e Trello para gestão ágil.
- **Financeiros:** Custos focados em hospedagem em nuvem e horas de desenvolvimento, utilizando frameworks de código aberto que reduzem despesas com licenciamento.

### Viabilidade Operacional

O fluxo operacional se tornará muito mais intuitivo:

1. O cliente entra em contato e é cadastrado (com opção de acionamento rápido via WhatsApp).
2. Um orçamento é gerado no sistema.
3. Após a aprovação do orçamento, o evento é oficialmente criado e agendado.
4. O contrato em PDF é anexado ao perfil do cliente.
5. Funcionários são alocados no evento de acordo com a função necessária (recreadores, garçons, etc.).

### Conclusão

O projeto é altamente viável, pois resolve dores reais de gestão de eventos utilizando tecnologias de mercado consolidadas, seguras e escaláveis.

---

## 8. Regras de Negócio (Modelo Canvas)

### RN1: Acesso e Autenticação

- O sistema deve possuir níveis de acesso. Apenas usuários com perfil de "Administrador" ou "Gerente" podem aprovar orçamentos, excluir clientes ou apagar documentos.

### RN2: Fluxo de Orçamentos e Eventos

- Um "Evento" só pode ter seu status alterado para "Confirmado" se houver um "Orçamento" previamente aprovado pelo cliente associado.

### RN3: Alocação de Funcionários

- O sistema deve impedir a alocação de um mesmo funcionário em dois eventos distintos que ocorram no mesmo dia e horário.
- A busca por funcionários na hora de montar a equipe do evento deve permitir filtros por função (ex: buscar apenas "Cozinheiros").

### RN4: Gestão de Contratos (Documentos)

- Todo evento deve estar atrelado a um contrato digitalizado. O sistema deve aceitar extensões seguras e comuns, como `.pdf`, `.png` e `.jpg`.

---

## 9. Design

O design do **Projeto Mais Alegria** deve transmitir profissionalismo sem perder a essência acolhedora e dinâmica do setor de eventos.

- **Paleta de Cores:** Tons vibrantes e alegres (como variações de laranja ou azul claro) para botões de ação e destaques, combinados com fundos claros/neutros para facilitar a leitura no uso diário.
- **Tipografia:** Fontes modernas, sem serifa e de alta legibilidade (ex: Roboto, Inter ou Poppins) para organizar bem as tabelas de clientes e escalas.
- **Layout:** Totalmente responsivo (graças aos componentes do React), garantindo que a equipe administrativa possa consultar dados tanto no computador do escritório quanto no smartphone durante a montagem de uma festa.

---

## 10. Protótipo


---

## 11. Aplicação

A aplicação será construída com uma arquitetura dividida: o Frontend dinâmico em **React** e o Backend robusto em **Node.js**. A comunicação entre eles ocorrerá via API RESTful. Para garantir a confiabilidade dos dados, todas as rotas (CRUD de clientes, eventos, etc.) serão testadas exaustivamente utilizando o **Postman** antes de serem integradas à interface. O fluxo de trabalho seguirá a metodologia **Scrum**, com as tarefas (sprints) organizadas e monitoradas através de um quadro no **Trello**.

---

## 12. Considerações Finais

O sistema do **Projeto Mais Alegria** centralizará as operações da empresa, substituindo planilhas soltas e pastas físicas por uma solução digital integrada. Com um banco de dados relacional bem estruturado e funcionalidades focadas na agilidade (como o atalho do WhatsApp e a gestão rápida de orçamentos), a equipe economizará tempo administrativo, podendo focar no que realmente importa: entregar eventos inesquecíveis aos seus clientes.

---

## 13. Referências Bibliográficas

- Documentação Oficial do React: https://pt-br.reactjs.org/
- Documentação Oficial do Node.js: https://nodejs.org/pt-br/docs/
- Guia Oficial do Scrum: https://scrumguides.org/
- Documentação do Postman: https://learning.postman.com/docs/introduction/overview/
