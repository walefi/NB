# Central de Notificacoes Inteligente

## Visao Geral

Sistema completo de notificacoes em tempo real para o painel administrativo do NB Nail Booking. Gera automaticamente notificacoes quando ocorrem alteracoes nos agendamentos.

## Arquitetura

```
lib/firebase/notifications.ts   CRUD + onSnapshot (realtime)
lib/admin/whatsapp.ts          Templates WhatsApp
lib/admin/email.ts             Arquitetura de e-mail (preparado)
lib/admin/scheduler.ts         Lembretes automaticos
hooks/admin/useNotifications.ts Hook React com realtime
components/admin/notifications/ UI (Bell + Panel)
pages/admin-notifications.tsx  Pagina completa
```

## Colecao Firestore

### notifications

| Campo          | Tipo    | Descricao                          |
|---------------|---------|-------------------------------------|
| id            | string  | ID unico do documento               |
| type          | string  | Tipo da notificacao                 |
| title         | string  | Titulo curto                        |
| message       | string  | Mensagem descritiva                 |
| appointmentId | string  | ID do agendamento relacionado       |
| clientName    | string  | Nome do cliente                     |
| clientPhone   | string  | Telefone do cliente                 |
| date          | string  | Data do agendamento (YYYY-MM-DD)    |
| time          | string  | Horario do agendamento (HH:mm)      |
| createdAt     | string  | Data de criacao (ISO 8601)          |
| read          | boolean | Se ja foi lida                      |

## Tipos de Notificacao

| Type             | Descricao              | Titulo                  |
|-----------------|------------------------|-------------------------|
| new_appointment | Novo agendamento       | Novo Agendamento        |
| confirmed       | Agendamento confirmado | Agendamento Confirmado  |
| cancelled       | Agendamento cancelado  | Agendamento Cancelado   |
| rescheduled     | Reagendamento          | Agendamento Reagendado  |
| completed       | Atendimento finalizado | Atendimento Finalizado  |
| reminder_24h    | Lembrete 24h antes     | Lembrete - 24h          |
| reminder_2h     | Lembrete 2h antes      | Lembrete - 2h           |
| reminder_30min  | Lembrete 30min antes   | Lembrete - 30min        |

## Fluxos Implementados

### Novo Agendamento

Quando um cliente agenda pelo site publico:
1. `createAppointment()` cria o documento no Firestore
2. `createNotification()` gera automaticamente uma notificacao do tipo `new_appointment`
3. Mensagem: "Maria acabou de agendar Alongamento em Gel para quinta as 14:00."

### Confirmar

Quando o admin confirma um agendamento:
1. `updateAppointmentStatus(id, 'confirmed', data)` atualiza o Firestore
2. Gera notificacao do tipo `confirmed`
3. Mensagem: "Agendamento de Maria (Alongamento em Gel) confirmado para 25/07 as 14:00."

### Cancelar

Quando o admin cancela:
1. `updateAppointmentStatus(id, 'cancelled', data)` atualiza o Firestore
2. Gera notificacao do tipo `cancelled`
3. Mensagem: "Maria cancelou o atendimento de Alongamento em Gel."

### Concluir

Quando o admin finaliza:
1. `updateAppointmentStatus(id, 'completed', data)` atualiza o Firestore
2. Gera notificacao do tipo `completed`
3. Mensagem: "Atendimento de Maria (Alongamento em Gel) finalizado."

### Reagendamento

Fluxo de reagendamento gera notificacao do tipo `rescheduled`.

## UI

### Sino de Notificacoes (DesktopHeader)

- Localizado no header desktop, ao lado do botao de logout
- Badge com contador de nao lidas
- Abre painel flutuante com as ultimas 20 notificacoes
- Acoes: marcar como lida, excluir

### Pagina de Notificacoes (`/admin/notifications`)

- Lista completa com filtros por tipo e status (lida/nao lida)
- Acoes: marcar como lida, marcar todas, excluir
- Indicadores visuais por tipo de notificacao

### Dashboard

- Card "Notificacoes Hoje" com contagem
- Card "Nao Lidas" com contagem

## WhatsApp

Templates de mensagem pre-definidos:

| Template      | Descricao                          |
|--------------|-------------------------------------|
| confirmation | Confirmacao de agendamento          |
| cancellation | Cancelamento de agendamento         |
| reschedule   | Reagendamento                       |
| reminder     | Lembrete 24h antes                  |
| postService  | Pos-atendimento (obrigada)          |

Uso:
```typescript
import { openWhatsApp } from '@/lib/admin/whatsapp'
openWhatsApp(appointment, 'confirmation')
```

## Email

Arquitetura preparada com provider abstrato:

```typescript
import { sendAppointmentEmail } from '@/lib/admin/email'
await sendAppointmentEmail(appointment, 'confirmation')
```

Atualmente usa `ConsoleEmailProvider` (log no console). Pronto para integrar com:
- Resend
- SendGrid
- Nodemailer
- Firebase Extensions (Mailchimp, etc.)

## Lembretes

O scheduler verifica periodicamente os agendamentos e gera lembretes:

| Intervalo   | Tipo           | Condicao                    |
|------------|----------------|------------------------------|
| 24 horas   | reminder_24h   | Agendamento nas proximas 24h |
| 2 horas    | reminder_2h    | Agendamento nas proximas 2h  |
| 30 minutos | reminder_30min | Agendamento nos proximos 30min |

Uso:
```typescript
import { checkAndSendReminders } from '@/lib/admin/scheduler'
await checkAndSendReminders(appointments)
```

## Performance

- `onSnapshot()` para atualizacoes em tempo real
- Um unico listener por hook `useNotifications()`
- Badge atualiza sem polling
- LocalStorage como fallback quando Firebase nao esta configurado

## Firestore Rules

Adicionar regra para a colecao `notifications`:

```javascript
match /notifications/{notificationId} {
  allow read: if request.auth != null;
  allow create: if request.auth != null;
  allow update: if request.auth != null;
  allow delete: if request.auth != null;
}
```

## Pendencias

- Integrar Firebase Authentication (substituir login temporario)
- Configurar envio real de e-mails
- Implementar push notifications (FCM)
- Dashboard de analytics de notificacoes
- Exportacao de notificacoes
- Notificacoes por SMS
