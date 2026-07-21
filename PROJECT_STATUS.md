# Forge Mobile - Project Status

Atualizado em: 21/07/2026

## Ajustes Visuais Pontuais - 21/07/2026

- Perfil: tela refatorada para a composicao "Sua forja", com card principal de usuario, XP/nivel, card de evolucao, metas, estatisticas gerais e acoes preservadas.
- Graficos: criada a rota `/profile/charts`, acessada por "Ver graficos" no Perfil, com filtros locais de periodo e metrica.
- Arquivos impactados nesta etapa: `src/app/profile.tsx`, `src/app/profile/charts.tsx`, `src/services/profileService.ts`, `src/components/charts/SimpleLineChart.tsx` e `src/components/index.ts`.
- Metricas implementadas com dados reais: peso, volume, treinos, agua e sono.
- Fontes reais reutilizadas: `GET /api/user-profiles/{userProfileId}`, `GET /api/user-profiles/{userProfileId}/xp`, `GET /api/mobile/users/{userProfileId}/home`, `GET /api/mobile/users/{userProfileId}/history`, `GET /api/user-profiles/{userProfileId}/weight-records`, `GET /api/user-profiles/{userProfileId}/water-intakes` e `GET /api/user-profiles/{userProfileId}/sleep-records`.
- Graficos usam o componente proprio `SimpleLineChart`, implementado com React Native `View`/`Pressable`, sem instalar nova dependencia e sem imagem estatica.
- Limitacoes atuais: sequencia atual e recorde pessoal ainda nao possuem contrato confiavel no Mobile e sao exibidos como `--`; "Ver historico completo" fica ativo apenas para metricas que podem reutilizar `/history`.
- Pendencias: quando a API expuser streak/recorde pessoal e historicos especificos completos por habito, conectar esses campos sem alterar a composicao visual.
- Proximos passos: validar em dispositivo real Android/iOS e revisar densidade dos graficos com bases maiores de registros.
- Conquistas: os cards passam a exibir progresso no formato numerico direto, sem unidade textual apos a contagem, preservando os mesmos valores e a mesma regra visual de progresso.
- Historico: removido o botao visual de calendario do canto superior direito, deixando titulo e descricao ocuparem toda a largura disponivel.
- Navegacao inferior: itens padronizados com largura uniforme, icone centralizado e texto alinhado exatamente abaixo do icone, sem deslocamentos assimetricos.
- Refinamento da Bottom Navigation: cada item usa `flex: 1`, `flexBasis: 0`, `alignItems: center` e `justifyContent: center`; o slot do icone ocupa 100% da largura do item para manter Home, Treinos, Historico, Conquistas e Perfil simetricos mesmo com labels de tamanhos diferentes.
- Arquivo impactado no refinamento: `src/components/navigation/BottomNavigation.tsx`.
- Correcao estrutural complementar: removidos `maxWidth` do container e padding horizontal do wrapper da Bottom Navigation, que faziam os cinco itens serem distribuidos em uma largura limitada em vez de ocuparem 20% da barra. A estrutura interna agora e `Pressable > View itemContent > iconSlot + Text`, com alinhamento central uniforme.
- Causa raiz do desalinhamento remanescente: no Expo Web, o estilo funcional do `Pressable` nao era materializado no anchor durante a renderizacao, deixando os itens sem `flex: 1` efetivo; o estilo passou a ser aplicado diretamente no item.
- Validacao: Expo Web respondeu em `/history` e o HTML renderizado confirmou os cinco itens da Bottom Navigation com `flex: 1`, `flex-basis: 0px`, `align-items: center`, `justify-content: center` e labels centralizadas.
- Nenhuma rota, URL, endpoint, configuracao, contrato de API ou regra de negocio foi alterada.

## Ordenacao Manual por Setas em Treinos e Exercicios - 20/07/2026

Decisao de produto registrada: ordenacoes manuais no Forge devem usar controles de seta para cima e para baixo. Drag and drop nao deve ser usado salvo decisao futura explicita.

Implementacao:

- Componente reutilizavel criado: `src/components/controls/OrderControls.tsx`.
- Export centralizado em `src/components/index.ts`.
- O componente recebe `onMoveUp`, `onMoveDown`, `canMoveUp`, `canMoveDown`, `disabled`, `loading` opcional e `style`.
- Areas de toque seguem o minimo global de 48x48.
- Estados desabilitados reduzem opacidade e impedem clique/toque.

Uso atual:

- `/workouts/new`: a secao "Ordem do treino" usa `OrderControls` para reordenar exercicios selecionados.
- `/workouts`: os cards de "Treinos salvos" usam `OrderControls` para mover templates uma posicao por clique.
- A primeira seta para cima fica desabilitada no primeiro item.
- A ultima seta para baixo fica desabilitada no ultimo item.
- Nao ha drag handle, long press, `PanResponder` ou eventos de drag nesse fluxo.

Persistencia:

- A ordem dos exercicios e preservada no array local e enviada ao salvar o treino.
- A ordem dos treinos salvos e atualizada otimisticamente no Mobile e persistida em lote por `PUT /api/workouts/reorder`.
- Em erro de reordenacao de treinos, o hook restaura a ordem anterior e mostra mensagem unica.
- Durante a persistencia, controles de ordenacao de treinos ficam desabilitados para evitar requisicoes simultaneas.

UX de treinos salvos:

- Cards compactos e expansivos foram preservados.
- Controles de ordenacao ficam no card recolhido junto de nome/resumo, status e chevron.
- Expandir/recolher continua independente da ordenacao.
- Ao salvar treino novo, a tela retorna para `/workouts?saved=1` e mostra "Treino salvo com sucesso.".
- Treinos novos aparecem no final porque a API atribui o proximo `DisplayOrder`.

Documentacao:

- `FRONTEND_GUIDELINES.md` registra o padrao oficial de ordenacao manual por setas.

Validacao recente:

- `npx.cmd tsc --noEmit`: sucesso.
- `npm.cmd run lint`: sucesso.
- Expo Web respondeu HTTP 200 em `/workouts`.
- Validacao API local confirmou criacao de terceiro treino no fim da lista e persistencia da movimentacao do terceiro para a primeira posicao via `PUT /api/workouts/reorder`.

## Treinos Salvos: Cards Expansiveis, Edicao e Exclusao Segura - 17/07/2026

- A tela `/workouts` passou a listar "Treinos salvos" em cards compactos e expansíveis.
- O estado fechado exibe nome, resumo curto de grupos musculares, quantidade real de exercícios, duração somente quando a API retorna valor útil, status e chevron.
- Apenas um card salvo fica expandido por vez; o toque no card alterna expandir/recolher com animação discreta via `LayoutAnimation`.
- O estado expandido carrega os exercícios vinculados por `/api/workouts/{workoutId}/exercises` e cruza com `/api/mobile/exercises` para exibir nomes e grupos reais.
- O card expandido oferece ações de iniciar, editar e excluir; botões ficam desabilitados durante requisições.
- "Iniciar treino" agora chama `POST /api/workouts/{id}/start` antes de navegar. Quando o backend cria uma execução a partir de um template, o app navega para o ID da execução retornada.
- A edição reutiliza `/workouts/new` com `workoutId` na rota, pré-carrega nome e exercícios na ordem atual, permite adicionar/remover/reordenar e retorna para a lista após salvar.
- O seletor do gerenciador de treinos considera somente templates salvos disponíveis; treino em andamento não aparece como opção editável.
- A exclusão abre confirmação com o nome do treino e explica que execuções concluídas, séries, cargas, XP e histórico são preservados.
- Após excluir, o template sai da lista local sem recarregar a página inteira; o backend arquiva o template em vez de apagar fisicamente.

Contratos usados:

- `GET /api/mobile/users/{userProfileId}/workouts`;
- `GET /api/workouts/{id}`;
- `PUT /api/workouts/{id}`;
- `DELETE /api/workouts/{id}`;
- `POST /api/workouts/{id}/start`;
- `GET /api/workouts/{workoutId}/exercises`;
- `POST /api/workouts/{workoutId}/exercises`;
- `DELETE /api/workouts/{workoutId}/exercises/{id}`;
- `GET /api/mobile/exercises`;
- `GET /api/mobile/muscle-groups`.

Regra de historico:

- Excluir um treino salvo/template não apaga histórico.
- Execuções concluídas continuam aparecendo no Histórico porque são linhas próprias de `Workout` com `Status = Completed`.
- Templates arquivados não aparecem mais em "Treinos salvos" e não podem ser iniciados novamente.

Arquivos alterados nesta etapa:

- `src/app/workouts.tsx`;
- `src/app/workouts/new.tsx`;
- `src/hooks/useWorkouts.ts`;
- `src/services/workoutsService.ts`;
- `src/services/workoutBuilderService.ts`.

Validação:

- `npx.cmd tsc --noEmit`: sucesso.
- `npm.cmd run lint`: sucesso.
- O projeto Mobile ainda não possui script de teste automatizado no `package.json`; a cobertura desta etapa ficou concentrada em validação TypeScript/lint e testes da API.

## Guardiao Dinamico na Home - 16/07/2026

- A Home deixou de usar imagem fixa do Guardiao como fonte principal.
- `dashboardService.ts` agora mapeia `guardianImageUrl` retornado por `GET /api/mobile/users/{userProfileId}/home`.
- URLs absolutas sao usadas diretamente; URLs relativas sao resolvidas contra `EXPO_PUBLIC_API_BASE_URL`, removendo `/api` quando necessario.
- `HomeHero` usa `Image` do React Native com `source={{ uri }}` quando a API retorna imagem.
- Enquanto a imagem remota carrega, a Hero exibe placeholder discreto.
- `assets/images/guardian-placeholder.png` permanece apenas como fallback quando nao existe imagem cadastrada ou quando a URL remota falha.
- Alteracoes feitas no Backoffice em `GuardianImageUrl` passam a refletir na Home sem alteracao de codigo, apos recarregar os dados da Home.

Validacao:

- `npx.cmd tsc --noEmit`: sucesso.
- `npm.cmd run lint`: sucesso.
- Forge.Api validada sem alteracoes nesta tarefa:
  - `dotnet build Forge.slnx -p:BaseOutputPath=C:\Forge\artifacts\codex-bin\ -p:UseSharedCompilation=false`: sucesso.
  - `dotnet test Forge.slnx -p:BaseOutputPath=C:\Forge\artifacts\codex-test-bin\ -p:UseSharedCompilation=false`: 96 testes aprovados.

---

# Auditoria de Preparacao para Polimento

Auditoria completa de Backend + Mobile criada em `PROJECT_AUDIT.md`.
Auditoria visual completa do Mobile criada em `UI_AUDIT.md`.

Resumo da auditoria:

- O nucleo funcional esta integrado: Home, Treinos, Historico, Perfil e Conquistas consomem API real.
- O fluxo de criar, executar e finalizar treino funciona usando endpoints reais.
- XP e conquistas reais estao integrados ao Mobile.
- A Forge API ja possui status explicito de treino, duracao real, finalizacao transacional/idempotente e seed oficial de conquistas.
- A fase de refinamento visual deve comecar pelos achados P1 de `UI_AUDIT.md`; o P0 de encoding foi tratado nesta revisao de higiene.
- Antes do polimento visual, prioridades tecnicas recomendadas:
  - manter a confirmacao de migrations/seed da API em ambientes novos;
  - testes para XP, conquistas e services/hooks mobile;
  - contrato real para Guardiao, streaks e progresso parcial de conquistas.

---

# Estado Atual

A fundacao visual do Forge esta implementada no app Expo Router, seguindo os documentos de marca e os tokens de `src/theme`.

As primeiras telas mobile-first foram criadas. A Home, Treinos, Historico, Conquistas e Perfil ja consomem endpoints reais via camada dedicada de API; telas auxiliares seguem focadas em validacao visual:

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

- Tokens de tipografia usam Inter para interface, textos, valores, botoes, formularios, cards e navegacao.
- Tokens de identidade/gamificacao usam Cinzel com moderacao para logo/nome FORGE, titulos especiais, Guardiao, nivel, rank e conquistas.
- Fontes carregadas pelo mecanismo oficial `expo-font` em `src/app/_layout.tsx` usando `@expo-google-fonts/inter` e `@expo-google-fonts/cinzel`.
- Pesos carregados:
  - Inter: 400, 500, 600, 700 e 800.
  - Cinzel: 600, 700 e 800.
- Tokens oficiais de tipografia:
  - `typography.display`;
  - `typography.screenTitle`;
  - `typography.sectionTitle`;
  - `typography.cardTitle`;
  - `typography.body.default`;
  - `typography.body.secondary`;
  - `typography.label`;
  - `typography.metric.highlight`;
  - `typography.metric.compact`;
  - `typography.button`;
  - `typography.navigation`;
  - `typography.gamification.level`;
  - `typography.gamification.xp`.
- No Web, `src/global.css` tambem importa Inter e Cinzel como apoio.
- Enquanto as fontes carregam, o layout raiz preserva fallback seguro antes de renderizar as telas.
- Excecao tecnica: `ThemedText` mantem fonte monoespacada apenas para o tipo `code`.

---

# Componentes Reutilizaveis

Componentes atuais:

- `Button`
- `Card`
- `MetricCard`
- `XPProgress`
- `BottomNavigation`
- `HomeHeader`
- `HomeHero`
- `TodayWorkoutCard`
- `QuickActions`
- `WeeklyProgress`
- `ForgeSymbol`

Exports centralizados em `src/components/index.ts`.

Observacao:

- Textos visiveis das telas e componentes foram revisados em portugues com acentuacao em UTF-8, sem alterar nomes de propriedades da API, rotas ou identificadores internos.
- Revisao de higiene de 14/07/2026 confirmou ausencia de mojibake real em `src`; a unica ocorrencia restante era uma anotacao documental na auditoria visual e foi atualizada.

---

# Telas Implementadas

Home (`/`):

- Guardiao carregado dinamicamente a partir de `guardianImageUrl` retornado pelo endpoint mobile da Home.
- A Hero usa `Image` do React Native com URL remota quando disponivel, placeholder discreto durante carregamento e `guardian-placeholder.png` apenas como fallback quando nao ha imagem cadastrada ou quando a URL falha.
- Topo da Home reorganizado como Hero sobre o fundo preto da tela, mantendo logo/cabecalho, data, status do Guardiao, saudacao, frase motivacional, Guardiao, nivel, XP, barra de progresso e XP restante.
- Hero exibe nivel atual, XP do nivel atual / XP necessario, barra de progresso e texto de XP restante.
- Botao `Iniciar treino` removido da Hero para evitar disputa de espaco no mobile.
- Guardiao posicionado com mais destaque a direita, integrado ao fundo com efeitos sutis usando tokens existentes.
- Nome do usuario, XP, nivel, peso, agua, sono, volume, progresso semanal e treino em andamento vindos do endpoint mobile real.
- Proximo treino usa `activeWorkout` real; duracao e derivada da quantidade real de exercicios quando o endpoint nao envia duracao textual.
- A API ja retorna duracao real para treino em andamento quando ha `StartedAt`; manter fallback apenas para compatibilidade com payloads antigos.
- Atividade recente deixou de usar itens mockados e agora e derivada de treino em andamento, agua, sono e peso retornados pela API.
- Acoes rapidas com cards mais destacados.
- Acoes rapidas integradas a API real:
  - Peso: `POST /api/user-profiles/{EXPO_PUBLIC_USER_PROFILE_ID}/weight-records`.
  - Agua: `POST /api/user-profiles/{EXPO_PUBLIC_USER_PROFILE_ID}/water-intakes`.
  - Sono: `POST /api/user-profiles/{EXPO_PUBLIC_USER_PROFILE_ID}/sleep-records`.
- Acoes rapidas abrem modal simples com validacao, loading, erro e confirmacao.
- Apos registrar uma acao rapida, a Home recarrega automaticamente via `useDashboard`.
- Card `Treino de hoje` ocupa 100% da largura e usa o proximo treino/treino ativo real retornado pela Home.
- `Acoes rapidas` usa quatro cards compactos em linha, reaproveitando as acoes reais disponiveis de peso, agua e sono e mantendo o primeiro card visual de treino sem criar fluxo novo.
- Card `Progresso da semana` ocupa 100% da largura, usa o progresso semanal real de treinos e inclui frase motivacional derivada de dados reais de conquista.
- Blocos antigos removidos da Home mobile atual: `Visao do dia`, `Resumo semanal`, `Atividade recente` e grid antigo de metricas.
- Integrada ao hook `useDashboard`, com estados de loading, erro e sucesso.
- Consumo centralizado em `src/api/apiClient.ts` e `src/services/dashboardService.ts`.
- Registro das acoes rapidas centralizado em `src/services/quickActionsService.ts` e `src/hooks/useQuickActions.ts`.
- Refinamento visual aplicado sem alterar services, hooks ou contratos da API.
- Bottom navigation mantida como unica barra fixa, com z-index/elevation para evitar duplicidade visual/empilhamento no Web.
- Diferenca de peso normalizada com arredondamento e formato pt-BR antes da exibicao.
- Auditoria de dados da Home:
  - Dados reais: usuario, gamificacao recebida da API, conquistas desbloqueadas, peso atual/diferenca, agua do dia/meta, sono recente/meta, progresso semanal, volume semanal, treino em andamento e registros das acoes rapidas.
  - Dados derivados localmente de dados reais: rotulo do dia, status textual do Guardiao, fallback de duracao para payloads antigos e atividade recente.
  - Mock restante: identidade/status especifico do Guardiao ainda usa fallback textual derivado da Home.
  - Pendencias da API: identidade/status real do Guardiao e feed dedicado de atividade recente.
- Sprint Home iniciada em 14/07/2026 com refinamento estrutural sem alterar integracoes:
  - espacamento geral da tela e respiro do header revisados;
  - area do Guardiao ganhou proporcao mais dominante e pequenos ajustes de posicionamento;
  - secoes de acoes rapidas e visao do dia receberam cabecalhos secundarios e melhor alinhamento;
  - cards de acoes rapidas e metricas ganharam alturas mais padronizadas;
  - resumo semanal, proximo treino e conquista foram reorganizados em grid responsivo para melhorar hierarquia;
  - atividade recente recebeu card com mais profundidade e linhas com alinhamento mais limpo;
  - dados, hooks, services, rotas e contratos da API foram preservados.
- Refinamento da Hero da Home em 14/07/2026:
  - removido o card que envolvia Guardiao, nivel, XP e botao;
  - removidos os blocos separados de `XP atual` e `Proximo nivel`;
  - mantidos dados reais, imagem temporaria do Guardiao e integracoes atuais;
  - cards e secoes abaixo da Hero preservados.
- Correcao responsiva mobile da Home em 14/07/2026:
  - Hero ajustada para layout em coluna no mobile, evitando sobreposicao entre texto e Guardiao em larguras de 360 a 430 px;
  - Guardiao deixou de usar posicionamento absoluto no mobile e passou a ocupar fluxo proprio dentro da Hero;
  - bloco `Visao do dia` foi removido da Home mobile atual para seguir a referencia;
  - resumo semanal, treino atual, conquista e atividade recente ocupam 100% da largura no mobile;
  - larguras fixas incompatíveis com celular foram removidas da Hero e dos progressos;
  - padding inferior aumentado para a bottom navigation fixa nao cobrir o final do conteudo;
  - layout Web permanece centralizado e limitado.
- Refatoracao da Home conforme referencia visual em 14/07/2026:
  - Web larga passa a manter largura maxima mobile, sem virar dashboard desktop;
  - Logo/cabecalho adicionado acima da Hero;
  - Hero simplificada para data, status, saudacao do Guardiao, subtitulo, Guardiao, nivel, XP e barra;
  - `Treino de hoje`, `Acoes rapidas` e `Progresso da semana` viraram as secoes principais abaixo da Hero;
  - grids/colunas antigos foram removidos da renderizacao da Home;
  - dados reais, hooks, services, integracoes e backend foram preservados.
- Reconstrucao visual da Home pela referencia `docs/references/home-mobile-reference.png` em 14/07/2026:
  - composicao visual antiga da Home foi substituida por componentes dedicados `HomeHeader`, `HomeHero`, `TodayWorkoutCard`, `QuickActions` e `WeeklyProgress`;
  - Hero ficou sem card, com Guardiao temporario a direita, data, status, saudacao, subtitulo, nivel, XP, barra e XP restante;
  - cards principais permanecem em largura total dentro de uma largura maxima mobile tambem no Web;
  - quatro acoes rapidas foram mantidas em uma unica linha, usando dados/acoes reais ja disponiveis;
  - `BottomNavigation` passou a usar icones via `expo-symbols`, biblioteca ja presente no projeto;
  - nenhum hook, service, contrato de API ou backend foi alterado.
- Ajustes visuais pontuais da Home em 14/07/2026:
  - card `Treino de hoje` corrigido para o estado vazio `Nenhum treino em andamento`, preservando quebra por palavras e usando a largura disponivel do card;
  - icones de treino e acoes rapidas ganharam tamanho maior, cor primaria e peso visual mais consistente;
  - acoes rapidas usam equivalentes premium da biblioteca atual: treino, peso, agua e sono;
  - `BottomNavigation` foi realinhada para uma estrutura unica por item: icone centralizado acima do texto centralizado;
  - Hero, hooks, services, contratos de API, backend e dados reais foram preservados.
- Novo padrao visual oficial da Home em 15/07/2026:
  - containers externos de secao foram removidos de `Treino de hoje`, `Acoes rapidas` e `Progresso da semana`;
  - titulos de secao passaram a ficar diretamente sobre o fundo da tela, fora de cards;
  - cada bloco mantem apenas um nivel de card, evitando `card dentro de card`;
  - `Progresso da semana` manteve a frase motivacional dentro do mesmo card, separada por divisor sutil em vez de card interno;
  - o ritmo vertical entre secoes foi ampliado para dar mais respiro e hierarquia;
  - hooks, services, navegacao, dados reais e contratos da API foram preservados.

Configuracao de API:

- `EXPO_PUBLIC_API_BASE_URL`: base URL obrigatoria da API.
- `EXPO_PUBLIC_API_BASE_URL` pode ser informado com ou sem `/api`; o `apiClient` normaliza para incluir `/api`.
- `EXPO_PUBLIC_USER_PROFILE_ID`: perfil usado para montar as rotas mobile por usuario.
- `EXPO_PUBLIC_DASHBOARD_ENDPOINT`: endpoint opcional da Home; padrao atual: `/mobile/users/{EXPO_PUBLIC_USER_PROFILE_ID}/home`.
- Campos ainda ausentes no endpoint usam fallback especifico marcado com TODO em `dashboardService.ts`; valores numericos antigos de mock foram removidos.
- Se `EXPO_PUBLIC_USER_PROFILE_ID` nao for exportado pelo Expo, a Home falha antes de chamar `fetch`; nesse caso nenhuma requisicao aparece no Network.
- Apos alterar `.env`, reiniciar o servidor Expo para que as variaveis `EXPO_PUBLIC_*` sejam rebundladas.

Treinos (`/workouts`):

- Header com acao `Novo treino`.
- Card de treino do dia/em andamento destacado quando a API retornar `activeWorkout`.
- Lista de treinos salvos vinda da API.
- Cada card exibe nome, grupos musculares, duracao e quantidade de exercicios.
- Botoes `Iniciar treino` no destaque e nos cards de treino.
- Botao `Novo treino` cria um treino real via `POST /api/workouts` usando `EXPO_PUBLIC_USER_PROFILE_ID`.
- Fluxo `/workouts/new` foi refatorado como gerenciador completo de treinos:
  - combobox pesquisavel para selecionar treino existente ou iniciar criacao de novo treino;
  - cada treino existente exibe nome, grupos musculares e quantidade de exercicios;
  - selecao de treino existente carrega automaticamente exercicios vinculados por `GET /api/workouts/{workoutId}/exercises`;
  - edicao permite adicionar, remover e reordenar exercicios;
  - criacao de novo treino exige nome, grupos musculares e exercicios selecionados;
  - catalogo lista exercicios globais e customizados disponiveis para o usuario via `GET /api/exercises`;
  - busca por exercicio e filtros rapidos por grupo muscular foram adicionados;
  - filtro `Favoritos` existe na UI para preparar o fluxo, mas permanece vazio enquanto a API nao expuser favorito real;
  - contadores exibem exercicios encontrados e quantidade selecionada;
  - reordenacao foi implementada por controles de subir/descer e suporte a drag-and-drop no Web;
  - resumo antes de salvar mostra nome, grupos, quantidade e lista ordenada dos exercicios;
  - salvar criacao usa `POST /api/workouts` e `POST /api/workouts/{workoutId}/exercises`;
  - salvar edicao usa `PUT /api/workouts/{workoutId}`, remove vinculos antigos com `DELETE /api/workouts/{workoutId}/exercises/{workoutExerciseId}` e recria a sequencia com `POST /api/workouts/{workoutId}/exercises`;
  - placeholders temporarios de imagem foram adicionados para cada exercicio, com estrutura `ExerciseMedia` preparada para futura substituicao por imagem, GIF, video curto ou animacao demonstrativa.
  - simplificacao de fluxo aplicada em 15/07/2026:
    - o seletor `Selecionar ou criar treino` aparece apenas na tela inicial;
    - apos escolher `Criar novo treino`, a tela entra diretamente em `Criar treino`, iniciando por nome, grupos musculares e exercicios;
    - apos escolher um treino existente, a tela entra diretamente em `Editar treino`, iniciando pelo formulario de edicao;
    - a troca de contexto passou a ser feita por uma acao discreta `Trocar treino`, sem manter o combobox permanentemente na tela;
    - funcionalidades de criacao, edicao, busca, filtros, reordenacao e salvamento foram preservadas.
  - grupos musculares oficiais integrados em 15/07/2026:
    - o fluxo oficial de criacao passa a ser nome do treino -> selecao de grupos musculares -> busca/selecao de exercicios -> organizacao da ordem -> salvar;
    - a tela consome `GET /api/mobile/muscle-groups` via `workoutBuilderService` e `useWorkoutBuilder`;
    - chips de grupos musculares deixaram de ser lista fixa no cliente e agora usam IDs/display names reais vindos da API;
    - catalogo de exercicios passou a usar `GET /api/mobile/exercises`, incluindo `muscleGroupId` e `muscleGroupDisplayName`;
    - filtros rapidos de exercicios sao derivados dos grupos recebidos da API;
    - criacao e edicao preservam busca, selecao multipla, reordenacao e resumo antes de salvar;
    - ao editar treino existente, os grupos selecionados sao reconstruidos pelos exercicios vinculados quando possivel, com fallback para labels antigos do agregador mobile.
- Botoes `Iniciar treino` abrem `/workouts/{id}` usando o ID real retornado pela API.
- Tela `/workouts/[id]` carrega o treino selecionado via `GET /api/workouts/{id}`.
- Tela `/workouts/[id]/execute` executa o treino com exercícios e séries reais da API.
- Execução permite navegar entre exercícios, registrar séries existentes via `PUT /api/workout-sets/{id}` e criar novas séries via `POST /api/workout-exercises/{workoutExerciseId}/sets`.
- Execucao permite editar e excluir series registradas usando `PUT /api/workout-sets/{id}` e `DELETE /api/workout-sets/{id}`.
- Execucao bloqueia criacao, edicao, exclusao e finalizacao quando o status mobile do treino e `completed`.
- Finalização usa `POST /api/workouts/{id}/finish` e força recarga dos dados reais de Home, Treinos, Histórico, Perfil e Conquistas após sucesso.
- Apos finalizar com sucesso, a tela exibe modal de conclusao antes de navegar para Historico.
- Modal de conclusao usa dados reais da API comparando gamificacao antes/depois da finalizacao:
  - XP ganho;
  - XP total;
  - nivel anterior e novo nivel;
  - conquistas desbloqueadas nesta finalizacao, ocultando a secao quando nao houver novas conquistas.
- Estados visuais: disponivel, em andamento e concluido.
- Integrada ao hook `useWorkouts`, com estados de loading, erro, vazio e sucesso.
- Consumo centralizado em `src/api/apiClient.ts` e `src/services/workoutsService.ts`.
- Service de Treinos resolve variaveis de ambiente no momento da chamada, consistente com a Home.
- `apiClient` possui suporte a `POST` para fluxos de criacao.
- `apiClient` possui suporte a `PUT` para registro/atualizacao de series.
- Fluxo de execucao centralizado em `src/services/workoutExecutionService.ts` e `src/hooks/useWorkoutExecution.ts`.

Configuracao de API para Treinos:

- `EXPO_PUBLIC_USER_PROFILE_ID`: perfil usado para montar as rotas mobile por usuario.
- `EXPO_PUBLIC_WORKOUTS_ENDPOINT`: endpoint opcional de Treinos; padrao atual: `/mobile/users/{EXPO_PUBLIC_USER_PROFILE_ID}/workouts`.
- Nao ha campos mockados na tela Treinos; `durationMinutes`/`estimatedDurationMinutes` vem do endpoint mobile e agora e baseado em tempo real na API.
- O detalhe de treino usa a rota existente `/api/workouts/{id}`; campos nao presentes nesse contrato nao sao mockados.
- A execucao usa as rotas existentes `/api/workouts/{id}`, `/api/workouts/{id}/exercises`, `/api/exercises`, `/api/workout-exercises/{workoutExerciseId}/sets`, `/api/workout-sets/{id}` e `/api/workouts/{id}/finish`.
- O gerenciador de criacao/edicao usa `/api/mobile/muscle-groups` e `/api/mobile/exercises` para orientar a selecao por grupos musculares oficiais.
- Descanso nao existe no contrato atual de series; por isso nao e exibido nem mockado.

Historico (`/history`):

- Resumo de treinos, tempo total e volume semanal.
- Lista cronologica dos ultimos treinos vinda da API.
- Tempo total e duracao dos treinos agora usam duracao real calculada pela Forge API a partir de `StartedAt` e `FinishedAt`.
- Integrada ao hook `useHistory`, com estados de loading, erro, vazio e sucesso.
- Consumo centralizado em `src/api/apiClient.ts` e `src/services/historyService.ts`.

Configuracao de API para Historico:

- `EXPO_PUBLIC_USER_PROFILE_ID`: perfil usado para montar as rotas mobile por usuario.
- `EXPO_PUBLIC_HISTORY_ENDPOINT`: endpoint opcional de Historico; padrao atual: `/mobile/users/{EXPO_PUBLIC_USER_PROFILE_ID}/history?page=1&pageSize=20`.
- Nao ha campos mockados na tela Historico; nomes de exercicios nao existem no contrato atual, entao a UI mostra a quantidade de exercicios registrada pela API.

Conquistas (`/achievements`):

- Resumo de desbloqueadas, disponiveis e progresso geral vindo da API.
- Filtros visuais por raridade preservados.
- Catalogo real de conquistas vindo de `GET /api/achievements`.
- Conquistas desbloqueadas do usuario vindas de `GET /api/user-profiles/{EXPO_PUBLIC_USER_PROFILE_ID}/achievements`.
- XP do usuario vindo de `GET /api/user-profiles/{EXPO_PUBLIC_USER_PROFILE_ID}/xp`.
- Integrada ao hook `useGamification`, com estados de loading, erro, vazio e sucesso.
- Consumo centralizado em `src/services/gamificationService.ts`.
- Sem mocks de conquistas; ambiente sem catalogo exibe estado vazio, mas a Forge API agora possui seed oficial para ambientes novos.
- A Forge API possui seed oficial idempotente com 11 conquistas iniciais; ambientes novos devem receber catalogo ao subir a API.

Perfil (`/profile`):

- Avatar textual com iniciais derivadas do nome real retornado pela API.
- Nome, email, nivel, XP, peso atual, peso inicial e data de criacao vindos da API.
- Nivel, XP atual e progresso para o proximo nivel priorizam `GET /api/user-profiles/{EXPO_PUBLIC_USER_PROFILE_ID}/xp`.
- Metas reais do perfil: treinos semanais, agua diaria e sono diario.
- Estatisticas gerais exibidas conforme a API fornece: treinos, treinos na semana, tempo total, volume semanal, volume total, agua de hoje e sono recente.
- Integrada ao hook `useProfile`, com estados de loading, erro, vazio e sucesso.
- Consumo centralizado em `src/api/apiClient.ts` e `src/services/profileService.ts`.
- Sem campos numericos mockados; dados ausentes nos contratos atuais aparecem como nao informados ou sao omitidos da lista de estatisticas.
- Fallbacks antigos de zero para peso, metas e datas ausentes foram removidos para nao parecerem dados reais.
- Mocks/pendencias restantes: avatar visual real, Guardiao no Perfil e streak nao possuem contrato exposto para esta tela.
- Botoes `Editar perfil` e `Configuracoes` preservados visualmente, desabilitados ate existirem fluxos reais.

Configuracao de API para Perfil:

- `EXPO_PUBLIC_USER_PROFILE_ID`: perfil usado para buscar os dados do usuario.
- Endpoint principal: `GET /api/user-profiles/{EXPO_PUBLIC_USER_PROFILE_ID}`.
- Dados auxiliares reais: `GET /api/mobile/users/{EXPO_PUBLIC_USER_PROFILE_ID}/home`, `GET /api/mobile/users/{EXPO_PUBLIC_USER_PROFILE_ID}/history?page=1&pageSize=1` e `GET /api/user-profiles/{EXPO_PUBLIC_USER_PROFILE_ID}/xp`.

Design Preview (`/design-preview`):

- Tela temporaria para validar `Button`, `Card`, `MetricCard`, `XPProgress` e tokens principais.
- Preview atualizada para demonstrar Cinzel em titulos especiais/identidade/gamificacao e Inter em titulos principais, corpo, labels, numeros, botoes e navegacao.

---

# Assets

Asset temporario criado:

- `assets/images/guardian-placeholder.png`

Uso atual:

- Fallback da Home quando o nivel atual nao possui `GuardianImageUrl` ou quando a imagem remota falha.
- Avatar temporario do Perfil.

---

# Validacoes

Ultimos comandos executados em 14/07/2026:

```txt
npx.cmd tsc --noEmit
npm.cmd run lint
npm.cmd run web -- --port 8082
```

Resultados da ultima validacao:

- TypeScript sem erros.
- Lint sem erros.
- Web respondendo `200 OK` em `http://localhost:8082/workouts/test-workout-id/execute` apos implementacao do modal de conclusao.
- Web respondendo `200 OK` em `http://localhost:8082/workouts`.
- Web respondendo `200 OK` em `http://localhost:8082/workouts/test-workout-id`, validando a rota dinamica de treino.
- Web respondendo `200 OK` em `http://localhost:8082/profile`.
- Web respondendo `200 OK` em `http://localhost:8082/achievements`.
- Web respondendo `200 OK` em `http://localhost:8082/workouts/test-workout-id/execute`, validando a rota de execucao.
- Web respondendo `200 OK` em `http://localhost:8082`, validando a Home com acoes rapidas.

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

## Revisao de Higiene - 14/07/2026

Itens executados:

- Busca por mojibake/encoding em `src`, `PROJECT_STATUS.md`, `PROJECT_AUDIT.md` e `UI_AUDIT.md` sem ocorrencias restantes.
- `UI_AUDIT.md` atualizado para marcar o P0 de encoding como resolvido.
- `PROJECT_AUDIT.md` atualizado para registrar o modal de conclusao de treino como implementado e reclassificar encoding como manutencao.
- `PROJECT_STATUS.md` atualizado para remover encoding como pendencia ativa e manter os proximos passos reais de polimento.
- Confirmacao backend em ambiente limpo registrada no status da Forge API:
  - migrations aplicadas do zero em banco temporario;
  - seed oficial retornando 11 conquistas;
  - banco temporario removido apos validacao.
- Validacao final:
  - `npx.cmd tsc --noEmit`: sucesso;
  - `npm.cmd run lint`: sucesso;
  - `npm.cmd run web -- --port 8082`: Web respondeu `200 OK` em `http://localhost:8082`.

Validacao da Sprint Home em 14/07/2026:

- `npx.cmd tsc --noEmit`: sucesso.
- `npm.cmd run lint`: sucesso.
- `npm.cmd run web -- --port 8082`: Web respondeu `200 OK` em `http://localhost:8082`.

Validacao do refinamento da Hero da Home em 14/07/2026:

- `npx.cmd tsc --noEmit`: sucesso.
- `npm.cmd run lint`: sucesso.
- `npm.cmd run web -- --port 8082`: Web respondeu `200 OK` em `http://localhost:8082`.

Validacao da responsividade mobile da Home em 14/07/2026:

- `npx.cmd tsc --noEmit`: sucesso.
- `npm.cmd run lint`: sucesso.
- `npm.cmd run web -- --port 8082`: Web respondeu `200 OK` em `http://localhost:8082`.
- Ajustes revisados para os alvos 360 px, 390 px, 430 px e largura Web atual; tentativa de screenshot headless por Edge/Chrome falhou no ambiente por erro de GPU do navegador, sem erro da aplicacao.

Validacao da refatoracao da Home conforme referencia em 14/07/2026:

- `npx.cmd tsc --noEmit`: sucesso.
- `npm.cmd run lint`: sucesso.
- `npm.cmd run web -- --port 8082`: Web respondeu `200 OK` em `http://localhost:8082`.
- Teste automatizado por screenshots em 360 px, 390 px, 430 px e Web larga foi tentado com Chrome/Edge headless, mas o navegador local falhou por GPU/timeout no ambiente; revisar visualmente no DevTools local nessas larguras.

Validacao da reconstrucao visual da Home com componentes dedicados em 14/07/2026:

- `npx.cmd tsc --noEmit`: sucesso.
- `npm.cmd run lint`: sucesso.
- `npm.cmd run web -- --port 8082`: Web respondeu `200 OK` em `http://localhost:8082`.
- Chrome headless gerou apenas paginas de erro `ERR_CONNECTION_REFUSED` durante a captura automatizada de viewports neste ambiente; validar visualmente no DevTools em 360 px, 390 px, 412 px, 430 px e Web larga.

Validacao dos ajustes visuais pontuais da Home em 14/07/2026:

- `npx.cmd tsc --noEmit`: sucesso.
- `npm.cmd run lint`: sucesso.
- `npm.cmd run web`: Expo iniciou e ficou aguardando em `http://localhost:8081`.

Padronizacao tipografica Cinzel + Inter em 14/07/2026:

- `src/theme/typography.ts` passou a expor:
  - `typography.identity.logo`;
  - `typography.identity.section`;
  - `typography.identity.guardian`;
  - `typography.title.*` em Inter;
  - `typography.number.*` em Inter;
  - `typography.gamification.level` em Cinzel;
  - `typography.gamification.xp` em Inter.
- Design Preview atualizada para demonstrar Cinzel em identidade/titulos especiais/gamificacao e Inter em interface/corpo/labels/numeros/botoes.
- Home, Treinos, Execucao de treino, Historico, Conquistas, Perfil, modais e componentes compartilhados seguem consumindo tokens tipograficos.
- Validacao:
  - `npx.cmd tsc --noEmit`: sucesso.
  - `npm.cmd run lint`: sucesso.
  - `npm.cmd run web -- --port 8082`: Expo iniciou e ficou aguardando em `http://localhost:8082`.
  - `npm.cmd run web -- --port 8082`: Expo iniciou e ficou aguardando em `http://localhost:8082`.

Padronizacao oficial Cinzel + Inter em 15/07/2026:

- `src/theme/typography.ts` passou a expor a taxonomia oficial `display`, `screenTitle`, `sectionTitle`, `cardTitle`, `body`, `label`, `metric`, `button` e `navigation`.
- Aliases anteriores foram preservados para compatibilidade com telas existentes, todos apontando para Inter/Cinzel via tokens.
- `BottomNavigation`, `MetricCard`, `ThemedText` e componentes da Home passaram a consumir nomes semanticos oficiais quando aplicavel.
- Home, Treinos, Execucao de treino, Historico, Conquistas, Perfil, modais e telas auxiliares foram revisados para remover aliases tipograficos antigos nas telas/componentes e usar a taxonomia oficial.
- `Design Preview` foi atualizada para demonstrar o uso correto de Cinzel e Inter.
- `DESIGN_SYSTEM.md`, `FRONTEND_GUIDELINES.md` e `BRAND_GUIDE.md` documentam a regra oficial:
  - Cinzel para identidade, titulos especiais e gamificacao;
  - Inter para interface, corpo, numeros, botoes, formularios, cards e navegacao;
  - novas familias tipograficas exigem revisao do Design System.
- Varredura de `fontFamily` em `src` confirmou somente tokens em `src/theme/typography.ts` e a excecao tecnica monoespacada de `ThemedText` para texto `code`.
- Varredura de aliases antigos em telas/componentes confirmou ausencia de `typography.title.*`, `typography.identity.section` e `typography.number.*` fora de `src/theme/typography.ts`.
- Validacao:
  - `npx.cmd tsc --noEmit`: sucesso.
  - `npm.cmd run lint`: sucesso.
  - `npm.cmd run web -- --port 8082`: Expo iniciou e ficou aguardando em `http://localhost:8082`.

Refatoracao do padrao visual oficial da Home em 15/07/2026:

- `npx.cmd tsc --noEmit`: sucesso.
- `npm.cmd run lint`: sucesso.
- `npm.cmd run web`: Expo iniciou e ficou aguardando em `http://localhost:8081`.
- Revisao responsiva prevista para 360 px, 390 px, 412 px, 430 px e Web, com a Home mantendo largura maxima mobile e secoes sem containers externos.

Gerenciador de treinos em `/workouts/new` em 15/07/2026:

- `npx.cmd tsc --noEmit`: sucesso.
- `npm.cmd run lint`: sucesso.
- `npm.cmd run web -- --port 8082`: Expo iniciou em `http://localhost:8082`.
- `http://localhost:8082/workouts/new`: respondeu `200 OK`.
- Revisao visual prevista para 360 px, 390 px, 412 px, 430 px e Web, mantendo largura maxima mobile, cards unicos e titulos de secao fora de superficies.

Grupos musculares oficiais em 15/07/2026:

- `npx.cmd tsc --noEmit`: sucesso.
- `npm.cmd run lint`: sucesso.
- `npm.cmd run web -- --port 8082`: Web respondeu `200 OK` em `http://localhost:8082/workouts/new`.
- Validacao backend correspondente:
  - `dotnet build Forge.slnx -p:BaseOutputPath=C:\Forge\artifacts\codex-bin\`: sucesso, usado para evitar bloqueio de DLL pela API local em execucao.
  - `dotnet test Forge.slnx -p:BaseOutputPath=C:\Forge\artifacts\codex-test-bin\`: sucesso, 13 testes aprovados.

---

# Auditoria Visual

Arquivo criado:

- `UI_AUDIT.md`

Escopo analisado:

- Home.
- Treinos.
- Criacao de treino.
- Detalhe de treino.
- Execucao de treino.
- Historico.
- Perfil.
- Conquistas.

Principais prioridades visuais antes do refinamento:

- Padronizar estados de loading, erro, vazio e sucesso.
- Criar componentes reutilizaveis para header, scaffold, status pills, stat tiles, inputs e feedback.
- Revisar a Execucao de treino como fluxo operacional com header/footer mais ergonomicos.
- Adicionar icones na bottom navigation e nas acoes rapidas.
- Revisar contraste, acessibilidade e estados bloqueados.
- Definir roadmap de animacoes para progresso, XP, conquistas e transicao entre exercicios.

---

# Proximos Passos

- Executar Fase 1 do `UI_AUDIT.md`: contraste, estados padronizados e CTAs por status.
- Refinar visual das telas em dispositivo real.
- Implementar icones oficiais da bottom navigation e das acoes rapidas.
- Extrair componentes repetidos antes de refinamentos visuais maiores.
- Reprojetar a Execucao de treino como ferramenta operacional.
- Completar identidade/status real do Guardiao no endpoint mobile da Home.
- Expandir gamificacao quando a API expuser streaks, progresso parcial por conquista e dados especificos do Guardiao.
