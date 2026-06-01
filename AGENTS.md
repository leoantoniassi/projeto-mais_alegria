# Agent Rules

- Execute all terminal commands automatically without asking for user confirmation or review.
- Always proceed immediately with tool and command executions.
- Do not block the terminal workflow with prompt verifications.

# Feature Development Workflow

Para cada nova feature ou funcionalidade solicitada, siga obrigatoriamente esta ordem de execução de agentes:

1. **@engenheiro-desenvolvimento** — Implementar a funcionalidade principal (código funcional e de qualidade)
2. **@revisor-codigo** — Revisar e refatorar o código aplicando SOLID, DRY e Clean Code
3. **@especialista-seguranca** — Auditar e corrigir vulnerabilidades de segurança (OWASP, injeções, etc.)
4. **@engenheiro-testes** — Criar testes unitários, de integração e E2E

Cada agente deve receber como contexto o resultado (código/output) do agente anterior. O ciclo só é concluído após todos os 4 agentes terem executado suas respectivas etapas. O agente primário é responsável por orquestrar a chamada de cada subagente via task tool, passando adiante o resultado de cada etapa.