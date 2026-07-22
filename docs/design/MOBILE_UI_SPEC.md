# Forge

# Mobile UI Spec

**Versao:** 1.0

---

# 1. Objetivo do Documento

Este documento define a especificacao oficial da interface mobile do Forge.

Ele traduz o `BRAND_GUIDE.md`, o `MOODBOARD.md` e o `ART_DIRECTION.md` em regras praticas para estrutura, design system, componentes, navegacao, UX, animacoes e responsividade.

Este documento nao implementa telas, nao implementa codigo e nao substitui os demais documentos de marca. Ele deve orientar todas as futuras decisoes de interface do aplicativo.

---

# 2. Estrutura Geral do Aplicativo

## Mobile First

O Forge deve ser desenhado primeiro para uso mobile.

A experiencia principal acontece no telefone, durante ou logo apos o treino. Por isso, a interface deve priorizar rapidez, clareza, baixa friccao e uso com uma mao.

Todas as telas devem considerar:

- Leitura rapida
- Acoes principais ao alcance do polegar
- Poucos passos para tarefas frequentes
- Interface escura, premium e organizada
- Dados importantes visiveis sem esforco
- Feedback imediato apos cada acao

## Navegacao Inferior

A navegacao principal deve usar Bottom Navigation.

Ela deve ser simples, persistente e previsivel, dando acesso rapido as areas principais do aplicativo.

Telas principais:

- Home
- Treinos
- Historico
- Conquistas
- Perfil

A Bottom Navigation deve manter o mesmo comportamento em todo o app. Ela nao deve mudar de ordem, estilo ou significado entre telas.

## Hierarquia das Telas

A hierarquia deve ser rasa sempre que possivel.

Nivel 1:

- Home
- Treinos
- Historico
- Conquistas
- Perfil

Nivel 2:

- Detalhes de treino
- Registro de exercicios
- Registro de series
- Detalhes de conquistas
- Edicao de perfil
- Historicos especificos

Nivel 3 deve ser evitado. Quando necessario, deve ser reservado para fluxos pontuais e objetivos.

O usuario nunca deve sentir que esta perdido dentro do aplicativo.

---

# 3. Design System

## Paleta de Cores Conceitual

A paleta deve seguir a identidade Forge: escura, metalica, premium e contida.

Nao definir cores diretamente fora do theme.

Familias conceituais:

- Base escura profunda para fundos principais
- Superficies escuras levemente elevadas
- Neutros metalicos para estrutura
- Texto claro de alta legibilidade
- Texto secundario mais discreto
- Acentos quentes para progresso, energia e conquista
- Acentos frios discretos para informacao e estados auxiliares
- Cores semanticas para sucesso, alerta e erro

As cores de destaque devem ser usadas com moderacao. O Forge deve parecer sofisticado, nao saturado.

## Tipografia

A tipografia deve transmitir modernidade, clareza e controle.

Direcao:

- Fonte sans-serif moderna
- Boa legibilidade em tamanhos pequenos
- Peso visual consistente
- Hierarquia clara entre titulo, subtitulo, corpo e metadados
- Numeros com excelente leitura para cargas, repeticoes, peso, volume e XP

Regras:

- Titulos devem ser fortes, mas nao exagerados
- Textos de apoio devem ser curtos e objetivos
- Labels devem ser claros
- Evitar blocos longos de texto nas telas principais
- Manter consistencia de tamanho e peso em todo o aplicativo

## Espacamentos

O espacamento deve reforcar organizacao e foco.

Direcao:

- Usar uma escala consistente
- Priorizar respiro entre secoes
- Agrupar informacoes relacionadas
- Evitar telas apertadas
- Evitar excesso de espaco que prejudique densidade de informacao

A interface deve ser confortavel para consulta durante o treino, quando o usuario pode estar em movimento.

## Border Radius

O raio de borda deve ser moderado.

Direcao:

- Cantos levemente arredondados
- Aparencia moderna e premium
- Evitar formas muito circulares ou brincalhonas
- Manter consistencia entre superficies semelhantes

O Forge deve parecer refinado e firme, nao macio demais.

## Sombras

Sombras devem ser discretas e funcionais.

Direcao:

- Baixa opacidade
- Pouca dispersao
- Sensacao sutil de profundidade
- Nunca criar poluicao visual
- Nunca simular brilho exagerado

Em tema escuro, sombras podem ser combinadas com bordas sutis e contraste entre superficies.

## Elevacao

A elevacao deve indicar hierarquia, nao decoracao.

Direcao:

- Fundo principal no nivel mais baixo
- Cards e superficies em nivel intermediario
- Modais e bottom sheets acima do conteudo
- Feedbacks temporarios acima de tudo quando necessario

Evitar multiplas camadas concorrendo entre si.

## Icones

Os icones devem seguir o `ART_DIRECTION.md`.

Regras:

- Minimalistas
- Tracos limpos
- Mesmo peso visual
- Leitura imediata
- Sem excesso de detalhes
- Sempre alinhados ao theme
- Nunca usar estilos diferentes na mesma area

Icones devem apoiar a acao e a navegacao. Eles nao devem ser decorativos sem funcao.

---

# 4. Componentes

Esta secao define comportamento visual e de UX. Ela nao implementa componentes.

## Botao Primario

Uso:

- Acao principal da tela
- Confirmacao de fluxo
- Registro importante
- Inicio ou conclusao de treino

Direcao:

- Alto contraste
- Presenca forte
- Texto curto e direto
- Feedback imediato ao toque
- Estado disabled claramente reconhecivel
- Loading interno quando a acao estiver em processamento

Deve existir apenas uma acao primaria dominante por contexto.

## Botao Secundario

Uso:

- Acoes alternativas
- Cancelar
- Voltar
- Editar
- Ver mais

Direcao:

- Menos destaque que o primario
- Aparencia contida
- Mantem legibilidade
- Pode usar borda, superficie discreta ou texto destacado conforme o theme

O botao secundario nunca deve competir visualmente com o primario.

## Card

Uso:

- Agrupar informacoes relacionadas
- Exibir resumo de treino
- Mostrar progresso
- Apresentar dados de habitos
- Destacar conquistas ou status

Direcao:

- Superficie escura elevada
- Borda sutil ou contraste de superficie
- Conteudo bem hierarquizado
- Poucos elementos por card
- Nada de excesso ornamental

Cards devem facilitar leitura rapida, nao virar blocos densos e confusos.

## Input

Uso:

- Insercao de dados de perfil
- Registro de treino
- Peso
- Repeticoes
- Carga
- Agua
- Sono

Direcao:

- Label claro
- Valor facil de ler
- Estado de foco evidente
- Erro objetivo e visivel
- Teclado adequado ao tipo de dado
- Layout confortavel para uso rapido

Inputs devem evitar sensacao de formulario pesado.

## Search

Uso:

- Buscar exercicios
- Filtrar historico
- Encontrar itens em listas

Direcao:

- Campo simples
- Icone de busca discreto
- Resultado rapido
- Estado vazio claro
- Botao de limpar quando houver texto

A busca deve reduzir friccao, nao adicionar complexidade.

## Avatar

Uso:

- Representar usuario
- Representar o Guardiao quando aplicavel
- Criar identidade visual no perfil e Home

Direcao:

- Aparencia premium
- Sem humor visual
- Sem excesso de cor
- Deve respeitar a direcao artistica do Guardiao quando usar imagem/personagem

Avatar nao deve parecer infantil ou caricato.

## Badge

Uso:

- Status
- Conquista
- Nivel
- Meta cumprida
- Indicadores pequenos

Direcao:

- Pequeno
- Legivel
- Contraste suficiente
- Uso moderado
- Sem excesso de brilho

Badges devem comunicar status rapidamente. Evitar transformar a tela em um painel cheio de recompensas visuais.

## Progress Bar

Uso:

- XP
- Meta de agua
- Meta de sono
- Progresso semanal
- Evolucao de objetivo

Direcao:

- Clara
- Elegante
- Movimento suave
- Valor atual compreensivel
- Nunca depender apenas de cor para comunicar estado

Progress bars devem reforcar evolucao e consistencia.

## Loading

Uso:

- Carregamento inicial
- Envio de acao
- Atualizacao de dados

Direcao:

- Discreto
- Rapido
- Alinhado ao tema escuro
- Evitar animacoes chamativas
- Quando possivel, usar loading local em vez de bloquear a tela inteira

O usuario deve entender que o app esta respondendo.

## Skeleton

Uso:

- Carregamento de listas
- Home
- Historico
- Cards de resumo

Direcao:

- Simular estrutura real do conteudo
- Baixo contraste
- Animacao suave
- Sem brilho exagerado

Skeleton deve reduzir percepcao de espera sem poluir a tela.

## Modal

Uso:

- Confirmacoes importantes
- Alertas criticos
- Decisoes que exigem foco

Direcao:

- Conteudo curto
- Acao principal clara
- Acao secundaria discreta
- Fundo com destaque controlado
- Evitar modais para fluxos longos

Modal deve ser excecao, nao padrao.

## Bottom Sheet

Uso:

- Acoes contextuais
- Selecao rapida
- Registro curto
- Opcoes adicionais

Direcao:

- Natural para mobile
- Facil de fechar
- Conteudo objetivo
- Acoes ao alcance do polegar
- Altura proporcional ao conteudo

Bottom Sheet deve ser priorizado para interacoes rapidas sem tirar o usuario do contexto.

---

# 5. Navegacao

## Home

Papel:

- Ser a tela principal do usuario
- Mostrar progresso essencial
- Dar acesso rapido a acoes frequentes
- Reforcar motivacao e consistencia

Conteudos esperados:

- Saudacao ou identificacao do usuario
- Resumo de progresso
- Dados principais de treino, peso, agua e sono
- Informacoes de gamificacao quando disponiveis
- Acesso rapido para registrar treino

Home deve ser objetiva e escaneavel.

## Treinos

Papel:

- Criar e gerenciar treinos
- Registrar exercicios e series
- Reduzir atrito durante o treino

Direcao:

- Fluxo rapido
- Poucos toques
- Acoes claras
- Informacoes de carga, repeticoes e ordem sempre legiveis

Treinos e a area mais operacional do app. Deve ser eficiente acima de tudo.

## Historico

Papel:

- Consultar treinos e registros anteriores
- Acompanhar evolucao ao longo do tempo
- Permitir comparacao simples

Direcao:

- Lista clara
- Filtros simples
- Datas evidentes
- Resumos rapidos
- Possibilidade de detalhar sem sobrecarregar

Historico deve facilitar reconhecimento de progresso.

## Conquistas

Papel:

- Exibir conquistas desbloqueadas
- Mostrar progresso de metas futuras
- Reforcar disciplina sem transformar o app em jogo

Direcao:

- Visual premium
- Badges ou simbolos discretos
- Hierarquia clara entre desbloqueadas e bloqueadas
- Pouco brilho
- Sem tom infantil

Conquistas devem parecer marcos reais, nao premios aleatorios.

## Perfil

Papel:

- Gerenciar dados pessoais
- Ajustar metas
- Consultar configuracoes
- Ver dados gerais do usuario

Direcao:

- Organizado
- Direto
- Sem excesso de secoes
- Informacoes sensiveis bem claras
- Edicao simples

Perfil deve transmitir controle e confianca.

---

# 6. Regras de UX

## Uso com Uma Mao

O app deve favorecer uso com uma mao.

Regras:

- Acoes frequentes devem ficar em areas de facil alcance
- Evitar controles importantes no topo extremo da tela
- Bottom Sheets devem ser preferidos para escolhas rapidas
- Botoes principais devem ser confortaveis para toque

## Poucos Toques para Registrar Treino

Registrar treino deve ser rapido.

Regras:

- Evitar etapas desnecessarias
- Reaproveitar informacoes quando possivel
- Priorizar defaults inteligentes
- Manter edicao de series simples
- Evitar formularios longos

O usuario nao deve sentir que esta alimentando uma planilha.

## Feedback Visual Imediato

Toda acao relevante deve gerar resposta visual.

Exemplos:

- Toque em botao
- Registro salvo
- Erro de validacao
- Meta cumprida
- Serie adicionada
- Treino finalizado

Feedback deve ser claro, curto e elegante.

## Priorizar Clareza

Clareza vem antes de estilo.

Regras:

- Numeros importantes devem ser faceis de ler
- Labels devem ser objetivos
- Estados vazios devem orientar o usuario
- Erros devem explicar o que fazer
- Dados nao devem ficar escondidos atras de decoracao

## Evitar Telas Poluidas

O Forge deve parecer premium e focado.

Evitar:

- Muitos cards competindo
- Muitos badges na mesma area
- Icones decorativos sem funcao
- Cores demais
- Textos longos
- Efeitos chamativos
- Informacoes de baixa prioridade na primeira dobra

---

# 7. Animacoes

## Microinteracoes

Microinteracoes devem tornar o app responsivo e prazeroso sem chamar atencao demais.

Usar em:

- Toques
- Toggle de estados
- Confirmacao de cadastro
- Incremento de series
- Atualizacao de progresso
- Desbloqueio de conquista

## Transicoes Suaves

Transicoes devem manter continuidade entre contextos.

Direcao:

- Duracao curta
- Movimento suave
- Sem exagero elastico
- Sem animacoes decorativas longas
- Respeitar reducao de movimento quando aplicavel

## Feedback ao Concluir Acoes

Ao concluir uma acao, o app deve confirmar rapidamente.

Exemplos:

- Serie registrada
- Treino finalizado
- Agua registrada
- Sono registrado
- Peso atualizado

O feedback pode usar movimento sutil, mudanca de estado, texto curto ou destaque visual controlado.

---

# 8. Responsividade

## Android como Prioridade

Android e a prioridade inicial.

Regras:

- Considerar variedade de tamanhos de tela
- Garantir toque confortavel
- Respeitar areas seguras e barras do sistema
- Testar em telas pequenas e medias
- Garantir boa performance em aparelhos intermediarios

## iOS Compativel

iOS deve ser compativel e manter a mesma identidade visual.

Regras:

- Respeitar safe areas
- Evitar comportamento que dependa apenas de padroes Android
- Manter consistencia de navegacao
- Ajustar gestos quando necessario

O Forge deve parecer o mesmo produto nas duas plataformas, respeitando diferencas naturais de sistema.

---

# 9. Boas Praticas

## Theme Obrigatorio

Nenhuma cor deve ser hardcoded.

Todos os valores visuais devem vir do theme ou de tokens definidos.

Inclui:

- Cores
- Tipografia
- Espacamentos
- Radius
- Sombras
- Elevacao
- Estados

## Componentes Reutilizaveis

Nenhum componente deve ser criado fora do padrao visual do app.

Regras:

- Componentes devem ser reutilizaveis
- Variações devem ser controladas
- Estados devem ser padronizados
- Comportamento visual deve ser previsivel

Evitar duplicar componentes com pequenas diferencas visuais.

## Nenhum Componente Fora do Theme

Todo componente deve respeitar:

- Paleta conceitual
- Tipografia
- Espacamento
- Radius
- Iconografia
- Estados de toque, foco, erro, disabled e loading

Se um componente precisar de uma excecao visual, essa excecao deve ser documentada antes de ser usada.

## Consistencia Visual

Toda nova tela ou componente deve responder positivamente:

- Esta claro?
- Esta premium?
- Esta alinhado ao Forge?
- Funciona bem no mobile?
- Evita poluicao?
- Usa o theme?
- Mantem a direcao artistica?

Se a resposta for negativa, a solucao deve ser revista.

---

# 10. Principio Final

A interface do Forge deve ajudar o usuario a evoluir com clareza, rapidez e motivacao.

O design deve ser forte sem ser pesado, elegante sem ser frio, motivador sem ser infantil.

Cada tela deve reforcar a promessa central:

**Forje a melhor versao de voce.**
