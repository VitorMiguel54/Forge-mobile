# Forge Mobile - Project Status

Atualizado em: 10/07/2026

---

# Estado Atual

A fundacao do tema visual do Forge foi implementada em codigo, seguindo o `DESIGN_SYSTEM.md` versao `1.1`.

Os primeiros componentes reutilizaveis do Forge foram implementados consumindo os tokens de `src/theme`.

Nenhuma tela nova foi criada.

A Home ainda nao foi implementada.

---

# Documentos de Referencia

Foram usados como base:

- `BRAND_GUIDE.md`
- `MOODBOARD.md`
- `ART_DIRECTION.md`
- `MOBILE_UI_SPEC.md`
- `DESIGN_SYSTEM.md`
- `FRONTEND_GUIDELINES.md`

---

# Tema Visual

Arquivos criados em `src/theme`:

- `colors.ts`
- `typography.ts`
- `spacing.ts`
- `radius.ts`
- `borders.ts`
- `shadows.ts`
- `iconSizes.ts`
- `componentSizes.ts`
- `index.ts`

Tokens implementados:

- Paleta oficial do Forge.
- Tipografia oficial.
- Escala de espacamentos.
- Radius.
- Bordas.
- Sombras/elevacao.
- Tamanhos e espessuras de icones.
- Alturas de botoes.
- Areas minimas de toque.
- Tamanhos estruturais de FAB, progress bar, badge, chip, avatar e bottom navigation.

Tambem foi criado `src/types/styles.d.ts` para declarar imports de CSS usados pelo template Expo/Web.

---

# Componentes Reutilizaveis

Arquivos criados em `src/components`:

- `buttons/Button.tsx`
- `cards/Card.tsx`
- `cards/MetricCard.tsx`
- `progress/XPProgress.tsx`
- `index.ts`

Componentes implementados:

- `Button`
  - Variants: `primary`, `secondary`, `outline`.
  - Estados: normal, pressed, disabled e loading.
  - Suporte a icone opcional.
  - Usa area minima de toque definida no tema.

- `Card`
  - Variants: `default`, `elevated`, `highlighted`.
  - Suporte a `children`.
  - Padding configuravel apenas por tokens de `spacing`.

- `MetricCard`
  - Suporta titulo, valor principal, unidade, texto secundario, icone e progresso opcional.
  - Accents: `water`, `sleep`, `weight`, `volume`.
  - Pensado para agua, sono, peso e volume.

- `XPProgress`
  - Recebe nivel atual, XP atual e XP necessario para o proximo nivel.
  - Calcula percentual internamente.
  - Trata XP zero, meta zero e XP acima da meta.
  - Sem animacao por enquanto.

Nenhuma tela temporaria foi criada.

---

# Validacoes

Comandos executados:

```txt
npx tsc --noEmit
npm run lint
npm run web -- --port 8082
```

Resultados:

- `npx tsc --noEmit`: passou.
- `npm run lint`: passou.
- `npm run web -- --port 8082`: falhou por incompatibilidade do Node atual.

Detalhe do bloqueio:

- Node atual: `v21.7.1`.
- React Native/Metro do projeto exige Node `^20.19.4`, `^22.13.0`, `^24.3.0` ou `>=25.0.0`.
- O erro ocorre dentro do Metro/Expo CLI com `TypeError [ERR_INVALID_ARG_VALUE]` em `util.styleText`.

---

# Ajustes Feitos Durante Validacao

- `eslint` e `eslint-config-expo` foram adicionados pelo `expo lint`, pois o projeto ainda nao tinha ESLint configurado.
- `eslint.config.js` foi criado pela configuracao automatica do Expo.
- `src/hooks/use-color-scheme.web.ts` foi ajustado para evitar `setState` sincronamente dentro de `useEffect`, conforme regra do lint.
- `src/types/styles.d.ts` foi adicionado para resolver declaracoes de imports CSS no TypeScript.

---

# Decisoes Ainda Provisorias

- Confirmar `Inter` e `Sora` como fontes finais apos teste visual.
- Validar a paleta em Android e iOS reais.
- Validar sombras/elevacao em dispositivos Android intermediarios.
- Confirmar `lucide-react-native` como biblioteca oficial de icones antes de instalar.
- Validar visualmente `Button`, `Card`, `MetricCard` e `XPProgress` em tela real/prototipo.
- Validar o uso de `boxShadow` nos cards em Android, iOS e Web.
- Definir duracoes exatas de microinteracoes.
- Validar radius dos cards e botoes em prototipo visual.
- Reexecutar `npm run web` com uma versao suportada do Node.
