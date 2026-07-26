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

## Firebase Cloud Messaging (FCM)

Push notifications em tempo real para o administrador do sistema.

### Arquitetura

```
Cliente (React)
  → notification-service.ts   (permissao + token)
  → fcm-provider.ts           (abstracao + teste)
  → useFCM.ts                 (hook React)
      ↓
Firestore: adminTokens/{uid}
  {uid, token, device, browser, createdAt, updatedAt}
      ↓
Cloud Functions: sendPushToAdmins()
  → Firebase Admin SDK → messaging.sendEach()
      ↓
Celular / Navegador (push notification)
```

### Colecao adminTokens

| Campo     | Tipo      | Descricao                        |
|-----------|-----------|----------------------------------|
| uid       | string    | UID do admin logado              |
| token     | string    | FCM token do dispositivo         |
| device    | string    | Desktop / Mobile / Tablet        |
| browser   | string    | Chrome / Firefox / Safari / Edge |
| createdAt | Timestamp | Data de criacao                  |
| updatedAt | Timestamp | Data de atualizacao              |

### Mensagens Push

| Evento             | Titulo                     | Corpo                                                    |
|-------------------|----------------------------|----------------------------------------------------------|
| new_appointment   | 💅 Novo Agendamento       | {client} agendou {servico} as {horario}.                 |
| confirmed         | ✅ Agendamento Confirmado  | {servico} para {data} as {horario}.                      |
| cancelled         | ❌ Agendamento Cancelado   | {servico} para {data} as {horario}.                      |
| rescheduled       | 📅 Agendamento Reagendado | {servico} reagendado para {novaData} as {novoHorario}.   |

### Como Ativar o FCM

1. **Firebase Console** → Project Settings → Cloud Messaging → Web Push certificates
2. Gerar chave VAPID
3. Adicionar `VITE_FIREBASE_VAPID_KEY` ao `.env`
4. No app do admin, clicar no icone de sino "Ativar notificações" no header
5. Aceitar a permissão do navegador
6. O token sera salvo automaticamente em `adminTokens`

### Como Publicar as Functions

```bash
cd functions
npm run build
cd ..
firebase deploy --only functions
```

### Como Testar

1. Abrir `/admin/dashboard` como admin logado
2. Clicar no icone de sino "Ativar notificacoes" no header
3. Aceitar permissão do navegador
4. Criar um agendamento pelo site público (`/`)
5. Verificar se a push notification aparece no navegador/celular do admin
6. Testar confirmacao, cancelamento e reagendamento

### Arquivos FCM

| Arquivo                               | Descricao                          |
|---------------------------------------|------------------------------------|
| public/firebase-messaging-sw.js       | Service Worker (background push)   |
| src/lib/firebase/messaging.ts         | Inicializacao FCM                  |
| src/lib/firebase/notification-service.ts | Permissao + token + Firestore   |
| src/lib/admin/fcm-provider.ts         | Abstracao + teste local            |
| src/hooks/admin/useFCM.ts             | Hook React                         |
| functions/src/notifications/fcm.ts     | sendPushToAdmins()                 |

## Pendencias

- Integrar Firebase Authentication (substituir login temporario)
- Configurar envio real de e-mails
- Dashboard de analytics de notificacoes
- Exportacao de notificacoes
- Notificacoes por SMS
