# Defiro

Protótipo navegável da aplicação **defiro** (pedidos e workflows da Câmara Municipal de Aveiro), feito a partir da
página «Opção 1 · Protótipo único» do canvas *defiro · mockups da aplicação*: os ecrãs do MVP com os mesmos dados
partilhados, de modo que o que uma pessoa faz chega à seguinte.

React 19 + Vite + TypeScript, Tailwind CSS 4 (plugin `@tailwindcss/vite`) e React Router. Os dados são fictícios e
ficam neste separador do navegador (`sessionStorage`): recarregar a página mantém a demonstração, um separador novo
começa do início.

## Correr

```bash
npm install
npm run dev
```

Outros comandos: `npm run build` (verifica os tipos e gera `dist/`), `npm run preview` e `npm run lint`.

## Ecrãs

| Rota | Ecrã |
| --- | --- |
| `/` | E01 Entrar (escolher a conta da demonstração) |
| `/caixa-de-tarefas` | E02 Caixa de tarefas e «Os meus pedidos» |
| `/novo-pedido` | E03 Novo pedido |
| `/novo-pedido/:workflow` | E04 Formulário do pedido, passo a passo |
| `/pedidos/:id` | E08 Rever pedido · E10 Validação final · ver um pedido (`?ver=1`) |
| `/pedidos/:id/corrigir` | E07 Corrigir pedido devolvido (abre no resumo) |
| `/workflows` | E12 Workflows (Sofia) |
| `/workflows/:id` | E12b Ver o workflow completo |
| `/workflows/criar` | E13 Criar workflow, passo a passo · E14 Campos do formulário |

## Percurso sugerido

1. Entrar como **Ana** → Novo pedido → Ajudas de custo → responder passo a passo → Submeter
2. Ver como **Rui** → Rever o pedido novo → Nota num campo → Devolver para correção (um ou mais motivos; experimentar
   Desfazer)
3. Ver como **Ana** → Corrigir (abre no resumo, com as partes a corrigir assinaladas) → Reenviar
4. Ver como **Rui** → Aprovar · Ver como **Carla** → Aprovar
5. Ver como **Joana** → Validar e fechar → Ver documento → Transferir PDF
6. Ver como **Ana** → Os meus pedidos → Documento
7. Ver como **Sofia** → Workflows → abrir «Ajudas de custo» → Ver o workflow completo · Criar workflow (no menu):
   nome → quem pede → cada passo do percurso (quem trata, prazo, motivos) → formulário, um campo de cada vez → rever →
   a Ana passa a vê-lo em Novo pedido

Depois de cada ação aparece um pequeno aviso no topo do ecrã. Nos formulários, «Anterior» fica em baixo, junto de
«Continuar», e «Sair» em cima, à direita.

**Menu da conta** (avatar): **Ver como** muda de pessoa · **Tema** escolhe as cores da defiro ou da Câmara Municipal de
Aveiro · **Recomeçar a demonstração** volta aos pedidos e workflows do início · Terminar sessão.

**Menu de acessibilidade:** o botão redondo no canto inferior esquerdo, em todos os ecrãs. Tem perfis (visão reduzida,
daltonismo, dislexia, epilepsia, teclado) e ajustes: contraste claro e escuro, cores para daltonismo, saturação, texto
maior, espaço entre letras, altura das linhas, realçar ligações, tipo de letra legível ou para dislexia, foco reforçado,
parar animações, ler em voz alta e estrutura da página. As escolhas (e o tema) ficam guardadas neste navegador
(`localStorage`); o alto contraste e o modo escuro têm prioridade sobre o tema.

## Organização

- `src/domain/`: dados e regras do protótipo, sem React: pessoas e grupos, o workflow «Ajudas de custo», os pedidos
  de exemplo, submeter, reenviar e decidir, validação do formulário e o desenho de workflows.
- `src/state/`: os dados partilhados da demonstração (`DemoProvider`) e as confirmações curtas (`FeedbackProvider`).
- `src/components/`: componentes reutilizáveis (botões, chips, aviso, documento em PDF, linha de progresso, campos de
  formulário) e a estrutura dos ecrãs em `layout/`.
- `src/pages/`: um ficheiro por ecrã.
- `src/lib/`: utilitários (acessibilidade, PDF, foco, estilos dos campos).
- `src/index.css`: tema do Tailwind com os tokens do design system *defiro*, o tema da Câmara de Aveiro e as paletas e
  regras do menu de acessibilidade.
