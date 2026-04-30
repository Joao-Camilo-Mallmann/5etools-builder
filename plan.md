# Plan: D&D 2024 UI/UX Overhaul — 5etools-builder

## STATUS: IN PROGRESS — paused after Phase 1 partial

## TL;DR

Refatorar todo o site com estética do PHB D&D 2024: dark fantasy com crimson/gold, tipografia Cinzel para headings, ícones SVG (lucide-react), layout imersivo e componentes com visual de grimório/ficha de personagem.

## Stack atual

- React 19 + TypeScript + Vite
- CSS puro (index.css tokens + App.css components)
- Sem lucide-react instalado
- Fontes: Inter + Scala Sans (trocar para Cinzel + Inter)

## Decisões de Design

- Paleta: Crimson (#9b1c2e) + Gold (#c4972a) + Dark warm bg (#0d0b09)
- Tipografia: Cinzel (Google Fonts) headers, Inter body
- Estilo: Dark fantasy — sem texturas pesadas, ornamentos sutis via CSS
- Ícones: lucide-react (Sword, Shield, Scroll, Sparkles, Star, User, etc.)
- Manter dark/light toggle, adaptar paleta light para tom parchment

## Escopo incluído

- index.css tokens completo
- App.css rewrite completo
- StepWizard.tsx (header, progress, layout)
- SelectionsSidebar.tsx (ícones lucide)
- RacePicker, ClassPicker, BackgroundPicker, SubracePicker, SubclassPicker
- SpellPicker.tsx
- AbilityScores.tsx
- FinalSummary.tsx, CharacterSummary.tsx
- index.html (Google Fonts import: Cinzel + Cinzel Decorative)

## Escopo excluído

- Lógica/state management (sem tocar em App.tsx lógica)
- API layer (src/api/)
- Types (src/types/)
- PromptExporter (não usado no wizard principal)
- Build/Vite config

## Phases

### Phase 1: Dependências & Tokens (bloqueia tudo)

1. Instalar lucide-react (`npm install lucide-react`)
2. Atualizar index.html: Google Fonts Cinzel + Cinzel Decorative + Inter
3. Reescrever index.css com novos tokens D&D 2024

### Phase 2: CSS Components (App.css) — depende de Phase 1

4. Reescrever App.css completo com novos estilos

### Phase 3: Shell Components — depende de Phase 2

5. StepWizard.tsx — novo header ornamental, novo progress tracker
6. SelectionsSidebar.tsx — ícones lucide, melhor hierarquia visual

### Phase 4: Picker Components — paralelo entre si, depende de Phase 2

7. RacePicker.tsx
8. ClassPicker.tsx
9. BackgroundPicker.tsx
10. SubracePicker.tsx
11. SubclassPicker.tsx

### Phase 5: Feature Components — paralelo, depende de Phase 2

12. SpellPicker.tsx
13. AbilityScores.tsx

### Phase 6: Summary — depende de Phase 2

14. FinalSummary.tsx
15. CharacterSummary.tsx

## Arquivos a modificar

- `index.html`
- `src/index.css`
- `src/App.css`
- `src/components/StepWizard.tsx`
- `src/components/SelectionsSidebar.tsx`
- `src/components/RacePicker.tsx`
- `src/components/ClassPicker.tsx`
- `src/components/BackgroundPicker.tsx`
- `src/components/SubracePicker.tsx`
- `src/components/SubclassPicker.tsx`
- `src/components/SpellPicker.tsx`
- `src/components/AbilityScores.tsx`
- `src/components/FinalSummary.tsx`
- `src/components/CharacterSummary.tsx`

## Design Token Preview (index.css)

Dark:

- --bg: #0d0b09 (quase preto quente)
- --bg-card: #1a1614
- --crimson: #9b1c2e, --crimson-bright: #c0192a
- --gold: #c4972a, --gold-bright: #d4af37
- --text: #d4c9b8, --text-heading: #e8dcc8
- --font-heading: "Cinzel", serif
- --font-body: "Inter", system-ui

Light (parchment):

- --bg: #f0ebe0 (pergaminho)
- --bg-card: #faf6ee
- --crimson: #8c1a2a
- --gold: #9a7a1a

## Verificação

1. `npm run dev` sem erros TypeScript
2. Checar todos os 8 passos do wizard funcionam visualmente
3. Testar toggle dark/light
4. Verificar responsividade em 900px, 700px, 600px
5. Confirmar ícones lucide aparecem em todos os componentes

Completed today:

lucide-react installed
index.html — Google Fonts (Cinzel + Inter), title updated
index.css — Full D&D 2024 token system (crimson, gold, parchment light theme, Cinzel font vars)
Remaining (continue tomorrow):

App.css — full rewrite with D&D aesthetic (crimson buttons, gold selections, ornamental wizard shell)
StepWizard.tsx — lucide icons for theme toggle, nav arrows; Cinzel header
SelectionsSidebar.tsx — swap emoji strings for lucide <ReactNode> icons
App.tsx — update sidebarItems icon type to ReactNode
All 5 Pickers (Race, Class, Background, Subrace, Subclass) — replace emoji search glass + initial icons
SpellPicker, AbilityScores, FinalSummary, CharacterSummary — emoji → lucide, clean headings
