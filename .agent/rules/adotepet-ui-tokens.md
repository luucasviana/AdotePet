---
trigger: always_on
---

# Adote Pet — UI Foundation (Obrigatório)

## 1) Design System oficial (shadcn/ui)
- O design system do produto é **shadcn/ui** (Tailwind + Radix).
- Todo componente de interface deve ser construído **a partir dos componentes shadcn/ui**.
  Exemplos obrigatórios: Button, Input, Select, Card, Badge, Sheet/Drawer, Dialog, Accordion, Carousel, Avatar, Separator, Skeleton, Tabs, DropdownMenu, ScrollArea.
- É proibido criar componentes “do zero” que repliquem peças do shadcn sem necessidade.
  - Exceção: wrappers de produto (ex.: PetCard, SearchPanel, EmptyState) compostos por shadcn.

## 2) Tipografia
- Fonte única do produto: **Nunito** em 100% da UI (H1..H6, body, botões, inputs, dropdowns, labels, tooltips).
- Proibido usar Inter (ou qualquer outra) em qualquer lugar.

## 3) Grid e espaçamento (8pt)
- Todo padding/margin/gap/spacing deve ser múltiplo de 8px:
  8 / 16 / 24 / 32 / 40 / 48 / 56 / 64 ...
- Se estiver usando Tailwind (escala 4px), usar **somente valores pares**:
  - 8px=2, 16px=4, 24px=6, 32px=8, 40px=10, 48px=12, 56px=14, 64px=16.
- Proibido usar valores fora do grid (ex.: 12px, 20px, 28px, 36px, 44px).

## 4) Bordas e radius (apenas 2 níveis)
- Border: quando existir, deve ser **sempre 1px**.
- Radius permitido (somente estes):
  - **8px** para: inputs, selects, botões, chips/tags, pequenos agrupamentos (equivalente a rounded-lg).
  - **16px** para: cards, modais, drawers, seções e containers grandes (equivalente a rounded-2xl).
- Proibido usar outros valores de radius (rounded-sm/md/xl/3xl etc).

## 5) Cores e foco
- Cor primária oficial: **#3B0270**.
- Usos obrigatórios do primary:
  - CTA principal (Button default)
  - Destaques e elementos ativos
  - Ring/focus visível e consistente
- Base visual: fundos claros (white/slate-50) para valorizar fotos dos pets.
- Não remover outline/focus. Usar ring coerente com o primary.

## 6) Tamanhos mínimos e ergonomia
- Altura mínima para botões e inputs: **40px** (h-10).
- Área clicável confortável e consistente em mobile e desktop.

## 7) Acessibilidade (mínimo obrigatório)
- Inputs sempre com label/aria-label.
- Imagens sempre com alt text.
- Componentes Radix/shadcn devem manter keyboard navigation e focus trap quando aplicável.
- Contraste alto para texto essencial.

## 8) Implementação (como construir no código)
- Preferir variantes do shadcn (variant/size) antes de criar classes ad-hoc.
- Classes Tailwind devem respeitar os tokens acima (grid 8, radius 8/16, border 1px).
- Páginas não devem duplicar UI: criar wrappers de produto e reutilizar.
