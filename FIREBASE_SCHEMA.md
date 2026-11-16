# Firebase Schema — NB Nail Booking

## Configuracao

Variaveis de ambiente (`.env`):

```
VITE_FIREBASE_API_KEY=
VITE_FIREBASE_AUTH_DOMAIN=
VITE_FIREBASE_PROJECT_ID=
VITE_FIREBASE_STORAGE_BUCKET=
VITE_FIREBASE_MESSAGING_SENDER_ID=
VITE_FIREBASE_APP_ID=
```

Sem Firebase configurado, o sistema opera em modo demonstracao com `localStorage` e dados mockados.

---

## Collections

### services

```typescript
{
  name: string
  description: string
  price: number          // em reais
  duration: number       // minutos
  imageURL?: string
  isActive: boolean
  order: number          // ordenacao na listagem
  createdAt: Timestamp
}
```

- Leitura publica: somente servicos com `isActive == true`
- Escrita: somente admin autenticado
- Ordenacao: `order ASC`

### appointments

```typescript
{
  serviceId: string
  serviceName: string       // snapshot do nome
  servicePrice: number       // snapshot do preco
  serviceDuration: number    // snapshot da duracao
  clientName: string
  clientPhone: string
  date: string               // YYYY-MM-DD
  time: string               // HH:MM
  paymentMethod: "pix" | "card" | "cash" | "to_combine"
  notes?: string | null
  status: "pending" | "confirmed" | "cancelled" | "completed" | "no_show"
  createdAt: Timestamp
}
```

- Criacao publica: campos obrigatorios validados, status inicial `confirmed`
- Leitura/edicao: somente admin autenticado (a colecao contem dados pessoais)
- Validacao: nao permite horario duplicado (mesma data + hora + status != cancelled)

### availability

Um documento por dia (id do documento = `YYYY-MM-DD`). Guarda apenas os
horarios ocupados, **sem nenhum dado do cliente**, por isso pode ser lido
publicamente.

```typescript
{
  date: string               // YYYY-MM-DD (igual ao id do documento)
  slots: { "09:00": 60 }     // horario (HH:MM) -> duracao em minutos
  updatedAt: string
}
```

- Leitura publica: usada pelo calendario e pelo seletor de horario do site
- Criacao publica: cria o dia com exatamente 1 slot
- Atualizacao publica: **adiciona** exatamente 1 slot (nunca remove nem altera)
- Atualizacao/exclusao: somente admin autenticado (cancelar / reagendar / excluir)
- Como todo o dia cabe em um unico documento, uma transacao nele serializa os
  agendamentos do dia: dois clientes disputando o mesmo horario fazem uma das
  transacoes falhar, o que impede reserva dupla.
- A colecao `appointments` continua sendo a fonte de verdade dos dados do
  cliente. Depois de cancelar, reagendar, mover ou excluir um agendamento, o
  admin reconstroi o dia a partir de `appointments` (`rebuildDaySlots`).

### settings (futuro)

Configuracoes do estudio (horarios de funcionamento, etc.).

---

## Regras de Seguranca

Arquivo: `firestore.rules`

- `services`: leitura publica de ativos, escrita admin
- `appointments`: criacao publica com validacao de campos, leitura/edicao admin
- `availability`: leitura publica (horarios ocupados, sem PII), criacao/update
  publica limited a adicionar 1 slot, remocao de slot apenas admin
- `notifications`: criacao publica (o agendamento dispara o aviso), leitura admin
- `settings`: leitura publica, escrita admin
- Restante: negado por padrao

### Como testar as regras localmente

```bash
npm run verify:rules
```

Sobe o emulador do Firestore e do Auth e roda `scripts/verify-firestore-rules.mjs`,
que simula o agendamento publico (sem autenticacao) e valida:

- leitura anonima de `appointments` bloqueada (sem vazamento de dados pessoais)
- agendamento publico grava agendamento + horario reservado
- reserva dupla e sobreposta sao rejeitadas
- o anonimo nao consegue liberar um horario
- o admin autenticado le e libera horarios

---

## Indices Compostos Necessarios

Executar no console Firebase:

```
services: isActive (ASC) + order (ASC)
appointments: date (ASC) + time (ASC)
appointments: date (ASC) + time (ASC) + status (ASC)
```

---

## Storage

- `services/` — imagens dos servicos
- `logo/` — logo do estudio

---

## Authentication

- Email/senha para a profissional
- Clientes nao precisam de autenticacao

---

## Modo Demonstracao

Sem Firebase configurado:
- Servicos: `src/constants/index.ts` (DEMO_SERVICES)
- Agendamentos: `localStorage` (chave `nb_appointments`)
- Admin login: `localStorage` (chave `nb_admin_auth`)
