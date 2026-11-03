import { Button } from '../Button'
import { Icon } from '../Icon'
import { Panel } from '../Panel'
import { SectionTitle } from '../SectionTitle'
import { TextareaField } from '../form/TextareaField'
import { TextLink } from '../TextLink'

export type ChangeDecision = '' | 'rejecting' | 'approved' | 'rejected'

type DecisionPanelProps = {
  id: string
  version: string
  /** "workflow" or "regra", used in the history note */
  subject: 'workflow' | 'regra'
  decision: ChangeDecision
  onDecision: (decision: ChangeDecision) => void
  rejectPlaceholder?: string
  rejectDraft: string
  rejectHint: string
  approvedText: string
  rejectedText: string
  historyLink?: string
}

/** Approve, or reject with a mandatory comment, a submitted change. */
export function DecisionPanel({
  id,
  version,
  subject,
  decision,
  onDecision,
  rejectPlaceholder,
  rejectDraft,
  rejectHint,
  approvedText,
  rejectedText,
  historyLink,
}: DecisionPanelProps) {
  return (
    <Panel elevated aria-labelledby={id} className="flex flex-col gap-3.5">
      <SectionTitle id={id}>Decisão</SectionTitle>

      {decision === '' && (
        <>
          <p className="text-body-sm text-ink-2">
            Depois de aprovada, a Sofia escolhe a data em que a {version} entra em vigor. Para rejeitar, o comentário é
            obrigatório.
          </p>
          <Button icon="check" glow block onClick={() => onDecision('approved')}>
            Aprovar
          </Button>
          <Button variant="danger-outline" block onClick={() => onDecision('rejecting')}>
            Rejeitar com comentários
          </Button>
          <p className="text-label-sm leading-4.75 text-ink-3">
            A decisão fica registada no histórico {subject === 'workflow' ? 'do workflow' : 'da regra'}, com o seu nome e a
            hora.
          </p>
        </>
      )}

      {decision === 'rejecting' && (
        <>
          <TextareaField
            label="O que tem de mudar"
            required
            requiredTone="error"
            rows={4}
            autoFocus
            placeholder={rejectPlaceholder}
            defaultValue={rejectDraft}
            hint={rejectHint}
          />
          <Button variant="danger" block onClick={() => onDecision('rejected')}>
            Rejeitar e enviar comentário
          </Button>
          <Button variant="ghost" size="sm" block onClick={() => onDecision('')}>
            Cancelar
          </Button>
        </>
      )}

      {decision === 'approved' && (
        <div role="status" className="flex flex-col gap-3 rounded-md bg-success-soft p-4.5">
          <span className="flex items-center gap-2.5 text-title-md font-semibold text-success">
            <span aria-hidden="true" className="grid size-7 place-items-center rounded-full bg-success text-on-status">
              <Icon name="check" size={16} strokeWidth={2.4} />
            </span>
            Aprovou a {version}
          </span>
          <span className="text-body-sm text-ink-2">{approvedText}</span>
          {historyLink && <TextLink to={historyLink}>Ver histórico de versões</TextLink>}
        </div>
      )}

      {decision === 'rejected' && (
        <div role="status" className="flex flex-col gap-3 rounded-md bg-error-soft p-4.5">
          <span className="text-title-md font-semibold text-error">Rejeitou a {version}</span>
          <span className="text-body-sm text-ink-2">{rejectedText}</span>
        </div>
      )}
    </Panel>
  )
}
