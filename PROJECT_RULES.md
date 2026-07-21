# Regras do Projeto NB Nail Booking

## Objetivo

Sistema exclusivo para **NB Nath Bittencourt**.  
Agendamento de serviços de Nail Design.

## Regras fundamentais

1. Não criar sistema multi-tenant
2. Não criar planos de assinatura
3. Não criar múltiplos profissionais
4. Não criar login para clientes
5. Não criar funcionalidades complexas de CRM
6. Manter simplicidade e foco no agendamento
7. Mobile-first sempre
8. Identidade visual feminina, elegante e premium

## Stack fixa

- React + TypeScript + Vite
- Tailwind CSS v4
- Firebase
- React Router
- Lucide React

## Convenções

- Tokens de design centralizados em `src/styles/index.css`
- Tipos em `src/types/index.ts`
- Constantes e dados demo em `src/constants/index.ts`
- Componentes organizados por domínio: `ui/`, `booking/`, `admin/`, `shared/`
- Hooks em `src/hooks/`
- Lib Firebase em `src/lib/firebase/`

## Design tokens

- `rose` — cor principal da marca
- `pink` — detalhes e destaques
- `black` — contraste e textos
- `white` — base do tema claro

## Temas

- Claro: fundo `white`, textos `black`
- Escuro: fundo `black`, textos `white`
- Toggle salvo em `localStorage` (`nb_theme`)
