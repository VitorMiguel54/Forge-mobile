# Forge Mobile - Auditoria Visual

Atualizado em: 14/07/2026

## Escopo

Auditoria visual estatica do Forge Mobile antes da fase de refinamento visual.

Telas analisadas:

- Home (`/`)
- Treinos (`/workouts`)
- Criacao de treino (`/workouts/new`)
- Detalhe de treino (`/workouts/[id]`)
- Execucao de treino (`/workouts/[id]/execute`)
- Historico (`/history`)
- Perfil (`/profile`)
- Conquistas (`/achievements`)

Esta auditoria nao implementa alteracoes de codigo. O objetivo e orientar a proxima fase de polimento.

## Prioridades

- P0: problema que afeta legibilidade, confianca ou uso basico.
- P1: problema visual/UX recorrente que deve entrar no primeiro ciclo de polimento.
- P2: melhoria importante de consistencia, reutilizacao ou responsividade.
- P3: refinamento fino, animacao ou acabamento.

## Achados Globais

### P0 - Texto com mojibake em varias telas

Status em 14/07/2026: resolvido na revisao de higiene. A busca por sequencias comuns de mojibake nao encontrou ocorrencias em `src`; restava apenas esta anotacao documental.

Impacto:

- Reduz qualidade percebida do produto.
- Dificulta leitura.
- Afeta todas as telas principais.

Recomendacao de manutencao:

- Manter todos os arquivos de telas/componentes em UTF-8.
- Validar no navegador e no bundler Expo quando novas strings forem adicionadas.

### P1 - Muitos padroes visuais duplicados por tela

Cada tela recria localmente header, state card, section, meta grid, status pill, input e card de estatistica.

Impacto:

- Pequenas diferencas de espacamento e hierarquia surgem entre telas.
- A fase de polimento tende a gerar retrabalho.

Recomendacao:

- Criar componentes reutilizaveis:
  - `ScreenScaffold`
  - `ScreenHeader`
  - `StateCard`
  - `StatGrid`
  - `StatTile`
  - `StatusPill`
  - `LabeledInput`
  - `FeedbackBanner`
  - `Section`

### P1 - Hierarquia visual ainda muito uniforme

A maioria das telas usa a mesma sequencia visual: header, card elevado, lista de cards. Isso cria consistencia, mas tambem reduz diferenca funcional entre telas.

Impacto:

- Home, Historico, Perfil e Conquistas parecem proximas demais em densidade e ritmo.
- Fluxos operacionais, como Execucao de treino, nao parecem suficientemente diferentes de telas de consulta.

Recomendacao:

- Definir papeis visuais por tela:
  - Home: painel de decisao rapida.
  - Treinos: biblioteca/selecionador.
  - Execucao: ferramenta operacional, mais densa e fixa.
  - Historico: leitura e comparacao.
  - Perfil: identidade e dados pessoais.
  - Conquistas: colecao/progresso.

### P1 - Estados de loading, erro e vazio funcionam, mas sao genericos

As telas usam `Card + ActivityIndicator + texto`, com poucas diferencas por contexto.

Impacto:

- O app parece funcional, mas ainda nao polido.
- Estados vazios nao conduzem bem a proxima acao.

Recomendacao:

- Padronizar `StateCard` com variantes `loading`, `error`, `empty`, `success`.
- Adicionar CTA contextual nos vazios:
  - Treinos: criar treino.
  - Historico: iniciar treino.
  - Conquistas: finalizar primeiro treino.
  - Perfil: revisar dados.

### P1 - Bottom navigation ainda sem icones

A bottom navigation usa texto e indicador horizontal. Funciona, mas perde escaneabilidade e personalidade.

Impacto:

- Area inferior fica mais textual que o esperado para mobile.
- Usuarios precisam ler mais do que reconhecer.

Recomendacao:

- Adicionar icones consistentes por rota.
- Manter texto, mas reduzir dependencia dele.
- Validar estados ativo, pressionado e foco/teclado no Web.

### P1 - Acessibilidade de controles incompleta

Existe uso bom de `accessibilityRole` em botoes e checkbox de exercicio, mas faltam labels descritivos em varios controles e estados.

Impacto:

- Leitores de tela podem anunciar controles de forma pouco clara.
- Pressables que funcionam como cards podem nao comunicar acao.

Recomendacao:

- Adicionar `accessibilityLabel`/`accessibilityHint` em cards clicaveis, botoes principais e filtros.
- Garantir que chips de raridade e status nao dependam apenas de cor.
- Verificar contraste de textos secundarios, disabled e badges.

### P2 - Responsividade Web/mobile ainda depende de poucas regras

As telas usam `maxWidth` comum e trocam algumas linhas entre `row` e `column`, mas nao ha breakpoints intermediarios.

Impacto:

- Web estreito e tablets podem ficar com composicoes nem totalmente mobile nem totalmente desktop.
- Grids de cards podem criar largura irregular.

Recomendacao:

- Definir padroes de grid por contexto:
  - metricas 2 colunas no mobile largo/tablet;
  - 3 colunas apenas quando houver largura real;
  - listas operacionais sempre com largura total.

### P2 - Paleta e contraste precisam de verificacao formal

O tema e consistente, mas alguns tons podem ficar baixos em contraste:

- `colors.text.disabled` sobre surfaces escuras.
- `colors.text.secondary` em textos pequenos.
- badges com borda colorida e fundo escuro.
- cards bloqueados com `opacity: 0.72`.

Recomendacao:

- Rodar checagem WCAG para textos pequenos.
- Evitar reduzir opacidade do card inteiro quando houver texto dentro; preferir tokens especificos para estado bloqueado.

### P2 - Animacoes ainda ausentes

O app tem boa base para microinteracoes, mas ainda nao usa movimento.

Oportunidades:

- entrada suave de cards apos loading;
- feedback de sucesso nas acoes rapidas;
- progresso de XP e barras animando de 0 ate valor;
- transicao entre exercicios na Execucao;
- botao finalizar treino com estado de conclusao.

## Home

### Problemas encontrados

- P0 resolvido: textos visiveis foram revisados na higiene de UTF-8.
- P1: card do Guardiao e visualmente forte, mas o botao "Iniciar treino" nao indica se ha treino real ativo; pode parecer acao disponivel mesmo sem destino claro.
- P1: acoes rapidas usam numeracao `1`, `2`, `3` em vez de icones ou simbolos funcionais; isso comunica ordem, nao finalidade.
- P1: modal de acao rapida e funcional, mas generico; falta contexto visual por tipo de acao.
- P1: atividade recente e derivada de dados reais, mas ainda parece feed real. Pode gerar expectativa de uma timeline completa.
- P2: `guardianImageFrame` usa posicionamento absoluto com imagem grande; em telas pequenas pode competir com texto e reduzir area util.
- P2: metricas do dia estao boas, mas a ordem e a hierarquia podem ser melhoradas para priorizar o que exige acao hoje.
- P2: card de conquista em progresso aparece sem relacao clara com a tela Conquistas.
- P3: sucesso de acao rapida aparece como card simples; poderia usar feedback temporario mais leve.

### Melhorias recomendadas

- Transformar acoes rapidas em componentes com icones: peso, agua, sono.
- Diferenciar modais por tipo de registro usando cor/acento do tema.
- Tornar "Iniciar treino" dependente de `activeWorkout`; quando nao houver treino, oferecer "Criar treino".
- Reduzir ou reposicionar imagem do Guardiao em telas estreitas.
- Definir um componente `QuickActionCard`.
- Criar um componente `RecentActivityList` ou renomear a secao para deixar claro que e resumo do dia.

### Animacoes recomendadas

- XP progress animado.
- Confirmacao curta ao registrar peso/agua/sono.
- Entrada sutil do card do Guardiao apos carregamento.

## Treinos

### Problemas encontrados

- P0 resolvido: textos visiveis foram revisados na higiene de UTF-8.
- P1: o botao `Novo treino` disputa atencao com o header, mas em mobile fica stretch e pode pesar visualmente.
- P1: card destacado mostra "Treino do dia" e "Em andamento"; se a API retorna apenas `activeWorkout`, o conceito de "do dia" pode ser enganoso.
- P1: status pills sao locais e repetidos; falta sistema unico de status.
- P1: cards de treino salvos usam sempre "Iniciar treino", inclusive para concluido. Pode soar incorreto.
- P2: meta grid com dois blocos e visualmente correto, mas repetido em Historico/Detalhe.
- P2: lista vazia informa criar primeiro treino, mas nao tem CTA direto.
- P2: estados de loading/erro ocupam o mesmo espaco visual do conteudo, sem skeleton.

### Melhorias recomendadas

- Substituir "Treino do dia" por rotulo baseado no dado real.
- Ajustar CTA por status:
  - `available`: Iniciar treino.
  - `inProgress`: Continuar treino.
  - `completed`: Ver resumo ou desabilitar.
- Criar `WorkoutCard`, `WorkoutStatusPill` e `WorkoutStat`.
- Adicionar CTA "Criar treino" no estado vazio.

### Animacoes recomendadas

- Press feedback nos cards.
- Transicao de status quando um treino inicia/finaliza.
- Skeleton simples para lista de treinos.

## Criacao de Treino

### Problemas encontrados

- P0 resolvido: textos visiveis foram revisados na higiene de UTF-8.
- P1: selecao de exercicios usa marcador textual `OK`; visualmente e menos claro que checkbox/check icon.
- P1: nao ha busca, filtro por grupo muscular ou agrupamento; com muitos exercicios, a tela ficara longa rapidamente.
- P1: botao `Criar e iniciar` fica no fim do scroll; em listas longas, a acao principal pode sumir.
- P2: estado vazio explica que a API precisa de exercicios, mas nao oferece rota/acao alternativa.
- P2: contador de selecionados e util, mas poderia ser fixo junto da acao principal.

### Melhorias recomendadas

- Adicionar barra de busca e filtros por grupo muscular.
- Usar check visual em vez de texto `OK`.
- Fixar footer com contador e CTA "Criar e iniciar".
- Separar exercicios globais e customizados quando houver muitos itens.

### Animacoes recomendadas

- Check animado ao selecionar exercicio.
- Footer surgindo quando pelo menos um exercicio for selecionado.

## Detalhe de Treino

### Problemas encontrados

- P0 resolvido: textos visiveis foram revisados na higiene de UTF-8.
- P1: tela tem pouco conteudo e parece etapa intermediaria desnecessaria, ja que Treinos navega direto para Execucao em alguns fluxos.
- P1: status "Pronto para iniciar" nao reflete claramente status real se treino estiver em andamento/concluido.
- P2: mostra volume e local, mas nao exercicios, series ou duracao real; a decisao de iniciar fica com pouca informacao.
- P2: nao ha botao voltar visual dentro da tela.

### Melhorias recomendadas

- Decidir se esta tela continua existindo ou se vira resumo pre-execucao.
- Exibir exercicios, grupos musculares, duracao real/estimada e status.
- Ajustar CTA por status: iniciar, continuar, ver historico.

### Animacoes recomendadas

- Transicao da lista de Treinos para detalhe/execucao com continuidade visual do card.

## Execucao de Treino

### Problemas encontrados

- P0 resolvido: textos visiveis foram revisados na higiene de UTF-8.
- P1: tela operacional depende de ScrollView unico; durante treino real, campos e botoes podem ficar longe demais.
- P1: navegacao entre exercicios usa botoes textuais "Anterior" e "Proximo"; ocupa muito espaco e nao comunica progresso visual forte.
- P1: cada serie vira um card com varios inputs; em treinos com muitas series, a densidade cresce demais.
- P1: editar serie e registrar serie usam controles parecidos, mas sem separacao clara entre "planejado", "registrado" e "editando".
- P1: `globalThis.confirm` no Web quebra o estilo visual do Forge.
- P1: feedback de erro/sucesso em card pode empurrar conteudo durante o treino.
- P2: `registeredSetIds` e status "Registrada/Pendente" podem confundir quando uma serie ja veio da API.
- P2: botao "Finalizar treino" fica no fim da tela; em mobile pode ficar distante da acao.
- P2: campos numericos nao mostram unidade junto do input.
- P2: falta resumo persistente do treino: tempo, volume, exercicio atual, series completas.
- P2: acessibilidade dos inputs precisa de labels e hints mais descritivos.

### Melhorias recomendadas

- Transformar Execucao em layout operacional:
  - header compacto fixo com treino, tempo e progresso;
  - exercicio atual em foco;
  - footer fixo com proxima acao;
  - lista de series mais densa.
- Criar `SetEditor`, `ExerciseStepper`, `WorkoutExecutionHeader` e `ExecutionFooter`.
- Substituir confirm nativo Web por modal Forge.
- Diferenciar claramente estados: pendente, salvo, editando, bloqueado por finalizado.
- Considerar gestos ou tabs para trocar exercicio.

### Animacoes recomendadas

- Transicao horizontal entre exercicios.
- Feedback de salvar serie.
- Contador/progresso de series.
- Modal de finalizacao com resumo animado.

## Historico

### Problemas encontrados

- P0 resolvido: textos visiveis foram revisados na higiene de UTF-8.
- P1: resumo superior usa grid vertical, nao explora comparacao rapida.
- P1: timeline visual ainda e uma lista de cards; nao ha linha temporal real.
- P1: cada card mostra uma "lista de exercicio" com apenas contagem; visualmente parece detalhe incompleto.
- P2: falta agrupamento por data/semana.
- P2: falta estado de paginacao/carregar mais, apesar da API ser paginada.
- P2: volume e duracao aparecem, mas sem tendencia ou comparacao com treino anterior.

### Melhorias recomendadas

- Criar resumo com tres metricas compactas lado a lado quando houver largura.
- Trocar "lista de exercicio" por metadado simples ou trazer nomes quando a API expuser.
- Agrupar por semana/mes.
- Adicionar "Carregar mais" ou infinite load.
- Criar `HistorySummary` e `TimelineWorkoutCard`.

### Animacoes recomendadas

- Entrada progressiva da timeline.
- Barras/mini indicadores para volume e duracao.

## Perfil

### Problemas encontrados

- P0 resolvido: textos visiveis foram revisados na higiene de UTF-8.
- P1: avatar textual e grande, mas pouco conectado ao universo visual do Forge.
- P1: hero do perfil mistura identidade, email, nivel e XP; pode ficar alto demais e sem foco.
- P1: muitos stats viram cards iguais, sem agrupamento por tipo.
- P2: botoes `Editar perfil` e `Configuracoes` estao desabilitados; visualmente parecem quebrados se nao houver explicacao contextual.
- P2: grid usa `30%` no Web, mas mobile fica coluna longa; pode cansar.
- P2: falta representacao de metas como progresso, nao apenas valor.

### Melhorias recomendadas

- Separar identidade, XP e metas.
- Trocar avatar textual por composicao visual com Guardiao/avatar quando houver contrato.
- Agrupar stats em secoes: corpo, rotina, treino, gamificacao.
- Adicionar descricao curta para botoes desabilitados ou remover ate existir fluxo.
- Usar cards horizontais compactos para stats secundarios.

### Animacoes recomendadas

- XP progress animado.
- Entrada suave dos grupos de estatisticas.

## Conquistas

### Problemas encontrados

- P0 resolvido: textos visiveis foram revisados na higiene de UTF-8.
- P1: filtros de raridade sao apenas visuais; nao filtram a colecao.
- P1: progresso de conquista bloqueada e sempre 0%, porque a API ainda nao fornece progresso parcial.
- P1: cards bloqueados usam opacidade no card inteiro, reduzindo legibilidade.
- P1: raridade e inferida localmente por categoria; isso pode divergir do catalogo real no futuro.
- P2: resumo superior poderia ser mais visual e menos tabular.
- P2: colecao sem agrupamento pode ficar longa quando o catalogo crescer.
- P2: "Bloqueada" e "Requisito" dependem de texto pequeno; precisa de iconografia/estado mais claro.

### Melhorias recomendadas

- Fazer filtros funcionais ou remover interacao aparente.
- Evitar opacidade no card inteiro; criar estilo bloqueado com texto legivel.
- Criar `AchievementCard`, `RarityFilter`, `AchievementSummary`.
- Pedir contrato futuro para raridade e progresso parcial.
- Agrupar por categoria ou status.

### Animacoes recomendadas

- Desbloqueio com microcelebracao discreta.
- Barra de progresso geral animada.
- Reveal de conquista desbloqueada.

## Componentes e Reutilizacao

### Componentes a criar/refatorar primeiro

P1:

- `ScreenScaffold`
- `ScreenHeader`
- `StateCard`
- `StatusPill`
- `StatTile`
- `LabeledInput`
- `FeedbackBanner`

P2:

- `WorkoutCard`
- `WorkoutStat`
- `HistoryWorkoutCard`
- `AchievementCard`
- `QuickActionCard`
- `ExecutionSetRow`
- `ExerciseNavigator`

P3:

- `AnimatedProgressBar`
- `SkeletonCard`
- `Toast`
- `ConfirmDialog`

## Responsividade

Problemas principais:

- Conteudo usa `maxWidth` fixo comum, bom para Web, mas sem breakpoints intermediarios.
- Grids alternam entre `row` no Web e `column` no native, deixando tablets e telas largas mobile pouco aproveitados.
- Botoes principais ficam stretch no mobile, mas alguns deveriam ser footer fixo em fluxos operacionais.

Recomendacoes:

- Definir padroes por largura: compacto, medio, amplo.
- Manter Execucao como ferramenta mobile-first, com acoes fixas.
- Revisar largura minima de badges e cards com textos longos em portugues.

## Acessibilidade

Problemas principais:

- Muitos cards clicaveis nao possuem label/hint especifico.
- Filtros de raridade nao informam estado selecionado porque ainda nao filtram.
- Alguns estados usam apenas cor ou opacidade.
- Textos pequenos em badges e captions precisam checagem de contraste.
- Inputs precisam labels acessiveis consistentes alem do texto visual.

Recomendacoes:

- Padronizar props de acessibilidade nos componentes reutilizaveis.
- Garantir `accessibilityRole`, `accessibilityState`, `accessibilityLabel` e `accessibilityHint`.
- Evitar comunicar status apenas por cor.
- Testar com teclado no Web e leitor de tela no mobile.

## Roadmap de Polimento

### Fase 1 - Correcoes Criticas

1. Revisar contraste de texto secundario, disabled, badges e cards bloqueados.
2. Padronizar estados loading/erro/vazio/sucesso com `StateCard`.
3. Corrigir CTAs por status em Treinos e Execucao.
4. Substituir confirm nativo Web por modal visual do Forge.
5. Manter higiene UTF-8 em novas strings.

### Fase 2 - Sistema Visual Reutilizavel

1. Criar `ScreenScaffold` e `ScreenHeader`.
2. Criar `StatusPill`, `StatTile`, `LabeledInput` e `FeedbackBanner`.
3. Refatorar Treinos, Historico, Perfil e Conquistas para usar componentes comuns.
4. Adicionar icones na bottom navigation e acoes rapidas.
5. Padronizar grids responsivos.

### Fase 3 - Fluxos Operacionais

1. Reprojetar Execucao de treino como ferramenta com header/footer fixos.
2. Criar editor compacto de series.
3. Adicionar resumo de treino em execucao: tempo, volume, progresso e exercicio atual.
4. Melhorar Criacao de treino com busca, filtros e footer fixo.
5. Revisar tela de Detalhe de treino ou consolidar com Execucao.

### Fase 4 - Gamificacao e Identidade

1. Refinar card do Guardiao e preparar contrato visual real.
2. Melhorar Conquistas com filtros funcionais e agrupamento.
3. Adicionar progresso parcial quando a API fornecer.
4. Criar microcelebracoes discretas para XP/conquistas.
5. Unificar avatar/Guardiao entre Home e Perfil.

### Fase 5 - Movimento e Acabamento

1. Animar progress bars.
2. Adicionar skeletons.
3. Adicionar transicoes entre exercicios.
4. Adicionar feedback de sucesso nao intrusivo.
5. Validar em dispositivos reais e navegadores Web.

## Conclusao

O Forge Mobile esta funcionalmente maduro para entrar em polimento visual. A higiene de texto/encoding foi tratada; a prioridade imediata agora e consolidar componentes repetidos e transformar a Execucao de treino em uma experiencia operacional mais ergonomica. Depois disso, o refinamento de Guardiao, Conquistas e animacoes pode elevar a percepcao de produto sem mexer na arquitetura de API ja integrada.
