import { useState } from 'react'
import { useLocation, useNavigate } from 'react-router'
import { ActionBar } from '../components/ActionBar'
import { Breadcrumb } from '../components/Breadcrumb'
import { Button } from '../components/Button'
import { Chip } from '../components/Chip'
import { FileList, type FileItem } from '../components/FileList'
import { ChoiceCard } from '../components/form/ChoiceCard'
import { FileDropzone } from '../components/form/FileDropzone'
import { FormSection } from '../components/form/FormSection'
import { RequiredMark } from '../components/form/Field'
import { ReadonlyField } from '../components/form/ReadonlyField'
import { SelectField } from '../components/form/SelectField'
import { TextField } from '../components/form/TextField'
import { Icon } from '../components/Icon'
import { AppLayout } from '../components/layout/AppLayout'
import { Notice } from '../components/Notice'
import { Accent, PageTitle } from '../components/PageTitle'
import { Panel } from '../components/Panel'
import { ProcedureProgress } from '../components/ProcedureProgress'
import { SignDialog } from '../components/request/SignDialog'
import { SectionTitle } from '../components/SectionTitle'
import { HeadRow, TableFrame, Td, Th, Tr } from '../components/Table'
import {
  completedChecks,
  estimate,
  initialAttachments,
  initialExpenses,
  requesterProfile,
  requestSteps,
  transportOptions,
  tripReasons,
} from '../data/requests'
import { formatFileSize } from '../lib/format'
import { cx } from '../lib/cx'
import { paths } from '../routes'

/** E04 · Formulário do pedido (UC13, UC14, UC15, UC22). On `/assinar` the CMD dialog (E05) opens on top. */
export function RequestFormPage() {
  const navigate = useNavigate()
  const signing = useLocation().pathname === paths.sign

  const [reason, setReason] = useState(tripReasons[0])
  const [destination, setDestination] = useState('Lisboa')
  const [description, setDescription] = useState('Formação em Contratação Pública')
  const [departure, setDeparture] = useState('01/10/2026 07:30')
  const [returnAt, setReturnAt] = useState('')
  const [certStart, setCertStart] = useState('01/10/2026')
  const [certEnd, setCertEnd] = useState('02/10/2026')
  const [iban, setIban] = useState('PT50 0035 0000 1234 5678 9015 4')
  const [transport, setTransport] = useState(transportOptions[1])
  const [expenses, setExpenses] = useState(initialExpenses)
  const [attachments, setAttachments] = useState<FileItem[]>(initialAttachments)

  // The only document missing in the mockup is the attendance certificate:
  // any file added by the person counts as that certificate.
  const hasCertificate = attachments.length > initialAttachments.length
  const missing = [
    !returnAt && 'Data e hora de regresso',
    !hasCertificate && 'Certificado de presença',
    !returnAt && 'Datas do certificado e da deslocação por comparar',
  ].filter((item): item is string => Boolean(item))
  const missingFields = [!returnAt, !hasCertificate].filter(Boolean).length
  const ready = missingFields === 0

  function addFiles(files: File[]) {
    setAttachments((current) => [
      ...current,
      ...files
        .filter((file) => !current.some((existing) => existing.name === file.name))
        .map((file) => ({ name: file.name, meta: formatFileSize(file.size) })),
    ])
  }

  return (
    <AppLayout user="ana" nav={{ active: 'novo', inboxCount: 0 }} withSidebar={false} width="detail" compactTop gap="gap-8">
      <header className="flex flex-col gap-3.5">
        <Breadcrumb trail={[{ label: 'Novo pedido', to: paths.newRequest }]} current="Ajudas de custo" />
        <div className="flex flex-wrap items-center gap-x-4 gap-y-3">
          <PageTitle>
            Ajudas de <Accent>custo</Accent>
          </PageTitle>
          <Chip dot>Rascunho</Chip>
        </div>
      </header>

      <ProcedureProgress steps={requestSteps} current={0} />

      <div className="flex flex-wrap items-start gap-8">
        <form
          className="flex min-w-0 grow-999 basis-140 flex-col gap-6"
          onSubmit={(event) => {
            event.preventDefault()
            if (ready) navigate(paths.sign)
          }}
        >
          <p className="text-body-sm text-ink-3">
            <span aria-hidden="true" className="font-semibold text-accent-ink">
              *
            </span>{' '}
            Campo obrigatório
          </p>

          <FormSection legend="Os seus dados">
            <p className="-mt-2 text-body-sm text-ink-3">Vêm do seu perfil municipal (Microsoft Entra ID) e não se editam aqui.</p>
            <div className="flex flex-wrap gap-x-6 gap-y-5">
              {requesterProfile.map((field) => (
                <ReadonlyField key={field.label} label={field.label} value={field.value} source="Entra ID" className="grow basis-65" />
              ))}
            </div>
          </FormSection>

          <FormSection legend="Dados fiscais e bancários">
            <div className="flex flex-wrap gap-x-6 gap-y-5">
              <ReadonlyField
                label="NIF"
                value="2•• ••• 418"
                source="Chave Móvel Digital"
                hint="Preenchido pela Chave Móvel Digital."
                numeric
                className="grow basis-65"
              />
              <TextField
                label="IBAN"
                required
                value={iban}
                onChange={(event) => setIban(event.target.value)}
                hint="A conta onde quer receber o reembolso."
                numeric
                autoComplete="off"
                fieldClassName="grow basis-65"
              />
            </div>
          </FormSection>

          <FormSection legend="Deslocação">
            <div className="flex flex-wrap gap-x-6 gap-y-5">
              <SelectField
                label="Motivo"
                required
                options={tripReasons}
                value={reason}
                onChange={(event) => setReason(event.target.value)}
                fieldClassName="grow basis-65"
              />
              <TextField
                label="Destino"
                required
                value={destination}
                onChange={(event) => setDestination(event.target.value)}
                fieldClassName="grow basis-65"
              />
            </div>
            <TextField label="Descrição" value={description} onChange={(event) => setDescription(event.target.value)} />
            <div className="flex flex-wrap gap-x-6 gap-y-5">
              <TextField
                label="Partida"
                required
                value={departure}
                onChange={(event) => setDeparture(event.target.value)}
                numeric
                fieldClassName="grow basis-65"
              />
              <TextField
                label="Regresso"
                required
                placeholder="dd/mm/aaaa hh:mm"
                value={returnAt}
                onChange={(event) => setReturnAt(event.target.value)}
                error={returnAt ? undefined : 'Indique a data e hora de regresso'}
                numeric
                fieldClassName="grow basis-65"
              />
            </div>

            <fieldset className="flex flex-col gap-2.5 rounded-md border border-line bg-tint px-5 py-4.5">
              <legend className="float-left mb-2.5 text-body-sm leading-5 font-semibold">
                Datas no certificado de presença <RequiredMark />
              </legend>
              <div className="clear-both flex flex-wrap gap-x-6 gap-y-4">
                <TextField
                  label="Início"
                  value={certStart}
                  onChange={(event) => setCertStart(event.target.value)}
                  numeric
                  labelClassName="text-label-sm font-normal text-ink-2"
                  fieldClassName="grow basis-55"
                />
                <TextField
                  label="Fim"
                  value={certEnd}
                  onChange={(event) => setCertEnd(event.target.value)}
                  numeric
                  labelClassName="text-label-sm font-normal text-ink-2"
                  fieldClassName="grow basis-55"
                />
              </div>
              <p className="text-label-sm leading-4.75 text-ink-3">
                Copie as datas do certificado. O sistema compara-as com as datas da deslocação ao submeter e de novo na validação final.
              </p>
              {!returnAt && (
                <p className="flex items-center gap-1.5 text-label-sm font-semibold text-warning">
                  <Icon name="alertCircle" size={16} />
                  Ainda não dá para comparar: falta a data de regresso.
                </p>
              )}
            </fieldset>

            <fieldset className="flex flex-col gap-2.5">
              <legend className="float-left mb-2.5 text-body-sm leading-5 font-semibold">
                Transporte <RequiredMark />
              </legend>
              <div className="clear-both flex flex-wrap gap-3">
                {transportOptions.map((option) => (
                  <ChoiceCard
                    key={option}
                    name="transporte"
                    value={option}
                    checked={transport === option}
                    onSelect={setTransport}
                    indicator="native"
                    emphasis="strong"
                    outline="field"
                    gap="gap-2.5"
                    className={cx('min-h-12 px-4.5 text-label-md', transport === option && 'font-semibold')}
                  >
                    {option}
                  </ChoiceCard>
                ))}
              </div>
            </fieldset>
          </FormSection>

          <FormSection legend="Despesas" className="gap-4">
            <TableFrame>
              <table className="w-full min-w-130 border-collapse text-body">
                <thead>
                  <HeadRow>
                    <Th>Tipo</Th>
                    <Th>Data</Th>
                    <Th align="right">Valor</Th>
                    <Th className="w-14">
                      <span className="sr-only">Ações</span>
                    </Th>
                  </HeadRow>
                </thead>
                <tbody>
                  {expenses.map((expense) => (
                    <Tr key={expense.id}>
                      <Td>{expense.type}</Td>
                      <Td numeric>{expense.date}</Td>
                      <Td align="right" numeric>
                        {expense.amount}
                      </Td>
                      <Td align="right" pad="action">
                        <button
                          type="button"
                          aria-label={`Remover despesa ${expense.type}`}
                          onClick={() => setExpenses((list) => list.filter((e) => e.id !== expense.id))}
                          className="grid size-11 place-items-center rounded-sm text-ink-3 hover:bg-soft hover:text-ink"
                        >
                          <Icon name="x" size={18} />
                        </button>
                      </Td>
                    </Tr>
                  ))}
                </tbody>
              </table>
            </TableFrame>
            <Button variant="ghost" size="sm" icon="plus" pad="tight" className="self-start">
              Adicionar despesa
            </Button>
          </FormSection>

          <FormSection legend="Anexos" required className="gap-4">
            <FileDropzone onFiles={addFiles} />
            <FileList
              files={attachments}
              label="Ficheiros juntos"
              renderAction={(file) => (
                <button
                  type="button"
                  aria-label={`Remover ${file.name}`}
                  onClick={() => setAttachments((list) => list.filter((f) => f.name !== file.name))}
                  className="grid size-11 shrink-0 place-items-center rounded-sm text-ink-3 hover:bg-bg hover:text-ink"
                >
                  <Icon name="x" size={18} />
                </button>
              )}
            />
            {!hasCertificate && (
              <Notice tone="warning" className="items-center py-3">
                Falta o certificado de presença na formação.
              </Notice>
            )}
          </FormSection>

          <ActionBar
            message={
              ready ? (
                <span className="flex items-center gap-2 font-semibold text-success">
                  <Icon name="check" size={18} />
                  Tudo preenchido
                </span>
              ) : (
                <span id="faltam" className="flex items-center gap-2 font-semibold text-warning">
                  <Icon name="alertCircle" size={18} />
                  {missingFields === 1 ? 'Falta 1 campo obrigatório' : `Faltam ${missingFields} campos obrigatórios`}
                </span>
              )
            }
          >
            <Button variant="secondary">Guardar rascunho</Button>
            <Button type="submit" icon="pen" disabled={!ready} aria-describedby={ready ? undefined : 'antes-de-submeter'}>
              Submeter e assinar
            </Button>
          </ActionBar>
        </form>

        <aside aria-label="Resumo do pedido" className="flex max-w-full grow basis-80 flex-col gap-6">
          <Panel variant="soft" className="flex flex-col gap-3.5">
            <SectionTitle>Resumo</SectionTitle>
            <dl className="flex flex-col gap-2.5 text-body">
              {estimate.lines.map((line) => (
                <div key={line.label} className="flex justify-between gap-3">
                  <dt className="text-ink-2">{line.label}</dt>
                  <dd className="tabular-nums">{line.value}</dd>
                </div>
              ))}
              <div className="flex items-baseline justify-between gap-3 border-t border-line-strong pt-3">
                <dt className="font-semibold">Total estimado</dt>
                <dd className="text-stat tabular-nums">{estimate.total}</dd>
              </div>
            </dl>
            <p className="text-label-sm leading-4.75 text-ink-3">{estimate.note}</p>
          </Panel>

          <Panel className="flex flex-col gap-3.5">
            <SectionTitle id="antes-de-submeter">Antes de submeter</SectionTitle>
            <ul className="flex flex-col gap-3 text-body">
              {missing.map((item) => (
                <li key={item} className="flex gap-2.5 font-semibold text-warning">
                  <Icon name="alertCircle" size={20} />
                  <span>
                    <span className="sr-only">Em falta: </span>
                    {item}
                  </span>
                </li>
              ))}
              {[...(returnAt ? ['Data e hora de regresso', 'Datas do certificado e da deslocação'] : []), ...(hasCertificate ? ['Certificado de presença'] : []), ...completedChecks].map(
                (item) => (
                  <li key={item} className="flex gap-2.5 text-ink-2">
                    <Icon name="check" size={20} strokeWidth={2} className="text-success" />
                    <span>
                      <span className="sr-only">Feito: </span>
                      {item}
                    </span>
                  </li>
                ),
              )}
            </ul>
            <p className="text-label-sm leading-4.75 text-ink-3">
              Depois de submeter, assina com a Chave Móvel Digital e o pedido segue para as chefias da Divisão de Obras Municipais.
            </p>
          </Panel>
        </aside>
      </div>

      {signing && <SignDialog open onCancel={() => navigate(paths.requestForm)} />}
    </AppLayout>
  )
}
