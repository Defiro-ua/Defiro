import { useRef, useState } from 'react'
import { ActionBar } from '../components/ActionBar'
import { Breadcrumb } from '../components/Breadcrumb'
import { Button } from '../components/Button'
import { Chip } from '../components/Chip'
import { FileList, type FileItem } from '../components/FileList'
import { FormSection } from '../components/form/FormSection'
import { TextField } from '../components/form/TextField'
import { Icon } from '../components/Icon'
import { AppLayout } from '../components/layout/AppLayout'
import { Accent, PageTitle } from '../components/PageTitle'
import { Panel } from '../components/Panel'
import { ProcedureProgress } from '../components/ProcedureProgress'
import { ReviewerNote } from '../components/ReviewerNote'
import { SectionTitle } from '../components/SectionTitle'
import { TextLink } from '../components/TextLink'
import { correctionAttachments, correctionSteps, returnNotice, reviewerNotes } from '../data/requests'
import { formatFileSize } from '../lib/format'
import { paths } from '../routes'

const NEW_FILE = 'certificado_presenca.pdf'

/** E07 · Corrigir pedido devolvido (UC19, UC20) */
export function CorrectRequestPage() {
  const [destination, setDestination] = useState('Lisboa')
  const [departure, setDeparture] = useState('01/10/2026 07:30')
  const [returnAt, setReturnAt] = useState('02/10/2026 19:10')
  const [files, setFiles] = useState<FileItem[]>(correctionAttachments)
  const fileInput = useRef<HTMLInputElement>(null)
  const noteFor = (field: string) => reviewerNotes.find((note) => note.field === field)!

  return (
    <AppLayout user="ana" nav={{ active: 'meus', inboxCount: 0 }} width="detail" compactTop>
      <header className="flex flex-col gap-3.5">
        <Breadcrumb trail={[{ label: 'Os meus pedidos', to: paths.myRequests }]} current="AC-2026-0147" />
        <div className="flex flex-wrap items-center gap-x-4 gap-y-3">
          <PageTitle>
            Corrigir <Accent>pedido</Accent>
          </PageTitle>
          <Chip tone="warning" dot>
            Devolvido para correção
          </Chip>
          <span className="text-body-sm text-ink-3">Ajudas de custo · Formação em Contratação Pública</span>
        </div>
      </header>

      <section aria-label="Motivo da devolução" className="flex gap-3.5 rounded-md bg-warning-soft px-6 py-5 text-warning">
        <Icon name="undo" size={22} className="mt-0.5" />
        <div className="flex flex-col gap-1.5 text-body leading-5.75">
          <strong className="font-semibold text-ink">{returnNotice.title}</strong>
          <span>{returnNotice.quote}</span>
        </div>
      </section>

      <ProcedureProgress steps={correctionSteps} current={0}>
        <Chip tone="warning" size="sm" icon="undo" className="self-end sm:absolute sm:top-4 sm:right-6">
          Voltou do passo 2
        </Chip>
      </ProcedureProgress>

      <div className="flex flex-wrap items-start gap-8">
        <form className="flex min-w-0 grow-999 basis-140 flex-col gap-6" onSubmit={(event) => event.preventDefault()}>
          <FormSection legend="Os seus dados" layout="row">
            <span className="text-body">Ana Ferreira · Divisão de Obras Municipais · Técnica Superior</span>
            <span className="inline-flex items-center gap-1 text-caption font-semibold text-ink-3">
              <Icon name="lock" size={14} />
              Entra ID · sem alterações
            </span>
          </FormSection>

          <FormSection legend="Deslocação">
            <div className="flex flex-wrap gap-x-6 gap-y-5">
              <TextField
                label="Destino"
                required
                value={destination}
                onChange={(event) => setDestination(event.target.value)}
                fieldClassName="grow basis-65"
              />
              <TextField
                label="Partida"
                required
                value={departure}
                onChange={(event) => setDeparture(event.target.value)}
                numeric
                fieldClassName="grow basis-65"
              />
            </div>
            <TextField
              id={noteFor('Regresso').anchor}
              label="Regresso"
              required
              tone="flagged"
              value={returnAt}
              onChange={(event) => setReturnAt(event.target.value)}
              numeric
              fieldClassName="max-w-field"
              after={
                <ReviewerNote author="Rui Matos · 10/10/2026" className="mt-1">
                  {noteFor('Regresso').text}
                </ReviewerNote>
              }
            />
          </FormSection>

          <FormSection legend="Despesas" layout="row" className="justify-between">
            <span className="text-body text-ink-2">3 despesas · comboio, alojamento e ajudas de custo</span>
            <span className="text-body-lg font-extrabold tabular-nums">187,40 €</span>
          </FormSection>

          <FormSection legend="Anexos" required flagged id={noteFor('Anexos').anchor} className="gap-4">
            <ReviewerNote author="Rui Matos · 10/10/2026">{noteFor('Anexos').text}</ReviewerNote>
            <FileList
              files={files}
              label="Ficheiros juntos"
              renderAction={(file) =>
                file.name === NEW_FILE ? (
                  <Chip tone="success" size="xs">
                    Novo
                  </Chip>
                ) : null
              }
            />
            <input
              ref={fileInput}
              type="file"
              multiple
              accept=".pdf,.jpg,.jpeg,.png"
              tabIndex={-1}
              aria-hidden="true"
              className="sr-only"
              onChange={(event) => {
                const added = Array.from(event.target.files ?? []).map((f) => ({ name: f.name, meta: formatFileSize(f.size) }))
                setFiles((current) => [...current, ...added.filter((a) => !current.some((c) => c.name === a.name))])
                event.target.value = ''
              }}
            />
            <Button variant="ghost" size="sm" icon="plus" pad="tight" className="self-start" onClick={() => fileInput.current?.click()}>
              Juntar ficheiro
            </Button>
          </FormSection>

          <ActionBar message={<span className="text-ink-2">Ao reenviar, assina de novo com a Chave Móvel Digital.</span>}>
            <Button to={paths.sign} icon="pen" glow>
              Reenviar e assinar
            </Button>
          </ActionBar>
        </form>

        <aside aria-label="Notas do revisor" className="flex max-w-full grow basis-80 flex-col gap-6">
          <Panel variant="soft" className="flex flex-col gap-3.5">
            <SectionTitle>Notas do revisor · {reviewerNotes.length}</SectionTitle>
            {reviewerNotes.map((note) => (
              <div key={note.field} className="flex flex-col gap-1 rounded-md bg-bg px-3.5 py-3">
                <h3 className="text-body-sm font-semibold">{note.field}</h3>
                <p className="text-body-sm text-ink-2">{note.text}</p>
                <TextLink href={`#${note.anchor}`} size="xs" className="min-h-8 self-start">
                  Ir para o campo
                </TextLink>
              </div>
            ))}
          </Panel>
          <Panel className="flex flex-col gap-2.5">
            <SectionTitle>Depois de reenviar</SectionTitle>
            <p className="text-body-sm text-ink-2">
              Assina de novo com a Chave Móvel Digital e o pedido volta a percorrer todos os passos, a começar pela Validação da
              chefia.
            </p>
          </Panel>
        </aside>
      </div>
    </AppLayout>
  )
}
