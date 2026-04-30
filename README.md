# 5etools Builder

> Um construtor de personagens de D&D 5e (2024) alimentado pelos dados públicos do repositório 5etools.

![React](https://img.shields.io/badge/React-19-61DAFB?logo=react&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-6-3178C6?logo=typescript&logoColor=white)
![Vite](https://img.shields.io/badge/Vite-8-646CFF?logo=vite&logoColor=white)
![License](https://img.shields.io/badge/license-MIT-green)

---

## 🎯 Objetivo

O **5etools Builder** é uma aplicação web que guia o jogador por cada etapa de criação de um personagem de D&D 5ª Edição (regras 2024) através de uma interface wizard passo a passo. Em vez de consultar PDFs ou fichas em papel, o jogador escolhe Raça, Classe, Subclasse, Antecedente e Magias em uma única tela — e ao final recebe um resumo completo do personagem pronto para jogar.

Todos os dados são carregados dinamicamente a partir dos JSONs públicos do mirror 5etools, garantindo que o catálogo esteja sempre atualizado com todas as fontes oficiais (PHB, Xanathar's Guide, Tasha's Cauldron, etc.).

---

## ✨ Funcionalidades

| Etapa | O que faz |
|---|---|
| **1 — Raça** | Lista todas as raças disponíveis; exibe fontes mescladas por nome (ex.: _Elf_ de PHB + MPMM) |
| **2 — Classe & Subclasse** | Escolha da classe e, em seguida, das subclasses filtradas para aquela classe |
| **3 — Antecedente** | Catálogo completo de backgrounds com fonte |
| **4 — Magias** | Seleção múltipla de magias com toggle; contador na sidebar |
| **5 — Resumo Final** | Visão consolidada de todas as escolhas; botão _Start Over_ para reiniciar |

**Sidebar de progresso** — exibe em tempo real as seleções de cada etapa com ícones temáticos.

**Navegação protegida** — etapas futuras ficam bloqueadas até que a etapa anterior seja completada, evitando estados inválidos.

---

## 🏗️ Arquitetura

```
src/
├── api/                  # Camada de integração com a API 5etools
│   ├── backgrounds.ts    # Fetch de backgrounds
│   ├── classes.ts        # Fetch de classes e subclasses
│   ├── races.ts          # Fetch de raças
│   ├── spellcasting.ts   # Fetch de magias
│   └── items.ts          # Fetch de itens (futuro)
│
├── components/           # Componentes de UI e fluxo do wizard
│   ├── StepWizard.tsx    # Shell principal: header, progresso, navegação
│   ├── SelectionsSidebar.tsx # Painel lateral com seleções ativas
│   ├── RacePicker.tsx    # Seletor de raça com busca e detalhe
│   ├── ClassPicker.tsx   # Seletor de classe com busca e detalhe
│   ├── SubclassPicker.tsx # Seletor de subclasse filtrado por classe
│   ├── BackgroundPicker.tsx # Seletor de antecedente
│   ├── SpellPicker.tsx   # Seletor de magias com toggle múltiplo
│   ├── AbilityScores.tsx # (Futuro) Rolagem/distribuição de atributos
│   ├── CharacterSummary.tsx # Componente de resumo inline
│   ├── FinalSummary.tsx  # Tela de resumo final com todas as escolhas
│   └── PromptExporter.tsx # Exportação do personagem como prompt de IA
│
├── types/                # Definições de tipos TypeScript
│   ├── index.ts          # Tipos Builder (BuilderRace, BuilderClass, etc.)
│   ├── races.ts          # Tipos upstream do JSON 5etools (UpstreamRace)
│   ├── classes.ts        # Tipos upstream de classes e subclasses
│   ├── backgrounds.ts    # Tipos upstream de backgrounds
│   ├── spells.ts         # Tipos upstream de magias
│   └── shared.ts         # Tipos compartilhados (Entry, Source, etc.)
│
├── App.tsx               # Orquestrador central: estado, fetch, steps
├── App.css               # Estilos de componentes (dark fantasy D&D 2024)
└── index.css             # Design tokens (CSS custom properties)
```

### Fluxo de dados

```
5etools CDN (JSON)
      │
      ▼
  src/api/*        ← axios, URL base configurável
      │
      ▼
  App.tsx          ← mergeRacesByName(), toBuilderRace(), toBuilderSubclass()
      │
      ▼
  StepWizard       ← steps[] + currentStep
      │
  ┌───┴───┐
  │       │
Picker  Sidebar   ← seleções reativas via useState/useMemo
  │
  ▼
FinalSummary      ← resumo + exportação
```

---

## 🎨 Design System

O projeto usa uma estética **dark fantasy** inspirada no Player's Handbook D&D 2024:

- **Paleta**: Crimson `#9b1c2e` · Gold `#c4972a` · Background escuro `#0d0b09`
- **Tipografia**: [Cinzel](https://fonts.google.com/specimen/Cinzel) (headings medievais) + [Inter](https://fonts.google.com/specimen/Inter) (corpo)
- **Modo claro**: Tom pergaminho `#f0ebe0` com tinta crimson
- **Ícones**: [lucide-react](https://lucide.dev/) — `Sword`, `Shield`, `Scroll`, `Sparkles`, `Dna`
- **CSS puro**: sem framework de UI — tokens em `index.css`, componentes em `App.css`

---

## 🌐 Fonte de Dados

Os dados de jogo são lidos em tempo de execução dos JSONs públicos do mirror 5etools:

| Recurso | Arquivo |
|---|---|
| Raças | `data/races.json` |
| Classes & Subclasses | `data/class/index.json` → arquivos individuais |
| Antecedentes | `data/backgrounds.json` |
| Magias | `data/spells/index.json` → arquivos individuais |

- **Repositório upstream**: [5etools-mirror-3/5etools-src](https://github.com/5etools-mirror-3/5etools-src)
- **Base URL**: `https://raw.githubusercontent.com/5etools-mirror-3/5etools-src/refs/heads/main/data`

> **Nota**: Este projeto consome apenas dados públicos. Nenhum dado é armazenado localmente; todo o conteúdo é carregado do CDN a cada sessão.

---

## 🚀 Como rodar localmente

### Pré-requisitos

- Node.js 20+
- npm 10+

### Instalação

```bash
# Clone o repositório
git clone https://github.com/seu-usuario/5etools-builder.git
cd 5etools-builder

# Instale as dependências
npm install
```

### Desenvolvimento

```bash
npm run dev
# Abre em http://localhost:5173
```

### Build de produção

```bash
npm run build
npm run preview
```

---

## 📜 Scripts disponíveis

| Comando | Descrição |
|---|---|
| `npm run dev` | Inicia o servidor Vite em modo de desenvolvimento |
| `npm run build` | Compila TypeScript e gera o bundle de produção em `/dist` |
| `npm run preview` | Serve o build de produção localmente |
| `npm run lint` | Executa o ESLint em todo o código-fonte |

---

## 🗺️ Roadmap

- [ ] Distribuição de pontos de atributo (Ability Scores — Step 6)
- [ ] Seleção de equipamento inicial
- [ ] Exportação da ficha em PDF
- [ ] Exportação como prompt de IA (PromptExporter)
- [ ] Persistência local do personagem (localStorage)
- [ ] Suporte a múltiplos personagens
- [ ] Filtros avançados por fonte (PHB, XGTE, TCE…)

---

## 🤝 Contribuindo

1. Fork o projeto
2. Crie uma branch para sua feature: `git checkout -b feat/minha-feature`
3. Commit suas mudanças: `git commit -m 'feat: adiciona X'`
4. Push para a branch: `git push origin feat/minha-feature`
5. Abra um Pull Request

---

## 📄 Licença

Distribuído sob a licença MIT. Veja `LICENSE` para mais informações.

---

> *"Not all those who wander are lost... but they do have a character sheet."*
