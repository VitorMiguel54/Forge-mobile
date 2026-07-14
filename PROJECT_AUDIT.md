# Forge - Auditoria Backend + Mobile

Atualizado em: 14/07/2026

## Escopo

Esta auditoria considera dois repositorios locais:

- Backend: `C:\Forge`
- Mobile/Web Expo: `C:\Forge-mobile`

Objetivo: preparar o Forge para entrar em fase de polimento, identificando o que ja esta concluido, o que ainda falta, riscos, debitos tecnicos e prioridades recomendadas.

## Resumo Executivo

O Forge ja possui um nucleo funcional integrado. Home, Treinos, Historico, Perfil e Conquistas consomem API real; o fluxo de criacao, execucao e finalizacao de treino funciona usando endpoints reais; acoes rapidas de peso, agua e sono gravam dados na API; XP e conquistas foram implementados no backend e integrados ao mobile.

Desde a primeira auditoria, a Forge API avancou em pontos importantes de estabilizacao:

- `Workout.Status` foi persistido com os estados `Draft`, `InProgress`, `Completed` e `Cancelled`.
- `StartedAt` e `FinishedAt` foram persistidos em `Workout`.
- Agregadores mobile de Home, Treinos e Historico passaram a usar duracao real.
- `WorkoutService.FinishAsync` tornou-se transacional e idempotente.
- O catalogo oficial de conquistas passou a ter seed idempotente com 11 conquistas iniciais e IDs estaveis.
- Testes backend foram ampliados para cobrir finalizacao, rollback, idempotencia e catalogo de conquistas.

A fase atual pode avancar para refinamento visual e UX, mas ainda ha pendencias de produto/contrato que afetam a experiencia: Guardiao real, streaks, progresso parcial de conquistas, feed dedicado de atividade recente, contratos mobile agregados para Perfil/Conquistas e testes automatizados no Mobile.

## Funcionalidades Concluidas

### Backend

- CRUD de `UserProfile`.
- CRUD de `Exercise`, incluindo exercicios globais e customizados.
- CRUD base de `Workout`.
- Campo persistido `Workout.Status` com `Draft`, `InProgress`, `Completed` e `Cancelled`.
- Campos persistidos `StartedAt` e `FinishedAt` em `Workout`.
- Duracao real calculada a partir de `StartedAt` e `FinishedAt`.
- Fluxo de `WorkoutExercise` para vincular/remover exercicios em treinos.
- Fluxo de `WorkoutSet` para criar, listar, atualizar e excluir series.
- Finalizacao de treino com:
  - validacao de exercicios/series;
  - calculo de volume;
  - `Status = Completed`;
  - `FinishedAt`;
  - XP;
  - conquistas;
  - transacao unica;
  - idempotencia para segunda tentativa.
- Registro/listagem/exclusao de peso, agua e sono.
- Atualizacao de `UserProfile.CurrentWeight` ao registrar peso.
- Calculo de meta atingida para agua e sono.
- Agregadores mobile:
  - `GET /api/mobile/users/{userProfileId}/home`
  - `GET /api/mobile/users/{userProfileId}/workouts`
  - `GET /api/mobile/users/{userProfileId}/history`
- Agregadores mobile usam `Workout.Status` persistido e duracao real.
- CORS de desenvolvimento para `http://localhost:8082`.
- Middleware de `ProblemDetails`.
- Gamificacao inicial:
  - XP ao finalizar treino.
  - XP por conquista desbloqueada.
  - Catalogo de conquistas.
  - Conquistas do usuario.
  - Resumo de XP do usuario.
- Endpoints de gamificacao:
  - `GET /api/user-profiles/{userProfileId}/xp`
  - `GET /api/user-profiles/{userProfileId}/achievements`
  - `GET /api/achievements`
- Seed oficial de conquistas:
  - `AchievementCatalog` com 11 conquistas iniciais.
  - IDs estaveis.
  - `AchievementSeeder` idempotente.
  - Execucao no startup da API.

### Mobile

- Arquitetura consistente `apiClient -> service -> hook -> tela`.
- Home integrada a API real.
- Acoes rapidas da Home:
  - Registrar peso.
  - Registrar agua.
  - Registrar sono.
  - Recarregar Home apos sucesso.
- Treinos integrada a API real.
- Criar treino escolhendo nome e exercicios reais.
- Executar treino com exercicios e series reais.
- Criar, editar e excluir series.
- Bloquear alteracoes em treino finalizado.
- Finalizar treino pela API.
- Recarregar Home, Treinos, Historico, Perfil e Conquistas apos finalizar treino.
- Historico integrado a API real.
- Perfil integrado a API real e ao endpoint real de XP.
- Conquistas integrada ao catalogo real, conquistas desbloqueadas e XP.
- Modal de conclusao de treino integrado a dados reais da API: XP ganho, XP total, nivel anterior/novo e conquistas desbloqueadas na finalizacao.
- Estados de loading, erro, vazio e sucesso nas principais telas.
- Bottom navigation principal preservada.
- Tema/tokens centralizados.
- Fontes Inter/Cinzel configuradas via `expo-font`, com apoio no Web por `src/global.css`.
- Auditoria visual criada em `UI_AUDIT.md`.
- Revisao de higiene confirmou UTF-8 nas strings de `src`; o mojibake restante era anotacao documental e foi reclassificado como resolvido.

## Funcionalidades Pendentes

### Produto e Dominio

- Guardiao:
  - Sem contrato real para identidade, imagem, status, evolucao ou relacao com XP/conquistas.
  - Mobile mantem fallback visual/nome do Guardiao.
- Streak:
  - Nao existe contrato de streak no backend.
  - Perfil e Conquistas nao conseguem exibir sequencia real.
- Progresso parcial de conquistas:
  - Backend retorna catalogo e desbloqueios, mas nao retorna progresso atual por conquista.
  - Mobile mostra requisito e estado desbloqueado/bloqueado, sem barra parcial real.
- Feed de atividade recente:
  - Home deriva atividade recente de dados existentes.
  - Nao ha endpoint dedicado com eventos reais.
- Descanso por serie:
  - Mobile nao exibe descanso porque o contrato atual de serie nao fornece esse campo.
- Autenticacao:
  - Fora do escopo atual.
  - `EXPO_PUBLIC_USER_PROFILE_ID` ainda e o identificador manual de usuario.
- Edicao de perfil:
  - Botao existe no mobile, mas fluxo esta desabilitado.
- Configuracoes:
  - Botao existe no mobile, mas fluxo esta desabilitado.
- Avatar real:
  - Perfil usa iniciais derivadas do nome.

## TODOs e Mocks Restantes

### Backend

- Fakes de testes ainda usam `NotImplementedException` em metodos nao exercitados.
- Eventos de XP/conquistas para agua, sono, peso, streaks e metas semanais ainda nao foram implementados.
- `DashboardController` legado ainda existe por compatibilidade.

### Mobile

- `dashboardService.ts`: fallback/TODO para identidade/status do Guardiao.
- `assets/images/guardian-placeholder.png`: asset temporario do Guardiao.
- Perfil usa avatar textual, nao imagem real.
- `explore` e `design-preview` sao rotas auxiliares, nao experiencia final de produto.
- Textos visiveis foram revisados na higiene de UTF-8; manter a checagem para novas strings.

## Endpoints Ainda Nao Consumidos pelo Mobile

O mobile consome os endpoints principais para os fluxos atuais. Ainda ha endpoints backend sem tela/fluxo dedicado no mobile:

- `GET /api/user-profiles`
- `POST /api/user-profiles`
- `PUT /api/user-profiles/{id}`
- `DELETE /api/user-profiles/{id}`
- `POST /api/exercises`
- `GET /api/exercises/{id}`
- `PUT /api/exercises/{id}`
- `DELETE /api/exercises/{id}`
- `GET /api/workouts`
- `PUT /api/workouts/{id}`
- `DELETE /api/workouts/{id}`
- `DELETE /api/workouts/{workoutId}/exercises/{id}`
- `GET /api/user-profiles/{userProfileId}/weight-records`
- `GET /api/user-profiles/{userProfileId}/weight-records/latest`
- `DELETE /api/weight-records/{id}`
- `GET /api/user-profiles/{userProfileId}/water-intakes`
- `GET /api/user-profiles/{userProfileId}/water-intakes/today`
- `DELETE /api/water-intakes/{id}`
- `GET /api/user-profiles/{userProfileId}/sleep-records`
- `GET /api/user-profiles/{userProfileId}/sleep-records/latest`
- `DELETE /api/sleep-records/{id}`
- `GET /api/dashboard/{userProfileId}` legado, substituido no mobile por `/api/mobile/users/{id}/home`.

Esses endpoints nao precisam ser consumidos antes do polimento visual se nao houver UX prevista para eles, mas devem ser classificados como "admin/futuro" ou "produto mobile".

## Telas Incompletas

- Home:
  - Guardiao ainda nao e real.
  - Atividade recente e derivada, nao feed real.
  - Card de conquista mostra dados reais quando houver desbloqueio, mas nao progresso parcial.
- Treinos:
  - Falta UX mais robusta para editar/remover treino e remover exercicio do treino.
  - O status vem da API real, mas a UI ainda precisa melhorar CTAs por status.
- Execucao de treino:
  - Nao ha descanso.
  - Nao ha timer.
  - Nao ha historico de cargas anteriores por exercicio.
  - Apos finalizar, exibe modal simples com XP, nivel e conquistas desbloqueadas antes de navegar para Historico.
- Historico:
  - Nao mostra nomes dos exercicios do treino porque o endpoint mobile nao fornece.
  - Duracao ja vem de tempo real na API, mas a UI ainda precisa comunicar melhor tempo/volume/tendencia.
- Conquistas:
  - Nao mostra progresso parcial real.
  - Nao ha filtro funcional por raridade; os chips sao apenas visuais.
- Perfil:
  - Editar perfil e Configuracoes desabilitados.
  - Sem streak.
  - Sem avatar real.
- Design Preview:
  - Rota temporaria.
- Explore:
  - Rota neutra preservada, fora da navegacao principal.

## Bugs e Riscos Encontrados

- `XPProgress` assume regra fixa de 500 XP por nivel no mobile; se backend mudar a regra, o componente pode ficar divergente.
- Mobile chama multiplos endpoints em Perfil/Home para compor dados. Funciona, mas aumenta pontos de falha e latencia.
- `apiClient` instancia `EXPO_PUBLIC_API_BASE_URL` no carregamento do modulo; mudancas em `.env` exigem restart do Expo.
- Backend e mobile ainda dependem de `userProfileId` via ambiente, sem autenticacao/autorizacao.
- Conquistas agora possuem seed oficial, mas ambientes precisam executar startup/migrations corretamente para receber o catalogo.
- Arquivo `API_AUDIT.md` do backend pode estar desatualizado em pontos de XP/conquistas/status/duracao.
- `preflight-options.txt` apareceu anteriormente como artefato de validacao temporaria no backend e deve ser classificado/removido se ainda existir no worktree.
- Textos com mojibake foram tratados na revisao de higiene; o risco passa a ser regressao em novas strings adicionadas sem checagem UTF-8.

## Debito Tecnico

### Backend

- Cobertura de testes ainda e pequena diante do numero de services, embora finalizacao e catalogo de conquistas ja tenham cobertura dedicada.
- Fakes de testes com muitos `NotImplementedException`, frageis para refatoracao.
- Falta testar `XpService` e `AchievementService` diretamente.
- Falta testar controllers de gamificacao.
- Falta politica configuravel de XP por evento.
- Falta contrato de progresso parcial de conquistas.
- Falta contrato de Guardiao/streak/feed de atividade.
- `DashboardController` legado pode ser mantido por compatibilidade, mas deve ser documentado como legado ou removido futuramente.

### Mobile

- Nao ha testes automatizados.
- Servicos repetem funcoes utilitarias de parsing (`getField`, `getString`, `getNumber`, `asObject`).
- `dashboardService`, `profileService`, `gamificationService`, `workoutExecutionService` fazem composicao manual de payloads com bastante duplicacao.
- Falta camada comum de cache/invalidadacao; recargas apos finalizar treino sao chamadas diretas em `Promise.all`.
- Falta centralizar mapeamento de erros de API.
- Componentes de formulario de treino poderiam ser extraidos para reaproveitamento.
- Componentes visuais repetidos foram identificados em `UI_AUDIT.md`.
- Alguns documentos ainda usam ASCII sem acentuacao por historico do projeto; isso nao bloqueia o produto, mas pode ser revisado em uma padronizacao futura.

## Problemas de UX

- Feedback especifico de XP/conquistas ganhas apos finalizar treino ja existe em modal simples; ainda falta refinamento visual/animacao.
- Conquistas tem filtro visual, mas nao filtram.
- Usuario nao consegue editar perfil/configuracoes.
- Usuario nao consegue revisar registros de peso/agua/sono nem excluir entradas incorretas.
- Novo treino e funcional, mas ainda basico para um fluxo de criacao mais guiado.
- Execucao de treino nao tem timer, descanso, atalhos ou resumo final persistente; o modal simples de conclusao ja cobre XP/nivel/conquistas.
- Estados vazios sao funcionais, mas ainda precisam de microcopy e acoes contextuais melhores.
- Guardiao e um elemento visual forte, mas ainda nao tem comportamento real, o que pode gerar expectativa falsa.

## Problemas de Arquitetura

- Falta um contrato mobile especifico para Perfil, causando composicao de multiplos endpoints no app.
- Falta um contrato mobile especifico para Conquistas com catalogo, desbloqueios, progresso parcial e resumo em uma chamada.
- Atualizacao pos-finalizacao e acoplada no service de execucao do mobile; um mecanismo de invalidacao central seria mais escalavel.
- Backend ainda mistura endpoints mobile-first e endpoints CRUD sem uma camada clara de "BFF mobile".
- Gamificacao e funcional, mas ainda nao tem politica configuravel de XP por evento.

## Componentes que Merecem Refatoracao

- `XPProgress`: remover suposicao fixa de 500 XP por nivel quando backend expuser total/atual/necessario explicitamente.
- `workoutExecutionService`: dividir carregamento, mutacoes de serie e finalizacao.
- `dashboardService`, `profileService`, `gamificationService`: extrair helpers de parsing comuns.
- `achievements.tsx`: extrair `AchievementCard`, `SummaryStat` e mapeamento de raridade.
- `workouts/[id]/execute.tsx`: extrair formulario de serie e linha de serie.
- Componentes visuais repetidos mapeados no `UI_AUDIT.md`: `ScreenScaffold`, `ScreenHeader`, `StateCard`, `StatusPill`, `StatTile`, `LabeledInput`, `FeedbackBanner`.
- Backend: extrair regras de gamificacao para politicas/estrategias testaveis.

## Oportunidades de Reutilizacao

- Criar utilitario `apiMapper` no mobile para `getField`, `getString`, `getNumber`, `getObject`.
- Criar hook generico para `loading/error/refetch`.
- Criar servico de invalidacao pos-mutacao para Home/Treinos/Historico/Perfil/Conquistas.
- Reaproveitar componentes de estado (`LoadingState`, `ErrorState`, `EmptyState`).
- Reaproveitar inputs de formulario e cards de estatistica.
- Backend pode compartilhar calculo de semana UTC e progresso percentual.
- Backend pode centralizar politica de nivel/XP para evitar divergencia com mobile.

## Testes Ausentes

### Backend

- `XpService`:
  - concede XP por treino.
  - nao duplica XP por mesmo treino.
  - atualiza `TotalXp` e `Level`.
- `AchievementService`:
  - desbloqueia conquistas por categoria.
  - nao duplica desbloqueio.
  - concede XP por conquista.
- Controllers de gamificacao:
  - XP de usuario inexistente.
  - catalogo de conquistas.
  - conquistas desbloqueadas.
- Weight/Water/Sleep:
  - validacoes e metas.
  - cenarios de usuario inexistente.
- Repositories:
  - projecoes mobile sem N+1.
- CORS:
  - teste de configuracao/policy pode ser documentado ou coberto por integracao.

Ja coberto no backend:

- Mobile Workouts: usuario inexistente e retorno valido.
- Mobile History: usuario inexistente e retorno valido.
- `WorkoutService.FinishAsync`: primeira finalizacao, segunda tentativa idempotente, rollback em falha e ausencia de duplicidade de XP/conquistas.
- Catalogo oficial de conquistas: quantidade inicial, IDs unicos e nomes unicos.

### Mobile

- Testes unitarios de services/mappers:
  - `dashboardService`
  - `profileService`
  - `gamificationService`
  - `workoutExecutionService`
- Testes de hooks:
  - loading/erro/sucesso.
  - refetch apos mutacoes.
- Testes de componentes:
  - `XPProgress`.
  - cards de conquistas.
- Testes de fluxos:
  - criar treino.
  - executar treino.
  - finalizar treino e atualizar telas.
  - acoes rapidas da Home.
- Testes de acessibilidade/responsividade web/mobile.

## Prioridades

### P0 - Antes do Polimento Visual

1. Remover ou classificar artefatos temporarios como `preflight-options.txt`, se ainda existirem no backend.
2. Manter `API_AUDIT.md` e `PROJECT_STATUS.md` sincronizados apos mudancas de backend/mobile.
3. Garantir que migrations e seed de conquistas sejam aplicados no ambiente local/novo.
4. Manter checagem de UTF-8/mojibake em novas strings do Mobile.

### P1 - Base para Polimento

1. Criar endpoints mobile agregados para Perfil e Conquistas.
2. Expor progresso parcial de conquistas.
3. Expor streak real.
4. Expor dados reais do Guardiao ou reduzir sua presenca ate existir contrato.
5. Refinar visualmente o modal pos-finalizacao com XP ganho e conquistas desbloqueadas.
6. Implementar filtros reais na tela Conquistas.
7. Extrair componentes repetidos e estados comuns no mobile.
8. Adicionar testes diretos para XP/conquistas no backend e services/hooks no Mobile.

### P2 - Polimento e Experiencia

1. Refinar microcopy e estados vazios.
2. Melhorar fluxo de criacao de treino.
3. Implementar edicao de perfil/configuracoes.
4. Adicionar historico detalhado de peso/agua/sono.
5. Melhorar execucao com timer/descanso.
6. Revisar responsividade fina em mobile real.
7. Adicionar icones oficiais a navegacao.

## Roadmap Recomendado para a Proxima Fase

### Fase 1 - Sincronizacao e Higiene

- Confirmar migrations `AddWorkoutStatus` e `AddWorkoutExecutionTime` em ambientes novos.
- Confirmar execucao do seed oficial de 11 conquistas.
- Atualizar documentos backend desatualizados.
- Classificar/remover artefatos temporarios.
- Manter checagem de encoding em novas strings.

### Fase 2 - Contratos Mobile de Polimento

- Criar endpoint mobile de Perfil.
- Criar endpoint mobile de Conquistas com resumo, catalogo, desbloqueios e progresso parcial.
- Criar endpoint/feed de atividade recente.
- Definir contrato do Guardiao ou reduzir fallback.
- Expor streak.

### Fase 3 - Refatoracao Mobile

- Extrair helpers de parsing de API.
- Extrair hooks/estados reutilizaveis.
- Refatorar componentes grandes de execucao de treino e conquistas.
- Criar estrategia de invalidacao pos-mutacao.
- Adicionar testes de services/hooks.

### Fase 4 - Polimento UX/UI

- Executar o roadmap do `UI_AUDIT.md`.
- Refinar layout, microcopy, estados vazios e feedbacks.
- Implementar filtros funcionais de conquistas.
- Refinar resumo pos-treino com XP/conquistas.
- Melhorar criacao/edicao de treino.
- Revisar responsividade em Web e dispositivo real.

## Conclusao

Os principais P0 de dominio identificados na auditoria anterior foram resolvidos na Forge API: status explicito, duracao real, finalizacao transacional/idempotente e seed de conquistas. A higiene de encoding/documentacao tambem foi revisada. O projeto esta mais perto de uma fase de polimento visual, desde que a equipe avance nos contratos de produto que ainda faltam para Guardiao, streaks, progresso parcial e refinamento do feedback pos-treino.
