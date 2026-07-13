# Forge Mobile - Project Status

Atualizado em: 13/07/2026

---

# Estado Atual

A fundacao visual do Forge esta implementada no app Expo Router, seguindo os documentos de marca e os tokens de `src/theme`.

As primeiras telas mobile-first foram criadas. A Home ja consome o endpoint mobile do dashboard via camada dedicada de API; as demais telas ainda usam dados mockados:

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

---

# Componentes Reutilizaveis

Componentes atuais:

- `Button`
- `Card`
- `MetricCard`
- `XPProgress`
- `BottomNavigation`

Exports centralizados em `src/components/index.ts`.

---

# Telas Implementadas

Home (`/`):

- Guardiao temporario com imagem mockada.
- XP e nivel.
- Acoes rapidas.
- Metricas do dia.
- Resumo semanal.
- Proximo treino.
- Conquista em progresso.
- Atividade recente.
- Integrada ao hook `useDashboard`, com estados de loading, erro e sucesso.
- Consumo centralizado em `src/api/apiClient.ts` e `src/services/dashboardService.ts`.

Configuracao de API:

- `EXPO_PUBLIC_API_BASE_URL`: base URL obrigatoria da API.
- `EXPO_PUBLIC_DASHBOARD_ENDPOINT`: endpoint opcional do dashboard; padrao atual: `/mobile/dashboard`.
- Campos ainda ausentes no endpoint usam fallback temporario marcado com TODO em `dashboardService.ts`.

Treinos (`/workouts`):

- Header com acao `Novo treino`.
- Card de treino em andamento.
- Lista mockada de treinos salvos.
- Estados visuais: disponivel, em andamento e concluido.

Historico (`/history`):

- Resumo de treinos, tempo total e volume semanal.
- Lista cronologica mockada dos ultimos treinos.

Conquistas (`/achievements`):

- Resumo de desbloqueadas, disponiveis e progresso geral.
- Filtros visuais por raridade.
- Lista mockada de conquistas com raridade, estado e progresso.

Perfil (`/profile`):

- Avatar temporario.
- Nome do usuario.
- Nivel e XP.
- Peso atual e inicial.
- Sequencia de treinos.
- Totais de treinos e conquistas.
- Botoes `Editar perfil` e `Configuracoes`.

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
- Web respondendo `200 OK` em `http://localhost:8082`.

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
