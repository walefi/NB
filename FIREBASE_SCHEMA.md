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

- Criacao publica: campos obrigatorios validados, status inicial `pending`
- Leitura/edicao: somente admin autenticado
- Validacao: nao permite horario duplicado (mesma data + hora + status != cancelled)

### settings (futuro)

Configuracoes do estudio (horarios de funcionamento, etc.).

---

## Regras de Seguranca

Arquivo: `firestore.rules`

- `services`: leitura publica de ativos, escrita admin
- `appointments`: criacao publica com validacao de campos, leitura/edicao admin
- `settings`: admin apenas
- Restante: negado por padrao

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
