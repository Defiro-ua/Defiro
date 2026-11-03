import { useState } from 'react'
import { Button } from '../components/Button'
import { Chip, type ChipTone } from '../components/Chip'
import { Icon } from '../components/Icon'
import { AppLayout } from '../components/layout/AppLayout'
import { PageTitle } from '../components/PageTitle'
import { HeadRow, Td, Th, Tr } from '../components/Table'
import { activeFilters, otherFilters, searchQuery, searchResults, totalResults, type SearchStatus } from '../data/search'
import { cx } from '../lib/cx'

const statusTone: Record<SearchStatus, ChipTone> = {
  'Em análise': 'info',
  Devolvido: 'warning',
  Concluído: 'success',
  Rejeitado: 'error',
}

/** Wraps the part of `text` that matches `query` in a highlighter mark. */
function Highlight({ text, query }: { text: string; query: string }) {
  const at = query ? text.toLowerCase().indexOf(query.toLowerCase()) : -1
  if (at < 0) return <>{text}</>
  return (
    <>
      {text.slice(0, at)}
      <mark className="rounded-xs bg-highlight px-0.5 text-ink">{text.slice(at, at + query.length)}</mark>
      {text.slice(at + query.length)}
    </>
  )
}

/** E11 · Pesquisa (UC23, UC32) */
export function SearchPage() {
  const [query, setQuery] = useState(searchQuery)
  const [filters, setFilters] = useState(activeFilters)
  const [selectedId, setSelectedId] = useState(searchResults[0].id)

  const q = query.trim().toLowerCase()
  const results = searchResults.filter((r) =>
    [r.id, r.match + r.rest, r.requester].some((text) => text.toLowerCase().includes(q)),
  )
  const isDefault = query === searchQuery
  const count = isDefault ? totalResults : results.length
  const selected = results.find((r) => r.id === selectedId) ?? results[0]

  return (
    <AppLayout user="rui" nav={{ inboxCount: 5 }} width="full" searchValue={query} gap="gap-6">
      <header className="flex flex-col gap-3">
        <PageTitle accent>Pesquisa</PageTitle>
        <p className="text-body text-ink-3">Só aparecem os procedimentos em que participa ou que pertencem à sua unidade.</p>
      </header>

      <form role="search" onSubmit={(event) => event.preventDefault()}>
        <label className="flex h-14 items-center gap-3 rounded-pill border-emph border-orange bg-panel px-5.5 shadow-focus-field">
          <Icon name="search" size={20} className="text-accent-ink" />
          <input
            type="search"
            aria-label="Pesquisar por ID, nome ou assunto"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            className="min-w-0 flex-1 bg-transparent text-search outline-none"
          />
          <span className="hidden text-label-sm text-ink-3 sm:inline">ID, nome, assunto ou documento</span>
        </label>
      </form>

      <div className="flex flex-wrap items-center gap-2.5">
        {otherFilters.slice(0, 1).map((name) => (
          <FilterMenuButton key={name} label={name} />
        ))}
        {filters.slice(0, 1).map((filter) => (
          <ActiveFilter key={filter} label={filter} onRemove={() => setFilters((f) => f.filter((x) => x !== filter))} />
        ))}
        {otherFilters.slice(1).map((name) => (
          <FilterMenuButton key={name} label={name} />
        ))}
        {filters.slice(1).map((filter) => (
          <ActiveFilter key={filter} label={filter} onRemove={() => setFilters((f) => f.filter((x) => x !== filter))} />
        ))}
        {filters.length > 0 && (
          <Button variant="ghost" size="xs" pad="tight" onClick={() => setFilters([])}>
            Limpar filtros
          </Button>
        )}
        <span className="hidden flex-1 sm:block" />
        <p role="status" className="text-body-sm text-ink-2">
          <strong className="font-semibold text-ink">{count === 1 ? '1 resultado' : `${count} resultados`}</strong> · mais recentes
          primeiro
        </p>
      </div>

      <div className="flex flex-wrap items-start gap-6">
        <div className="min-w-0 grow-999 basis-160 overflow-hidden rounded-md border border-line bg-panel">
          <div className="relative overflow-x-auto">
            <table className="w-full min-w-205 border-collapse text-body-sm leading-5">
              <thead>
                <HeadRow>
                  <Th>ID</Th>
                  <Th>Assunto</Th>
                  <Th>Requerente</Th>
                  <Th>Passo atual</Th>
                  <Th>Estado</Th>
                  <Th align="right">Alterado</Th>
                </HeadRow>
              </thead>
              <tbody>
                {results.map((row) => {
                  const on = row.id === selected?.id
                  return (
                    <Tr
                      key={row.id}
                      onClick={() => setSelectedId(row.id)}
                      className={cx('cursor-pointer', on ? 'bg-selected' : 'hover:bg-soft-hover')}
                    >
                      <Td pad="roomy" className="font-semibold whitespace-nowrap tabular-nums">
                        <button
                          type="button"
                          aria-pressed={on}
                          onClick={() => setSelectedId(row.id)}
                          className="font-semibold text-ink"
                        >
                          {row.id}
                        </button>
                      </Td>
                      <Td pad="roomy">
                        <Highlight text={row.match + row.rest} query={query.trim()} />
                        <br />
                        <span className="text-caption text-ink-3">Workflow v{row.version}</span>
                      </Td>
                      <Td pad="roomy">{row.requester}</Td>
                      <Td pad="roomy" className="text-ink-2">
                        {row.step}
                      </Td>
                      <Td pad="roomy">
                        <Chip tone={statusTone[row.status]} size="sm">
                          {row.status}
                        </Chip>
                      </Td>
                      <Td pad="roomy" align="right" numeric className="whitespace-nowrap text-ink-2">
                        {row.changed}
                      </Td>
                    </Tr>
                  )
                })}
                {results.length === 0 && (
                  <tr>
                    <td colSpan={6} className="p-6 text-body text-ink-2">
                      Não há procedimentos que correspondam à pesquisa.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
          {isDefault && (
            <div className="flex items-center justify-between gap-3 border-t border-line px-4 py-3.5 text-body-sm text-ink-2">
              <span>1–6 de {totalResults}</span>
              <nav aria-label="Páginas" className="flex gap-1.5">
                {[1, 2, 3, 4].map((page) => (
                  <button
                    key={page}
                    type="button"
                    aria-current={page === 1 ? 'page' : undefined}
                    aria-label={`Página ${page}`}
                    className={cx(
                      'size-9 rounded-full',
                      page === 1 ? 'bg-brand font-semibold text-on-brand' : 'text-ink-2 hover:bg-soft',
                    )}
                  >
                    {page}
                  </button>
                ))}
              </nav>
            </div>
          )}
        </div>

        {selected && (
          <aside aria-label="Procedimento selecionado" className="flex max-w-full grow basis-80 flex-col gap-4 rounded-md bg-soft p-6">
            <div className="flex flex-col gap-1">
              <span className="text-label-sm font-semibold text-ink-3 tabular-nums">
                {selected.id} · v{selected.version}
              </span>
              <h2 className="text-title-lg font-semibold">
                {selected.match}
                {selected.rest}
              </h2>
              <span className="text-body-sm text-ink-2">
                {selected.requester} · {selected.step}
              </span>
            </div>
            <Chip tone={statusTone[selected.status]} size="sm" className="self-start">
              {selected.status}
            </Chip>
            <div className="flex flex-col gap-2">
              <h3 className="text-label-sm font-semibold text-ink-3">Documentos gerados</h3>
              <ul className="flex flex-col gap-2">
                {selected.documents.map((doc) => (
                  <li key={doc} className="flex items-center gap-3 rounded-md bg-bg px-3 py-2.5">
                    <Icon name="fileText" size={20} className="text-accent-ink" />
                    <span className="flex-1 text-body-sm font-semibold">{doc}</span>
                    <Button variant="ghost" size="xs" pad="tight" aria-label={`Transferir ${doc}`}>
                      Transferir
                    </Button>
                  </li>
                ))}
              </ul>
            </div>
            <Button to={selected.to} block>
              Abrir procedimento
            </Button>
          </aside>
        )}
      </div>
    </AppLayout>
  )
}

function FilterMenuButton({ label }: { label: string }) {
  return (
    <button
      type="button"
      className="inline-flex min-h-10 items-center gap-1.5 rounded-pill border border-line-strong bg-bg px-4 text-body-sm text-ink hover:bg-soft"
    >
      {label}
      <Icon name="chevronDown" size={14} />
    </button>
  )
}

function ActiveFilter({ label, onRemove }: { label: string; onRemove: () => void }) {
  return (
    <span className="inline-flex min-h-10 items-center gap-2 rounded-pill border-emph border-orange bg-accent-soft pr-1.5 pl-4 text-body-sm font-semibold">
      {label}
      <button
        type="button"
        onClick={onRemove}
        aria-label={`Remover filtro ${label}`}
        className="grid size-7 place-items-center rounded-full bg-bg hover:bg-soft"
      >
        <Icon name="x" size={12} strokeWidth={2.4} />
      </button>
    </span>
  )
}
