# Defiro · web

A aplicação web da **defiro** (pedidos e workflows da Câmara Municipal de Aveiro): React 19 + Vite + TypeScript,
Tailwind CSS 4 (plugin `@tailwindcss/vite`) e React Router.

Por agora é só a base: o tema com os tokens do design system _defiro_ (`src/index.css`), as ferramentas e as
verificações do CI. Os ecrãs chegam uma user story de cada vez, cada um com os seus testes.

## Correr

```bash
npm install
npm run dev
```

Precisa do Node indicado em `.nvmrc`. O `.npmrc` não corre scripts de instalação e recusa pacotes publicados há
menos de 7 dias.

## Comandos

| Comando                 | O que faz                                                                       |
| ----------------------- | ------------------------------------------------------------------------------- |
| `npm run dev`           | Servidor de desenvolvimento, com recarregamento automático                      |
| `npm run build`         | Verifica os tipos e gera `dist/`                                                |
| `npm run preview`       | Serve o `dist/` gerado                                                          |
| `npm run check`         | As verificações do CI (`Commit · web`): formatação, lint, tipos, testes e build |
| `npm run format:check`  | Verifica a formatação (Prettier)                                                |
| `npm run format`        | Formata todos os ficheiros                                                      |
| `npm run lint`          | oxlint; falha também com avisos                                                 |
| `npm run typecheck`     | Verifica os tipos (`tsc -b`)                                                    |
| `npm run test:coverage` | Testes (Vitest) com cobertura em `coverage/` e relatório JUnit em `reports/`    |
| `npm test`              | Só os testes, sem cobertura                                                     |

## Testes

Os testes ficam ao lado do código que testam (`App.tsx` → `App.test.tsx`) e correm com Vitest em jsdom, com React
Testing Library para os componentes. Os testes que dependem da data de hoje fixam o relógio com
`vi.useFakeTimers()` e `vi.setSystemTime(...)`.

## Trazer um ecrã do protótipo

O protótipo navegável do MVP (os 7 ecrãs com dados fictícios) está no ramo temporário `prototype/frontend`. Não entra
no `main` de uma vez: cada user story traz os ecrãs e o código de que precisa, com testes, num pull request seu.

Ver o protótipo a correr:

```bash
git fetch origin
git switch prototype/frontend
cd apps/web && npm ci && npm run dev
```

Trazer ficheiros para o ramo da user story:

```bash
git switch -c UC18-reject-reasons origin/main
git restore --source origin/prototype/frontend -- apps/web/src/pages/RequestPage.tsx apps/web/src/components/Chip.tsx
```

Os ficheiros do protótipo usam dados de demonstração; ao trazê-los, ligue-os ao servidor e escreva os testes. O
SonarQube já assinalou alguns problemas neles (acessibilidade em `A11yMenu`, `Topbar` e `DesignerPage`, uma expressão
regular e `NaN` em `trip.ts`), que têm de ser corrigidos quando forem trazidos.

Nunca faça merge de `prototype/frontend` no `main`. O ramo é apagado quando todos os ecrãs tiverem sido trazidos.
