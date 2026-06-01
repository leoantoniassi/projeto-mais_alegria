---
name: feature-workflow
description: Use quando o usuário pedir para criar, implementar ou desenvolver uma nova funcionalidade, feature, módulo, ou recurso no projeto. Ative sempre que houver solicitação de desenvolvimento de código novo que exija o pipeline completo de implementação, revisão, segurança e testes.
---

# Feature Development Workflow

Sempre que for solicitado o desenvolvimento de uma nova feature, siga **obrigatoriamente** esta ordem de agentes:

1. **@engenheiro-desenvolvimento** — Implementar a funcionalidade principal (código funcional e de qualidade)
2. **@revisor-codigo** — Revisar e refatorar o código aplicando SOLID, DRY e Clean Code
3. **@especialista-seguranca** — Auditar e corrigir vulnerabilidades de segurança (OWASP, injeções, etc.)
4. **@engenheiro-testes** — Criar testes unitários, de integração e E2E

Cada agente deve receber como contexto o resultado (código/output) do agente anterior. O ciclo só é concluído após todos os 4 agentes terem executado suas respectivas etapas. O agente primário é responsável por orquestrar a chamada de cada subagente via task tool, passando adiante o resultado de cada etapa.
