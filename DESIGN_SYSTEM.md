# Forge

# Design System

**Versao:** 1.1

---

# 1. Objetivo do Documento

Este documento define a primeira versao oficial do tema visual do Forge.

Ele transforma a direcao da marca em valores concretos para paleta, tipografia, espacamentos, radius, bordas, sombras, icones, botoes e areas de toque.

Este documento nao implementa codigo. Ele deve orientar a criacao futura do theme, dos tokens e dos componentes reutilizaveis do aplicativo.

---

# 2. Status das Decisoes

## Definitivo

- Mobile first.
- Tema escuro como padrao.
- Direcao visual fria, sobria e premium.
- Aco e grafite como base visual.
- Laranja quente da forja usado apenas como destaque.
- Azul reservado para XP.
- Bronze e dourado usados com moderacao.
- Sem neon.
- Sem futurismo exagerado.
- Sem excesso de gradientes.
- Nenhuma cor hardcoded nas telas.
- Nenhum espacamento hardcoded nas telas.
- Nenhuma tipografia definida diretamente em componentes.
- Todos os componentes devem consumir tokens do tema.
- Componentes devem ser reutilizaveis.
- Sombras e elevacao devem ser discretas.
- Interface deve priorizar clareza, uso rapido e presenca forte.

## Provisorio

- Familia tipografica final pode mudar apos testes em Android e iOS.
- Intensidade final das sombras ainda precisa de validacao visual em telas reais.
- Radius pode sofrer pequenos ajustes apos prototipos.
- Duracoes de animacao ainda precisam ser medidas em prototipo.
- A biblioteca de icones sugerida ainda precisa ser confirmada na implementacao.
- A paleta HEX abaixo e a primeira versao oficial, mas deve passar por validacao visual e de acessibilidade.

---

# 3. Principios Gerais

## Mobile First

O Forge deve ser desenhado primeiro para celular.

A interface precisa funcionar durante ou logo apos o treino, com leitura rapida, poucos toques e acoes ao alcance do polegar.

## Tema Escuro como Padrao

O tema escuro e definitivo.

O fundo deve ser frio e sobrio, com grafite, aco e superficies profundas. A interface deve evitar aparencia colorida, neon ou futurista.

## Visual Premium

O visual deve parecer intencional, forte e refinado.

A presenca premium vem de contraste, alinhamento, tipografia, superficies e uso controlado de destaques.

## Interface Limpa

Elementos decorativos devem ser raros.

Metricas, treino, progresso e acoes principais devem ser mais importantes que ornamentos visuais.

## Gamificacao Elegante

XP, nivel e conquistas devem parecer progresso real, nao jogo arcade.

O uso de azul, bronze, dourado e laranja deve ser pontual e significativo.

---

# 4. Paleta Oficial

## Valores HEX Definidos

| Papel | Token | HEX | Status | Uso |
| --- | --- | --- | --- | --- |
| Fundo principal | `color.background.primary` | `#080A0D` | Definitivo v1 | Fundo principal do app. Grafite quase preto, frio e profundo. |
| Fundo secundario | `color.background.secondary` | `#0E1217` | Definitivo v1 | Fundo alternativo para secoes, listas e areas de separacao. |
| Superficie | `color.surface.default` | `#141A21` | Definitivo v1 | Containers e blocos de conteudo. |
| Card | `color.surface.card` | `#181F28` | Definitivo v1 | Cards padrao. |
| Card elevado | `color.surface.cardElevated` | `#202936` | Definitivo v1 | Cards de destaque, modais e superficies com maior presenca. |
| Borda | `color.border.default` | `#2B3542` | Definitivo v1 | Bordas sutis e separadores. |
| Texto principal | `color.text.primary` | `#F4F7FA` | Definitivo v1 | Titulos, valores e textos principais. |
| Texto secundario | `color.text.secondary` | `#A7B0BC` | Definitivo v1 | Labels, apoio e metadados. |
| Texto desabilitado | `color.text.disabled` | `#5D6672` | Definitivo v1 | Estados desabilitados. |
| Cor primaria | `color.brand.primary` | `#D66A1F` | Definitivo v1 | Acao principal e destaque quente da marca. |
| Cor secundaria | `color.brand.secondary` | `#7E8794` | Definitivo v1 | Apoio, acoes secundarias e detalhes metalicos. |
| XP | `color.gamification.xp` | `#3B82F6` | Definitivo v1 | XP e progresso de experiencia. Azul reservado para XP. |
| Nivel | `color.gamification.level` | `#D6A84F` | Definitivo v1 | Nivel, rank e progressao de status. Usar com moderacao. |
| Sucesso | `color.semantic.success` | `#2EAD6B` | Definitivo v1 | Confirmacoes, metas cumpridas e estados positivos. |
| Atencao | `color.semantic.warning` | `#D99A2B` | Definitivo v1 | Alertas, cuidado e informacoes importantes. |
| Erro | `color.semantic.error` | `#E05252` | Definitivo v1 | Erros, validacoes e acoes destrutivas. |
| Agua | `color.metric.water` | `#38A8C7` | Definitivo v1 | Hidratacao e consumo diario. |
| Sono | `color.metric.sleep` | `#7C6FE8` | Definitivo v1 | Sono, descanso e meta diaria. |
| Peso | `color.metric.weight` | `#9BA3AD` | Definitivo v1 | Peso corporal e evolucao fisica. |
| Volume | `color.metric.volume` | `#C67A3A` | Definitivo v1 | Volume movimentado e carga de treino. |
| Conquistas | `color.gamification.achievement` | `#C99A3D` | Definitivo v1 | Conquistas desbloqueadas e marcos especiais. |
| Bronze | `color.material.bronze` | `#9C6A3C` | Definitivo v1 | Metal quente, conquistas iniciais e detalhes raros. |
| Aco | `color.material.steel` | `#8F9BA8` | Definitivo v1 | Metal frio, armadura, linhas e detalhes premium. |
| Laranja quente da forja | `color.forge.hotOrange` | `#F27A1A` | Definitivo v1 | Destaque raro de energia, acao e momento de forja. |

## Regras da Paleta

- O app deve parecer frio e sobrio na maior parte do tempo.
- Grafite, aco e superficies escuras devem dominar.
- Laranja quente deve ser usado apenas para acao importante, progresso significativo ou momentos de conquista.
- Azul deve ser reservado para XP.
- Bronze e dourado devem aparecer com moderacao.
- Gradientes nao sao proibidos, mas devem ser raros, discretos e nunca chamativos.
- Nao usar neon.
- Nao usar cores saturadas como base de tela.
- Nao depender apenas de cor para comunicar estado.

---

# 5. Tipografia Oficial

## Familias

| Papel | Familia | Status | Uso |
| --- | --- | --- | --- |
| Principal | `Inter` | Provisorio v1 | Interface, textos, labels, botoes e navegacao. |
| Destaque | `Sora` | Provisorio v1 | Numeros fortes, nivel, XP, titulos especiais e momentos de progresso. |
| Fallback | System sans-serif | Definitivo | Fallback nativo Android/iOS quando a fonte nao estiver carregada. |

## Pesos

| Token | Peso | Status | Uso |
| --- | --- | --- | --- |
| `font.weight.regular` | 400 | Definitivo | Texto padrao. |
| `font.weight.medium` | 500 | Definitivo | Labels, legendas e apoio. |
| `font.weight.semibold` | 600 | Definitivo | Titulos de card e destaques moderados. |
| `font.weight.bold` | 700 | Definitivo | Titulos e botoes. |
| `font.weight.extrabold` | 800 | Definitivo | Numeros em destaque, XP e nivel. |

## Escala Tipografica

| Token | Familia | Peso | Tamanho | Altura de linha | Status | Uso |
| --- | --- | --- | --- | --- | --- | --- |
| `typography.title.main` | Sora | 700 | 28 | 34 | Definitivo v1 | Titulo principal, saudacao e contexto forte. |
| `typography.title.section` | Inter | 700 | 20 | 26 | Definitivo v1 | Titulos de secao. |
| `typography.title.card` | Inter | 600 | 16 | 22 | Definitivo v1 | Titulos internos de cards. |
| `typography.body.default` | Inter | 400 | 15 | 22 | Definitivo v1 | Texto padrao. |
| `typography.body.secondary` | Inter | 400 | 13 | 19 | Definitivo v1 | Texto de apoio e metadados. |
| `typography.caption` | Inter | 500 | 12 | 16 | Definitivo v1 | Legendas, badges e timestamps. |
| `typography.button` | Inter | 700 | 15 | 20 | Definitivo v1 | Texto de botoes. |
| `typography.number.highlight` | Sora | 800 | 32 | 38 | Definitivo v1 | Numero principal de cards e metricas. |
| `typography.number.compact` | Sora | 700 | 22 | 28 | Definitivo v1 | Numeros medios em cards compactos. |
| `typography.gamification.level` | Sora | 800 | 18 | 24 | Definitivo v1 | Nivel e rank. |
| `typography.gamification.xp` | Sora | 700 | 14 | 20 | Definitivo v1 | XP atual e XP necessario. |

## Regras

- Nenhum componente deve declarar fonte, tamanho, peso ou line-height diretamente.
- Todos os textos devem consumir tokens.
- Numeros importantes usam `Sora`.
- Textos funcionais usam `Inter`.
- A escala precisa ser validada em Android e iOS antes de congelar como versao final.

---

# 6. Tokens de Espacamento

| Token | Valor | Status | Uso |
| --- | --- | --- | --- |
| `spacing.1` | 4 | Definitivo | Ajustes finos e gaps minimos. |
| `spacing.2` | 8 | Definitivo | Distancia curta entre itens relacionados. |
| `spacing.3` | 12 | Definitivo | Padding compacto. |
| `spacing.4` | 16 | Definitivo | Padding padrao de tela e card. |
| `spacing.5` | 20 | Definitivo | Separacao media entre grupos. |
| `spacing.6` | 24 | Definitivo | Separacao entre secoes. |
| `spacing.8` | 32 | Definitivo | Respiro forte entre blocos. |
| `spacing.10` | 40 | Definitivo | Separacao ampla. |
| `spacing.12` | 48 | Definitivo | Areas de destaque e espaco inferior seguro. |

## Regras

- Nenhum espacamento hardcoded.
- Fluxos de treino podem usar densidade maior, mas sempre com tokens.
- Telas principais devem usar `spacing.4` como padding horizontal minimo.

---

# 7. Radius

| Token | Valor | Status | Uso |
| --- | --- | --- | --- |
| `radius.sm` | 6 | Definitivo v1 | Badges, chips pequenos e indicadores. |
| `radius.md` | 10 | Definitivo v1 | Inputs, botoes secundarios e elementos compactos. |
| `radius.lg` | 14 | Definitivo v1 | Cards e botoes principais. |
| `radius.xl` | 20 | Definitivo v1 | Modais, Bottom Sheets e superficies grandes. |
| `radius.circular` | 999 | Definitivo | Avatares, FAB e botoes circulares. |

## Regras

- Radius deve ser moderno, mas firme.
- Evitar aparencia excessivamente arredondada.
- Cards e botoes principais devem compartilhar uma linguagem visual consistente.

---

# 8. Bordas

| Token | Valor | Status | Uso |
| --- | --- | --- | --- |
| `border.width.hairline` | 0.5 | Provisorio | Separadores muito sutis quando suportado. |
| `border.width.default` | 1 | Definitivo | Cards, inputs, chips e estados normais. |
| `border.width.active` | 1.5 | Provisorio | Foco e estado selecionado. |
| `border.width.strong` | 2 | Definitivo v1 | Erro, selecao forte ou destaque raro. |
| `border.color.default` | `#2B3542` | Definitivo v1 | Borda padrao. |
| `border.color.active` | `#D66A1F` | Definitivo v1 | Foco ou selecao principal. |
| `border.color.disabled` | `#343B45` | Definitivo v1 | Elementos desabilitados. |
| `border.color.error` | `#E05252` | Definitivo v1 | Inputs e estados de erro. |
| `border.color.success` | `#2EAD6B` | Definitivo v1 | Confirmacoes e metas cumpridas. |

---

# 9. Sombras e Elevacao

Sombras devem ser discretas e funcionar junto com contraste de superficie. Nada deve parecer flutuando de forma exagerada.

| Token | Valor | Status | Uso |
| --- | --- | --- | --- |
| `elevation.none` | sem sombra | Definitivo | Fundos e superficies planas. |
| `elevation.card` | `0 8 20 rgba(0, 0, 0, 0.22)` | Definitivo v1 | Cards comuns. |
| `elevation.cardFeatured` | `0 12 28 rgba(0, 0, 0, 0.30)` | Definitivo v1 | Cards em destaque. |
| `elevation.modal` | `0 18 44 rgba(0, 0, 0, 0.42)` | Definitivo v1 | Modais. |
| `elevation.bottomSheet` | `0 -12 32 rgba(0, 0, 0, 0.36)` | Definitivo v1 | Bottom Sheets. |
| `elevation.fab` | `0 12 30 rgba(0, 0, 0, 0.34)` | Definitivo v1 | FAB. |

## Regras

- Evitar glow.
- Evitar sombras coloridas.
- Usar borda sutil para reforcar profundidade em tema escuro.
- Validar em Android e iOS, pois sombras nativas se comportam de formas diferentes.

---

# 10. Icones

## Biblioteca Sugerida

| Item | Valor | Status |
| --- | --- | --- |
| Biblioteca | `lucide-react-native` | Provisorio recomendado |
| Estilo padrao | Outline | Definitivo |
| Estilo preenchido | Apenas estado selecionado ou conquista rara | Definitivo |

## Tamanhos

| Token | Valor | Status | Uso |
| --- | --- | --- | --- |
| `icon.size.xs` | 14 | Definitivo v1 | Captions, badges e metadados. |
| `icon.size.sm` | 18 | Definitivo v1 | Inputs, chips e botoes pequenos. |
| `icon.size.md` | 22 | Definitivo v1 | Cards, Bottom Navigation e acoes comuns. |
| `icon.size.lg` | 28 | Definitivo v1 | FAB, destaques e empty states. |
| `icon.size.xl` | 40 | Definitivo v1 | Empty states e ilustracoes funcionais simples. |

## Espessura

| Token | Valor | Status |
| --- | --- | --- |
| `icon.stroke.default` | 2 | Definitivo v1 |
| `icon.stroke.subtle` | 1.75 | Definitivo v1 |
| `icon.stroke.emphasis` | 2.25 | Definitivo v1 |

## Regras

- Icones sempre usam tokens de cor.
- Evitar misturar bibliotecas.
- Evitar icones preenchidos fora dos casos definidos.
- Icones de navegacao devem manter o mesmo tamanho e peso.

---

# 11. Botoes e Toque

## Alturas de Botoes

| Token | Valor | Status | Uso |
| --- | --- | --- | --- |
| `button.height.sm` | 36 | Definitivo v1 | Acoes compactas e chips acionaveis. |
| `button.height.md` | 44 | Definitivo v1 | Botao secundario ou contexto compacto. |
| `button.height.lg` | 52 | Definitivo v1 | Botao primario padrao. |
| `button.height.xl` | 56 | Definitivo v1 | Acao principal em fluxo critico. |

## Area Minima de Toque

| Token | Valor | Status | Uso |
| --- | --- | --- | --- |
| `touch.min.android` | 48 | Definitivo | Referencia minima Android. |
| `touch.min.ios` | 44 | Definitivo | Referencia minima iOS. |
| `touch.min.global` | 48 | Definitivo | Padrao recomendado do Forge. |

## Regras

- Elementos visuais podem ser menores que 48, mas a area tocavel nao.
- Acoes frequentes devem ficar ao alcance do polegar.
- Botao primario usa `button.height.lg` por padrao.
- FAB usa dimensao minima de 56x56.

---

# 12. Componentes Fundamentais

## Botao Primario

Visual:

- Background `color.brand.primary`.
- Texto `color.text.primary`.
- Radius `radius.lg`.
- Altura `button.height.lg`.
- Tipografia `typography.button`.

Estados:

- Normal: cor primaria.
- Pressionado: escurecer levemente ou reduzir opacidade para 0.88.
- Foco: borda `border.color.active`.
- Carregando: mostrar loading interno e bloquear toque repetido.
- Desabilitado: background `#343B45`, texto `color.text.disabled`.
- Sucesso: feedback breve com `color.semantic.success`.

## Botao Secundario

Visual:

- Background transparente ou `color.surface.default`.
- Borda `color.border.default`.
- Texto `color.text.primary`.
- Altura `button.height.md`.
- Radius `radius.lg`.

Estados seguem a mesma linguagem do botao primario, com menor enfase.

## Botao de Icone

Visual:

- Area minima 48x48.
- Icone `icon.size.md`.
- Radius `radius.circular` ou `radius.md`, conforme contexto.

Regra:

- Label acessivel obrigatorio.

## Card

Visual:

- Background `color.surface.card`.
- Borda `color.border.default`.
- Radius `radius.lg`.
- Padding `spacing.4`.
- Elevacao `elevation.card`.

## Card de Metrica

Visual:

- Numero usa `typography.number.highlight` ou `typography.number.compact`.
- Label usa `typography.body.secondary`.
- Cor contextual deve seguir tokens de metrica.

Regra:

- Numero e unidade devem ser legiveis sem depender apenas de cor.

## Card de Treino

Visual:

- Background `color.surface.card`.
- Titulo `typography.title.card`.
- Metadados `typography.body.secondary`.
- Volume usa `color.metric.volume`.

## Barra de Progresso

Visual:

- Trilha `#2B3542`.
- Preenchimento por contexto.
- Altura padrao 8.
- Radius `radius.circular`.

## Barra de XP

Visual:

- Trilha `#2B3542`.
- Preenchimento `color.gamification.xp`.
- Nivel usa `color.gamification.level`.
- Evitar glow azul.

## Input

Visual:

- Background `color.surface.default`.
- Borda `color.border.default`.
- Texto `color.text.primary`.
- Label `color.text.secondary`.
- Altura minima 48.
- Radius `radius.md`.

Estados:

- Foco: borda `color.brand.primary`.
- Erro: borda `color.semantic.error` e mensagem.
- Desabilitado: texto `color.text.disabled`.

## Campo de Busca

Visual:

- Mesmo padrao de Input.
- Icone `icon.size.sm`.
- Placeholder em `color.text.disabled`.

## Badge

Visual:

- Altura minima 24.
- Padding horizontal `spacing.2`.
- Radius `radius.circular`.
- Tipografia `typography.caption`.

## Chip

Visual:

- Altura 32.
- Radius `radius.circular`.
- Borda `color.border.default`.
- Selecionado usa borda ativa e superficie elevada.

## Avatar

Visual:

- Tamanhos sugeridos: 32, 40, 56, 72.
- Radius circular.
- Fallback com iniciais ou imagem do Guardiao.

## Modal

Visual:

- Background `color.surface.cardElevated`.
- Radius `radius.xl`.
- Elevacao `elevation.modal`.
- Overlay preto com opacidade entre 0.48 e 0.64.

## Bottom Sheet

Visual:

- Background `color.surface.cardElevated`.
- Radius superior `radius.xl`.
- Elevacao `elevation.bottomSheet`.
- Handle `#5D6672`.

## Skeleton

Visual:

- Base `#1D2631`.
- Highlight `#273241`.
- Animacao suave e discreta.

## Loading

Visual:

- Cor padrao `color.brand.primary`.
- Em contexto de XP, usar `color.gamification.xp`.
- Evitar loaders grandes sem necessidade.

## Empty State

Visual:

- Icone `icon.size.xl`.
- Texto principal `typography.title.card`.
- Apoio `typography.body.secondary`.
- Ilustracao opcional deve seguir `ART_DIRECTION.md`.

## Bottom Navigation

Visual:

- Background `#0E1217`.
- Borda superior `color.border.default`.
- Icone normal `color.text.secondary`.
- Icone selecionado `color.brand.primary`.
- Label `typography.caption`.
- Altura recomendada: 64 sem safe area.

## FAB

Visual:

- Tamanho 56x56.
- Background `color.forge.hotOrange`.
- Icone `color.text.primary`.
- Elevacao `elevation.fab`.
- Radius circular.

Regra:

- Usar com moderacao e apenas para acao principal contextual.

---

# 13. Estados dos Componentes

| Estado | Regra visual |
| --- | --- |
| Normal | Usa tokens padrao do componente. |
| Pressionado | Feedback imediato com opacidade 0.88, superficie mais escura ou escala muito sutil. |
| Foco | Borda ativa, halo discreto ou indicacao equivalente. |
| Carregando | Loading local e bloqueio de toque repetido. |
| Desabilitado | Texto `color.text.disabled`, menor contraste e sem interacao. |
| Erro | `color.semantic.error`, texto explicativo e icone quando necessario. |
| Sucesso | `color.semantic.success`, confirmacao curta e sem comemoracao exagerada. |

---

# 14. Acessibilidade

## Contraste

- Texto principal deve mirar WCAG AA.
- Texto secundario deve ser testado em dispositivo real.
- Estados de erro, sucesso e atencao devem usar texto ou icone alem da cor.

## Area de Toque

- Padrao global: 48x48.
- iOS minimo: 44x44.
- Android minimo: 48x48.

## Legibilidade

- Evitar texto abaixo de 12.
- Numeros importantes devem ter contraste alto.
- Labels devem ser curtos.
- O app deve continuar legivel em telas pequenas.

## Movimento

- Animacoes devem respeitar reducao de movimento quando disponivel.
- Evitar animacoes longas e repetitivas.

---

# 15. Regras de Implementacao

Estas regras sao definitivas.

- Nenhuma cor hardcoded nas telas.
- Nenhum espacamento hardcoded nas telas.
- Nenhuma tipografia definida diretamente em componentes.
- Nenhuma sombra definida diretamente fora do theme.
- Nenhum radius definido diretamente fora do theme.
- Nenhum tamanho de icone hardcoded fora dos tokens.
- Todos os componentes devem consumir tokens do tema.
- Componentes devem ser reutilizaveis.
- Estados devem ser padronizados.
- Variantes devem ser documentadas.
- Excecoes visuais devem ser justificadas e documentadas.
- Nao implementar codigo nesta etapa.

---

# 16. Decisoes Ainda em Aberto

- Validar contraste real da paleta em Android e iOS.
- Validar se `Inter` e `Sora` serao mantidas ou substituidas por fontes nativas.
- Validar leitura de `Sora` em numeros pequenos.
- Validar intensidade das sombras em dispositivos Android intermediarios.
- Confirmar `lucide-react-native` como biblioteca oficial.
- Definir duracoes exatas de microinteracoes.
- Validar radius dos cards e botoes em prototipo visual.
- Validar uso do laranja quente para FAB e botoes primarios.
- Definir se o app tera modo claro no futuro.
- Definir como os tokens serao nomeados tecnicamente no theme.

---

# 17. Valores HEX Definidos

Lista consolidada:

- `#080A0D` Fundo principal
- `#0E1217` Fundo secundario
- `#141A21` Superficie
- `#181F28` Card
- `#202936` Card elevado
- `#2B3542` Borda
- `#F4F7FA` Texto principal
- `#A7B0BC` Texto secundario
- `#5D6672` Texto desabilitado
- `#D66A1F` Cor primaria
- `#7E8794` Cor secundaria
- `#3B82F6` XP
- `#D6A84F` Nivel
- `#2EAD6B` Sucesso
- `#D99A2B` Atencao
- `#E05252` Erro
- `#38A8C7` Agua
- `#7C6FE8` Sono
- `#9BA3AD` Peso
- `#C67A3A` Volume
- `#C99A3D` Conquistas
- `#9C6A3C` Bronze
- `#8F9BA8` Aco
- `#F27A1A` Laranja quente da forja
- `#343B45` Borda/estado desabilitado
- `#1D2631` Skeleton base
- `#273241` Skeleton highlight

---

# 18. Principio Final

O tema visual do Forge deve ser frio, sobrio e forte na base, com calor apenas nos momentos certos.

A interface deve parecer uma ferramenta premium para evolucao fisica, nao um jogo chamativo.

Tudo deve servir ao uso real do aplicativo: registrar, acompanhar e celebrar evolucao com elegancia.

**A evolucao e forjada diariamente.**
