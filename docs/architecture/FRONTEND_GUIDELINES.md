# Forge Mobile - Frontend Guidelines

## Tipografia Oficial

O Forge Mobile utiliza apenas duas familias tipograficas:

- `Cinzel`: identidade, titulos especiais e gamificacao.
- `Inter`: interface funcional, corpo, numeros, botoes, formularios, cards e navegacao.

Nenhuma nova familia tipografica deve ser adicionada sem revisao do Design System.

## Uso de Cinzel

Usar Cinzel com moderacao, aproximadamente 10-15% da interface.

Contextos permitidos:

- Logo/nome FORGE.
- Titulos de secao especiais, como `TREINO DE HOJE`, `ACOES RAPIDAS` e `PROGRESSO DA SEMANA`.
- Nivel, rank e conquistas.
- Titulos ligados ao Guardiao.
- Elementos especiais de progressao.

Nao usar Cinzel em:

- Textos longos.
- Labels pequenos de formulario.
- Botoes.
- Numeros e metricas comuns.
- Bottom Navigation.

## Uso de Inter

Inter e a fonte base do produto, aproximadamente 85-90% da interface.

Contextos obrigatorios:

- Titulos principais funcionais.
- Descricoes e corpo de texto.
- Valores e metricas.
- Botoes.
- Formularios.
- Cards.
- Labels.
- Estados de loading, erro, vazio e sucesso.
- Bottom Navigation.

## Tokens Obrigatorios

Componentes e telas devem consumir apenas os tokens de `src/theme/typography.ts`.

Tokens principais:

- `typography.display`
- `typography.screenTitle`
- `typography.sectionTitle`
- `typography.cardTitle`
- `typography.body.default`
- `typography.body.secondary`
- `typography.label`
- `typography.metric.highlight`
- `typography.metric.compact`
- `typography.button`
- `typography.navigation`
- `typography.gamification.level`
- `typography.gamification.xp`

Nao declarar `fontFamily`, `fontSize`, `fontWeight` ou `lineHeight` diretamente em componentes, exceto em excecoes tecnicas documentadas.

## Ordenacao Manual

Ordenacoes manuais no Forge devem usar controles de seta para cima e para baixo.

Regras do padrao:

- Mover uma posicao por clique.
- Desabilitar a seta para cima no primeiro item.
- Desabilitar a seta para baixo no ultimo item.
- Persistir a ordem no backend quando a lista representar dados salvos.
- Usar areas de toque adequadas para mobile.
- Drag and drop nao deve ser utilizado, salvo decisao futura explicita.

## Excecoes

Texto tecnico de codigo pode usar fonte monoespacada por necessidade de leitura tecnica.

Qualquer outra excecao deve ser registrada no `PROJECT_STATUS.md` e revisada contra o `DESIGN_SYSTEM.md`.
