# Defiro

Protótipo navegável da aplicação **defiro** (pedidos e workflows da Câmara Municipal de Aveiro), feito a partir dos
mockups da página «Versão completa» do canvas *defiro · mockups da aplicação*.

React 19 + Vite + TypeScript, Tailwind CSS 4 (plugin `@tailwindcss/vite`) e React Router. Os dados são fictícios e
todas as interações usam estado local: nada é guardado.

## Correr

```bash
npm install
npm run dev
```

Outros comandos: `npm run build` (verifica os tipos e gera `dist/`), `npm run preview` e `npm run lint`.

## Ecrãs

| Rota | Ecrã |
| --- | --- |
| `/` | E01 Entrar |
| `/caixa-de-tarefas` | E02 Caixa de tarefas (Rui) |
| `/caixa-de-tarefas/rh` | E02b Caixa de tarefas (RH, Joana) |
| `/novo-pedido` | E03 Novo pedido |
| `/novo-pedido/ajudas-de-custo` | E04 Formulário do pedido |
| `/novo-pedido/ajudas-de-custo/assinar` | E05 Assinar com Chave Móvel Digital |
| `/os-meus-pedidos` | E06 Os meus pedidos |
| `/os-meus-pedidos/AC-2026-0147/corrigir` | E07 Corrigir pedido devolvido |
| `/caixa-de-tarefas/AC-2026-0147` | E08 Rever documento |
| `/caixa-de-tarefas/AC-2026-0147/rejeitar` | E09 Rejeitar documento |
| `/caixa-de-tarefas/rh/AC-2026-0122` | E10 Validação final |
| `/pesquisa` | E11 Pesquisa |
| `/workflows` | E12 Workflows |
| `/workflows/ajudas-de-custo/fluxo` | E13 Designer (`?vista=regras` para as regras) |
| `/workflows/ajudas-de-custo/formularios` | E14 Formulário do passo |
| `/workflows/ajudas-de-custo/submeter` | E15 Submeter alteração |
| `/aprovacoes` | E16 Rever alteração |
| `/regras-de-negocio` | E17 Regras de negócio |
| `/workflows/ajudas-de-custo/versoes` | E18 Versões e agendamento |
| `/notificacoes` | E19 Notificações |
| `/visao-geral` | E20 Visão geral |
| `/ausencias` | E21 Ausências e delegação |

Para mudar de pessoa: menu da conta (avatar) → **Ver como**.

**Menu de acessibilidade:** o botão redondo no canto inferior esquerdo, em todos os ecrãs (componente
«Menu de acessibilidade» do mockup). Tem perfis (visão reduzida, daltonismo, dislexia, epilepsia, teclado) e
ajustes: contraste claro e escuro, cores para daltonismo, saturação, texto maior, espaço entre letras,
altura das linhas, realçar ligações, tipo de letra legível ou para dislexia, foco reforçado, parar animações,
ler em voz alta e estrutura da página. As escolhas ficam guardadas neste navegador (`localStorage`).

## Organização

- `src/index.css`: tema do Tailwind com os tokens do design system *defiro* (cores, tipografia, raios, sombras, larguras)
  e as paletas e regras do menu de acessibilidade.
- `src/components/`: componentes reutilizáveis (`form/`, `layout/`) e peças de cada área (`request/`, `review/`, `tasks/`, `workflow/`, `overview/`).
- `src/pages/`: um ficheiro por ecrã.
- `src/data/`: dados fictícios, separados dos componentes.
- `src/routes.ts`: as rotas de todos os ecrãs.
