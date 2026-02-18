---
trigger: always_on
---

# Adote Pet — Arquitetura Front-end (Obrigatório)

## Estrutura
- Páginas não duplicam UI: páginas só orquestram e consomem componentes.
- Componentes reutilizáveis primeiro; depois telas.

## Componentes base (devem existir cedo)
- Container / Section / Stack (gap em grid 8).
- PetCard (com variações de badges/tags).
- SearchPanel (desktop) + SearchSheet/Drawer (mobile).
- EmptyState + SkeletonSet.

## Dados e utilitários
- Mock data em /data (ou equivalente).
- Funções utilitárias em /lib (distância, formatação, etc).
- Sem lógica pesada dentro de componentes visuais (separar em hooks/utils).
