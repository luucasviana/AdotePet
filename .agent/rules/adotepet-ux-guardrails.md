---
trigger: always_on
---

# Adote Pet — UX Guardrails (Obrigatório)

## Estados sempre obrigatórios
- Loading (skeleton), Empty, Empty por filtro, Error, Success (toast).

## Busca e catálogo
- O catálogo deve mostrar pets recentes e suportar ordenação:
  - “Mais próximos” (default) e “Mais recentes”.
- No mobile, filtros avançados devem abrir em Sheet/Drawer, sem trocar de página.
- Evitar frustração:
  - Se o animal foi adotado, o card deve sumir da busca ou virar “Adotado” imediatamente.

## Formulários
- Sempre progressivos: nunca pedir “muitos dados de uma vez”.
- Feedback claro: erro e sucesso com mensagem curta e ação recomendada.

## Acessibilidade
- Labels e aria em inputs.
- Alt text em imagens.
- Contraste alto em textos essenciais.