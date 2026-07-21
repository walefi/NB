# NB Nail Booking

Sistema de agendamento para **NB Nath Bittencourt** — Nail Design.

## Stack

- React + TypeScript
- Vite
- Tailwind CSS v4
- Firebase (Firestore, Auth, Storage)
- React Router
- Lucide React

## Desenvolvimento

```bash
npm install
npm run dev
```

Acessar: [http://localhost:5173](http://localhost:5173)

## Configuracao Firebase

1. Copie `.env.example` para `.env`
2. Preencha com as credenciais do seu projeto Firebase
3. Execute `npm run dev`

Sem Firebase configurado, o sistema opera em modo demonstracao com `localStorage`.

## Rotas

| Rota | Descricao |
|------|-----------|
| `/` | Pagina publica de agendamento |
| `/confirmacao` | Confirmacao de agendamento (fallback) |
| `/admin` | Login administrativo |
| `/admin/dashboard` | Painel administrativo |

## Comandos

| Comando | Descricao |
|---------|-----------|
| `npm run dev` | Servidor de desenvolvimento |
| `npm run build` | Build de producao (`tsc -b && vite build`) |
| `npm run lint` | Lint (oxlint) |
| `npm run preview` | Preview do build |

## Deploy (Render.com)

- Build command: `npm run build`
- Publish directory: `dist`
- Adicionar variaveis de ambiente `VITE_FIREBASE_*` no painel do Render

## Estrutura do Projeto

```
src/
├── components/
│   ├── ui/          # Componentes base (Button, Card, Input, etc.)
│   ├── booking/     # Componentes do fluxo de agendamento
│   ├── admin/       # Componentes do painel administrativo
│   └── shared/      # Componentes compartilhados (Header, Logo)
├── pages/           # Paginas (rotas)
├── lib/
│   ├── firebase/    # Configuracao e acesso ao Firebase
│   └── utils.ts     # Utilitarios
├── hooks/           # Hooks personalizados
├── types/           # Tipos TypeScript
├── constants/       # Constantes e dados mockados
└── styles/          # CSS global e tokens de design
```
