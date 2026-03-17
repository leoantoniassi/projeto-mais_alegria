# DOCUMENTAÇÃO DO PROJETO MAIS ALEGRIA

## 1. Introdução

O *Projeto Mais Alegria* tem como objetivo desenvolver um sistema completo para a gestão de eventos e controle administrativo da equipe. A ausência de um fluxo centralizado para gerenciar contratos, informações de clientes e a escala de funcionários pode gerar desorganização e impactar a qualidade dos serviços prestados em eventos.

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

- *Frontend:* React
- *Backend:* Node.js
- *Banco de Dados:* Banco de Dados Relacional (ex: PostgreSQL ou MySQL)
- *Testes de API:* Postman
- *Controle de Versão:* Git e GitHub
- *Planejamento:* Trello
- *Metodologia de Desenvolvimento:* Scrum — abordagem ágil que permite adaptações rápidas a mudanças e promove entregas incrementais por meio de sprints.

---

## 2. Requisitos

### • Requisitos Funcionais
- *RF1:* O sistema deve permitir o CRUD (Criação, Leitura, Atualização e Exclusão) de Clientes, registrando Nome, E-mail, RG/CPF e Número de telefone.
- *RF2:* O sistema deve possuir uma função/botão de atalho para enviar mensagens diretamente para o WhatsApp do cliente cadastrado.
- *RF3:* O sistema deve permitir o CRUD de Funcionários, com campos para categorização por funções (ex: recreadores, cozinheiros, garçons, etc.).
- *RF4:* O sistema deve possuir um módulo de upload e gerenciamento de documentos para adicionar e consultar arquivos, como contratos assinados pelos clientes.
- *RF5:* O sistema deve permitir o CRUD de Eventos, registrando data, local, funcionários alocados e informações gerais.

### • Requisitos Não Funcionais
- *RNF1: Usabilidade* — A interface (desenvolvida em React) deve ser intuitiva, responsiva e de fácil navegação para a equipe administrativa.
- *RNF2: Desempenho* — As requisições (gerenciadas pelo Node.js) devem possuir tempo de resposta ágil, garantindo fluidez no uso diário.
- *RNF3: Integridade* — O banco de dados relacional deve garantir a consistência das informações, relacionando corretamente clientes aos seus contratos e eventos.
- *RNF4: Segurança* — Os dados sensíveis dos clientes (como RG/CPF e contratos) devem ser armazenados com proteção contra acessos não autorizados.
