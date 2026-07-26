# Central de Notificacoes Inteligente

## Visao Geral

Sistema completo de notificacoes em tempo real para o painel administrativo do NB Nail Booking. Funciona 100% no plano gratuito do Firebase (Spark) sem Cloud Functions.

## Arquitetura (Plano Spark - Gratuito)

```
Cliente (React)
  → onSnapshot() em appointments (realtime)
  → createNotification() → Firestore
  → onSnapshot() em notifications (realtime)
  → playNotificationSound() (Audio API)
  → UI: NotificationBell + NotificationPanel + NotificationCenter
```

**Servicos utilizados:**
- Firebase Firestore (banco de dados + realtime)
- Firebase Authentication (login)
- Firebase Hosting (deploy)
- Firebase Storage (imagens)

**Nao utiliza:**
- Cloud Functions
- Firebase Cloud Messaging (FCM)
- WhatsApp Cloud API
- Email providers externos

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
| serviceName   | string  | Nome do servico                     |
| date          | string  | Data do agendamento (YYYY-MM-DD)    |
| time          | string  | Horario do agendamento (HH:mm)      |
| createdAt     | string  | Data de criacao (ISO 8601)          |
| read          | boolean | Se ja foi lida                      |

## Tipos de Notificacao

| Type             | Descricao              | Titulo                  | Icone |
|-----------------|------------------------|-------------------------|-------|
| new_appointment | Novo agendamento       | Novo Agendamento        | 💅    |
| confirmed       | Agendamento confirmado | Agendamento Confirmado  | ✅    |
| cancelled       | Agendamento cancelado  | Agendamento Cancelado   | ❌    |
| rescheduled     | Reagendamento          | Agendamento Reagendado  | 📅    |
| completed       | Atendimento finalizado | Atendimento Finalizado  | ✔️    |
| reminder_24h    | Lembrete 24h antes     | Lembrete - 24h          | ⏰    |
| reminder_2h     | Lembrete 2h antes      | Lembrete - 2h           | ⏰    |
| reminder_30min  | Lembrete 30min antes   | Lembrete - 30min        | ⏰    |

## Fluxos Implementados

### Novo Agendamento

Quando um cliente agenda pelo site publico:
1. `createAppointment()` cria o documento no Firestore
2. `createNotification()` gera automaticamente uma notificacao do tipo `new_appointment`
3. `playNotificationSound()` toca som de alerta
4. Mensagem: "Maria acabou de agendar Alongamento em Gel para quinta as 14:00."

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

## Alerta Sonoro

Quando chega uma nova notificacao:
1. Toca um som curto (chime de 3 tons)
2. Toca apenas uma vez por sessao (nao repete apos refresh)
3. Respeita politicas do navegador ( AudioContext suspendido ate interacao)
4. Usa Audio API nativa (sem arquivos externos)

## WhatsApp Rapido

Botao "WhatsApp" nos agendamentos:
- Abre wa.me com mensagem pre-preenchida
- Mensagem: "Ola, {cliente}. Recebemos seu agendamento para {data} as {hora}."

## Copiar Dados

Botao "Copiar" nos agendamentos:
- Copia: Nome, Telefone, Servico, Data, Hora, Pagamento
- Formato texto simples para colar em qualquer lugar

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
- Mostra nome do servico

### Dashboard

- Card "Notificacoes Hoje" com contagem
- Card "Nao Lidas" com contagem
- Atualizacao em tempo real via onSnapshot

### Filtros de Agendamentos

- Todos / Hoje / Amanha / Esta semana
- Todos / Pendente / Confirmado / Concluido / Cancelado
- Pesquisa por nome ou telefone

## Firestore Rules

```javascript
match /notifications/{notificationId} {
  allow create, read, update, delete: if request.auth != null;
}
```

## Preparacao Futura (Plano Blaze)

O projeto possui interfaces preparadas para futura integracao:

```typescript
// types/index.ts
interface EmailProvider {
  send(to: string, subject: string, body: string): Promise<boolean>
}

interface PushProvider {
  send(token: string, title: string, body: string): Promise<boolean>
  requestPermission(): Promise<string | null>
}

interface WhatsAppProvider {
  send(phone: string, message: string): Promise<boolean>
}
```

Para ativar no futuro (plano Blaze):
1. **FCM**: Implementar Cloud Functions + FCM + provider de push
2. **WhatsApp**: Integrar Meta WhatsApp Cloud API
3. **Email**: Integrar Resend, SendGrid ou Nodemailer

Apenas implementar os providers. A arquitetura ja esta pronta.

## Arquivos

| Arquivo                               | Descricao                          |
|---------------------------------------|------------------------------------|
| src/lib/firebase/notifications.ts     | CRUD + onSnapshot (realtime)       |
| src/lib/admin/whatsapp.ts             | Templates WhatsApp (cliente)       |
| src/lib/admin/notification-sound.ts   | Alerta sonoro (Audio API)          |
| src/hooks/admin/useNotifications.ts   | Hook React com realtime            |
| src/components/admin/notifications/   | Bell + Panel                       |
| src/pages/admin-notifications.tsx     | Pagina completa                    |
| src/components/admin/appointments/    | WhatsApp + Copiar buttons          |

## Performance

- `onSnapshot()` para atualizacoes em tempo real
- Um unico listener por hook `useNotifications()`
- Badge atualiza sem polling
- LocalStorage como fallback quando Firebase nao esta configurado
- Som toca apenas uma vez por sessao
