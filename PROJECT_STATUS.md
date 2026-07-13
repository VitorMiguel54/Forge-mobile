# Forge Mobile - Project Status

Atualizado em: 13/07/2026

---

# Estado Atual

A fundacao do tema visual do Forge foi implementada em codigo, seguindo o `DESIGN_SYSTEM.md` versao `1.1`.

Os primeiros componentes reutilizaveis do Forge foram implementados consumindo os tokens de `src/theme`.

Nenhuma tela nova foi criada.

A Home ainda nao foi implementada.

O projeto ainda esta no template inicial do Expo Router nas telas existentes.

---

# Documentos de Referencia

Foram usados como base:

- `BRAND_GUIDE.md`
- `MOODBOARD.md`
- `ART_DIRECTION.md`
- `MOBILE_UI_SPEC.md`
- `DESIGN_SYSTEM.md`
- `FRONTEND_GUIDELINES.md`

Documentos adicionais existentes no projeto:

- `API_CONTRACTS.md`
- `HOME_LAYOUT.md`
- `HOME_SCREEN_SPEC.md`
- `PRODUCT_VISION.md`
- `README.md`

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

Ultimos comandos executados em 13/07/2026:

```txt
npx.cmd tsc --noEmit
npm.cmd run lint
npm.cmd run web -- --port 8082
```

Resultados:

- `npx.cmd tsc --noEmit`: passou.
- `npm.cmd run lint`: passou.
- `npm.cmd run web -- --port 8082`: passou e respondeu em `http://localhost:8082`.

Ambiente atual:

- Node atual: `v22.22.0`.
- A versao atual do Node esta dentro da faixa suportada por React Native/Metro.
- Em PowerShell, `npm -v` via `npm.ps1` pode ser bloqueado por execution policy. Usar `npm.cmd` evita esse problema.

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
- Implementar a Home apenas quando o layout/spec estiver fechado.
