# NB Nail Booking — Progresso do Projeto

## Etapa 3: Validacao Real do Firebase e Firestore

### Status: CONCLUIDA

---

## FASE 1 — Validacao da Configuracao

| Item | Status | Detalhe |
|------|--------|---------|
| `VITE_FIREBASE_*` documentadas | OK | 6 variaveis em `.env.example` |
| Deteccao de configuracao | OK | `allEnvVarsPresent()` em `config.ts:15-20` |
| Credenciais no codigo | CORRIGIDO | `.env.example` sanitizado — valores reais removidos |
| Erro compreensivel | OK | `initError` exposto no admin login |
| `firebaseReady` | OK | `false` quando sem `.env`, `true` com `.env` completo |

**Correcao aplicada:** `.env.example` continha credenciais reais do Firebase — sanitizado para valores vazios com instrucoes de preenchimento.

---

## FASE 2 — Validacao de Servicos

| Item | Status | Detalhe |
|------|--------|---------|
| `isActive == true` | OK | Filtro em `services.ts:49` |
| Ordenacao `order ASC` | OK | `orderBy('order', 'asc')` em `services.ts:50` |
| Colecao vazia | OK | Fallback para `DEMO_SERVICES` em `services.ts:55-57` |
| Erro de permissao | OK | Tratado via catch generico com fallback |
| Indice ausente | OK | `ServicesError` com codigo `missing-index` em `services.ts:62-67` |
| Validacao de tipos | OK | `mapServiceDoc` com type guards para price/duration |

---

## FASE 3 — Validacao do Fluxo de Agendamento

Fluxo completo (8 passos logicos):

```
1. Pagina Inicial (Hero + Servicos)
2. [Stepper 1] Selecao de servico
3. [Stepper 2] Selecao de data (calendario)
4. [Stepper 3] Selecao de horario
5. [Stepper 4] Dados (nome + WhatsApp)
6. [Stepper 5] Pagamento (PIX/Cartao/Dinheiro/A combinar)
7. [Stepper 6] Revisao (todos os dados + valor)
8. [Stepper 7] Confirmacao (ID NB-XXXXXX, resumo, status)
```

Fluxo codificado em `src/pages/public-booking.tsx` — `renderStepContent()` switch.

---

## FASE 4 — Teste de Duplicidade

| Item | Status | Detalhe |
|-------|--------|---------|
| `checkSlotAvailability()` | OK | Le a ocupacao do dia em `availability/{date}` |
| Bloqueio com mensagem PT-BR | OK | `AppointmentsError` "Este horario ja esta reservado" |
| Double-check local | OK | `createAppointment` verifica localStorage no modo demo |
| Firebase + localStorage | OK | Ambos os caminhos validam duplicidade |
| Reserva atomica | OK | Dia inteiro em 1 documento -> transacao serializa o dia |

---

## FASE 5 — Validacao de Dados (Snapshot)

| Campo | Salvo? | Detalhe |
|-------|--------|---------|
| `serviceId` | Sim | `appointments.ts:134` |
| `serviceName` | Sim | `appointments.ts:135` — snapshot |
| `servicePrice` | Sim | `appointments.ts:136` — snapshot |
| `serviceDuration` | Sim | `appointments.ts:137` — snapshot |
| `clientName` | Sim | `appointments.ts:138` |
| `clientPhone` | Sim | `appointments.ts:139` |
| `date` | Sim | `appointments.ts:140` |
| `time` | Sim | `appointments.ts:141` |
| `paymentMethod` | Sim | `appointments.ts:142` |
| `status` | Sim | `appointments.ts:144` — "pending" |
| `createdAt` | Sim | `appointments.ts:145` |

Snapshot do servico completo: nome, preco e duracao salvos no agendamento para preservar historico.

---

## FASE 6 — Regras de Seguranca

| Regra | Status | Detalhe |
|-------|--------|---------|
| Servicos — leitura publica ativos | OK | `resource.data.isActive == true` |
| Servicos — escrita admin | OK | `request.auth != null` |
| Agendamentos — criacao publica validada | OK | 11 campos requeridos + status=confirmed |
| Agendamentos — leitura publica | **BLOQUEADA (correto)** | `appointments` tem nome/telefone do cliente; leitura so no admin |
| Disponibilidade — leitura publica | OK | `availability/{date}` sem PII, alimenta `TimePicker` e o agendamento |
| Disponibilidade — escrita publica | OK | Cria/adiciona **1** slot; nao pode remover nem alterar |
| Disponibilidade — remocao de slot | admin | Cancelar/reagendar/excluir reconstroi o dia |
| Agendamentos — edicao admin | OK | `request.auth != null` |
| Agendamentos — exclusao admin | OK | `request.auth != null` |
| Padrao — negado | OK | `allow read, write: if false` |
| Nao usa `allow read, write: if true` global | OK | Regras granulares por colecao |

**Correcao aplicada (ver FASE 9):** a leitura publica de `appointments` foi
trocada pela colecao `availability`, que expoe somente os horarios ocupados.
Assim o cliente continua vendo os horarios livres sem que o nome e o telefone
do cliente fiquem publicos.

---

## FASE 7 — Validacao Admin

| Item | Status | Detalhe |
|------|--------|---------|
| Login Firebase Auth | OK | `signInWithEmailAndPassword` em `admin-login.tsx:39` |
| Modo demo (sem Firebase) | OK | Login simulado com localStorage |
| Dashboard — auth guard | CORRIGIDO | `onAuthStateChanged` listener em `admin-dashboard.tsx:30` |
| Dashboard — visualizacao | OK | `useAppointments` hook, filtros, stats |
| Dashboard — confirmar | OK | `updateStatus(id, 'confirmed')` |
| Dashboard — cancelar | OK | `updateStatus(id, 'cancelled')` |
| Dashboard — concluir | OK | `updateStatus(id, 'completed')` |
| Dashboard — nao compareceu | OK | `updateStatus(id, 'no_show')` |
| Logout | OK | `signOut(auth)` + limpa localStorage |
| Exibicao de `initError` | CORRIGIDO | Admin login mostra erro se Firebase parcialmente configurado |

**Correcao aplicada:** Auth guard do dashboard era apenas `localStorage.getItem('nb_admin_auth')` — sem verificacao real do Firebase Auth. Agora usa `onAuthStateChanged` para verificar sessao ativa quando Firebase configurado.

---

## FASE 8 — Testes

| Comando | Resultado |
|---------|-----------|
| `npx tsc -b --noEmit` | 0 erros |
| `npm run build` | Build OK |
| `npm run lint` | 0 erros |
| `npm run verify:rules` | 14/14 checks no emulador do Firestore |

---

## Indices Compostos Necessarios

Criar no Firebase Console (Firestore > Indexes):

```
services:  isActive ASC, order ASC
appointments: date ASC, time ASC
appointments: date ASC, time ASC, status ASC
```

---

## Pendências

- **Publicar as regras do Firestore**: `firebase deploy --only firestore:rules`
- Criar indices compostos no Firebase Console
- Popular colecao `services` com dados reais
- Configurar Firebase Authentication (email/senha para admin)
- Criar arquivos de teste unitario/integracao
- Deploy no Render.com

## Proxima etapa recomendada

Criar projeto Firebase real, popular `services` com dados de producao, criar usuario admin no Firebase Auth, testar fluxo completo localmente, e preparar deploy.

---

## FASE 9 — Correcao do erro de permissao no agendamento

### Status: CONCLUIDA

**Sintoma:** ao clicar em "Confirmar agendamento" o cliente recebia
"Erro de permissao ao salvar. Verifique as regras do Firestore."

**Causa raiz:** o `createAppointment()` lia a colecao `appointments` dentro da
transacao (`getDocs`) para checar conflito de horario, mas as regras exigem
`request.auth != null` para leitura de `appointments`. O visitante do site
nao esta autenticado (regra do projeto: cliente nao faz login), entao a LEITURA
era negada antes mesmo de gravar. O `checkSlotAvailability()` sofria do mesmo
erro, mas engolia a excecao e devolvia "horario livre" — por isso o problema
so aparecia no botao de salvar.

**Correcao:**
- Nova colecao `availability` (1 documento por dia, somente horarios ocupados)
  com leitura publica e escrita publica limitada a adicionar 1 slot.
- `createAppointment()` le e grava `availability` na mesma transacao do
  agendamento. Como o dia inteiro cabe em 1 documento, a transacao serializa os
  agendamentos do dia e reserva dupla / sobreposta e rejeitada.
- `useAvailableSlots()` passou a observar `availability/{date}` em tempo real.
- Cancelar / reagendar / mover / excluir reconstroi o dia a partir de
  `appointments` (`rebuildDaySlots`).
- `syncAvailabilityFromAppointments()` preenche os horarios ja reservados
  antes da colecao existir (roda sozinho no painel admin).

**Verificacao:** `npm run verify:rules` — 14/14 checks no emulador do
Firestore (agendamento anonimo funciona, reserva dupla e sobreposta sao
rejeitadas, PII continua bloqueada para o anonimo, admin consegue liberar
horarios).
