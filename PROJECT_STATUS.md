# Forge Mobile - Project Status

Atualizado em: 13/07/2026

---

# Estado Atual

A fundacao visual do Forge esta implementada no app Expo Router, seguindo os documentos de marca e os tokens de `src/theme`.

As primeiras telas mobile-first foram criadas. A Home, Treinos e Historico ja consomem endpoints mobile via camada dedicada de API; as demais telas ainda usam dados mockados:

- `/`: Home.
- `/workouts`: Treinos.
- `/history`: Historico.
- `/achievements`: Conquistas.
- `/profile`: Perfil.
- `/design-preview`: tela temporaria para validar componentes e tokens.

O app usa Expo Router com `Stack` sem header em `src/app/_layout.tsx`.

A navegacao principal usa uma bottom navigation propria em `src/components/navigation/BottomNavigation.tsx`, com links definitivos para:

- Home: `/`
- Treinos: `/workouts`
- Historico: `/history`
- Conquistas: `/achievements`
- Perfil: `/profile`

---

# Tema Visual

Tokens existentes em `src/theme`:

- `colors.ts`
- `typography.ts`
- `spacing.ts`
- `radius.ts`
- `borders.ts`
- `shadows.ts`
- `iconSizes.ts`
- `componentSizes.ts`
- `index.ts`

As telas novas usam apenas tokens do tema para cores, espacamentos, tipografia, bordas, radius e tamanhos estruturais.

Fontes:

- Tokens de tipografia usam Inter para texto e Sora para titulos/numeros.
- No Web, `src/global.css` carrega Inter e Sora e e importado em `src/app/_layout.tsx`.
- Em native, ainda nao ha arquivos de fonte bundled em `assets`; quando houver build nativo real, as fontes devem ser empacotadas via `expo-font`.

---

# Componentes Reutilizaveis

Componentes atuais:

- `Button`
- `Card`
- `MetricCard`
- `XPProgress`
- `BottomNavigation`

Exports centralizados em `src/components/index.ts`.

Observacao:

- Textos visiveis das telas e componentes foram revisados em portugues com acentuacao em UTF-8, sem alterar nomes de propriedades da API, rotas ou identificadores internos.

---

# Telas Implementadas

Home (`/`):

- Guardiao temporario com imagem mockada e card principal refinado visualmente.
- Card do Guardiao ajustado para melhor aproveitamento de espaco no Web/mobile.
- XP e nivel.
- Acoes rapidas com cards mais destacados.
- Metricas do dia com melhor proporcao e espacamento.
- Resumo semanal com hierarquia visual reforcada.
- Proximo treino.
- Conquista em progresso.
- Atividade recente.
- Integrada ao hook `useDashboard`, com estados de loading, erro e sucesso.
- Consumo centralizado em `src/api/apiClient.ts` e `src/services/dashboardService.ts`.
- Refinamento visual aplicado sem alterar services, hooks ou contratos da API.
- Bottom navigation mantida como unica barra fixa, com z-index/elevation para evitar duplicidade visual/empilhamento no Web.
- Diferenca de peso normalizada com arredondamento e formato pt-BR antes da exibicao.

Configuracao de API:

- `EXPO_PUBLIC_API_BASE_URL`: base URL obrigatoria da API.
- `EXPO_PUBLIC_API_BASE_URL` pode ser informado com ou sem `/api`; o `apiClient` normaliza para incluir `/api`.
- `EXPO_PUBLIC_USER_PROFILE_ID`: perfil usado para montar as rotas mobile por usuario.
- `EXPO_PUBLIC_DASHBOARD_ENDPOINT`: endpoint opcional da Home; padrao atual: `/mobile/users/{EXPO_PUBLIC_USER_PROFILE_ID}/home`.
- Campos ainda ausentes no endpoint usam fallback temporario marcado com TODO em `dashboardService.ts`.
- Se `EXPO_PUBLIC_USER_PROFILE_ID` nao for exportado pelo Expo, a Home falha antes de chamar `fetch`; nesse caso nenhuma requisicao aparece no Network.
- Apos alterar `.env`, reiniciar o servidor Expo para que as variaveis `EXPO_PUBLIC_*` sejam rebundladas.

Treinos (`/workouts`):

- Header com acao `Novo treino`.
- Card de treino do dia/em andamento destacado quando a API retornar `activeWorkout`.
- Lista de treinos salvos vinda da API.
- Cada card exibe nome, grupos musculares, duracao estimada e quantidade de exercicios.
- Botoes `Iniciar treino` no destaque e nos cards de treino.
- Botao `Novo treino` cria um treino real via `POST /api/workouts` usando `EXPO_PUBLIC_USER_PROFILE_ID`.
- Botoes `Iniciar treino` abrem `/workouts/{id}` usando o ID real retornado pela API.
- Tela `/workouts/[id]` carrega o treino selecionado via `GET /api/workouts/{id}`.
- Estados visuais: disponivel, em andamento e concluido.
- Integrada ao hook `useWorkouts`, com estados de loading, erro, vazio e sucesso.
- Consumo centralizado em `src/api/apiClient.ts` e `src/services/workoutsService.ts`.
- Service de Treinos resolve variaveis de ambiente no momento da chamada, consistente com a Home.
- `apiClient` possui suporte a `POST` para fluxos de criacao.

Configuracao de API para Treinos:

- `EXPO_PUBLIC_USER_PROFILE_ID`: perfil usado para montar as rotas mobile por usuario.
- `EXPO_PUBLIC_WORKOUTS_ENDPOINT`: endpoint opcional de Treinos; padrao atual: `/mobile/users/{EXPO_PUBLIC_USER_PROFILE_ID}/workouts`.
- Nao ha campos mockados na tela Treinos; a duracao estimada vem do endpoint mobile.
- O detalhe de treino usa a rota existente `/api/workouts/{id}`; campos nao presentes nesse contrato nao sao mockados.

Historico (`/history`):

- Resumo de treinos, tempo total e volume semanal.
- Lista cronologica dos ultimos treinos vinda da API.
- Integrada ao hook `useHistory`, com estados de loading, erro, vazio e sucesso.
- Consumo centralizado em `src/api/apiClient.ts` e `src/services/historyService.ts`.

Configuracao de API para Historico:

- `EXPO_PUBLIC_USER_PROFILE_ID`: perfil usado para montar as rotas mobile por usuario.
- `EXPO_PUBLIC_HISTORY_ENDPOINT`: endpoint opcional de Historico; padrao atual: `/mobile/users/{EXPO_PUBLIC_USER_PROFILE_ID}/history?page=1&pageSize=20`.
- Nao ha campos mockados na tela Historico; nomes de exercicios nao existem no contrato atual, entao a UI mostra a quantidade de exercicios registrada pela API.

Conquistas (`/achievements`):

- Resumo de desbloqueadas, disponiveis e progresso geral.
- Filtros visuais por raridade.
- Lista mockada de conquistas com raridade, estado e progresso.

Perfil (`/profile`):

- Avatar textual com iniciais derivadas do nome real retornado pela API.
- Nome, email, nivel, XP, peso atual, peso inicial e data de criacao vindos da API.
- Metas reais do perfil: treinos semanais, agua diaria e sono diario.
- Estatisticas gerais exibidas conforme a API fornece: treinos, treinos na semana, tempo total, volume semanal e volume total.
- Integrada ao hook `useProfile`, com estados de loading, erro, vazio e sucesso.
- Consumo centralizado em `src/api/apiClient.ts` e `src/services/profileService.ts`.
- Sem campos mockados; dados ausentes nos contratos atuais nao sao inventados.
- Botoes `Editar perfil` e `Configuracoes` preservados visualmente, desabilitados ate existirem fluxos reais.

Configuracao de API para Perfil:

- `EXPO_PUBLIC_USER_PROFILE_ID`: perfil usado para buscar os dados do usuario.
- Endpoint principal: `GET /api/user-profiles/{EXPO_PUBLIC_USER_PROFILE_ID}`.
- Dados auxiliares reais: `GET /api/mobile/users/{EXPO_PUBLIC_USER_PROFILE_ID}/home` e `GET /api/mobile/users/{EXPO_PUBLIC_USER_PROFILE_ID}/history?page=1&pageSize=1`.

Design Preview (`/design-preview`):

- Tela temporaria para validar `Button`, `Card`, `MetricCard`, `XPProgress` e tokens principais.

---

# Assets

Asset temporario criado:

- `assets/images/guardian-placeholder.png`

Uso atual:

- Guardiao da Home.
- Avatar temporario do Perfil.

---

# Validacoes

Ultimos comandos executados em 13/07/2026:

```txt
npx.cmd tsc --noEmit
npm.cmd run lint
npm.cmd run web -- --port 8082
```

Resultados da ultima validacao:

- TypeScript sem erros.
- Lint sem erros.
- Web respondendo `200 OK` em `http://localhost:8082/workouts`.
- Web respondendo `200 OK` em `http://localhost:8082/workouts/test-workout-id`, validando a rota dinamica de treino.
- Web respondendo `200 OK` em `http://localhost:8082/profile`.

Observacao da validacao da API:

- A rota real inspecionada na Forge API e `GET /api/mobile/users/{userProfileId}/home`.
- O app nao deve mais chamar `/mobile/dashboard`.
- Diagnostico da Home sem requisicao: no ambiente validado, o Expo carregou `.env` exportando apenas `EXPO_PUBLIC_API_BASE_URL`, sem `EXPO_PUBLIC_USER_PROFILE_ID`.
- A validacao HTTPS direta no ambiente Codex nao completou por handshake TLS/local sandbox, mesmo com a API subindo em `https://localhost:7170`; validar no navegador local com certificado dev confiavel e `EXPO_PUBLIC_USER_PROFILE_ID` preenchido.

Rotas principais:

- `http://localhost:8082`
- `http://localhost:8082/workouts`
- `http://localhost:8082/history`
- `http://localhost:8082/achievements`
- `http://localhost:8082/profile`
- `http://localhost:8082/design-preview`

Rotas auxiliares preservadas:

- `http://localhost:8082/explore`

Observacao:

- `/explore` nao faz parte da bottom navigation principal e foi mantida como rota neutra para experimentos futuros.

---

# Proximos Passos

- Refinar visual das telas em dispositivo real.
- Implementar icones oficiais da bottom navigation.
- Definir fluxos reais de criacao/edicao.
- Completar o contrato real do endpoint mobile e remover fallbacks TODO do dashboard.
- Integrar API nas demais telas apos estabilizar layout e contratos.
