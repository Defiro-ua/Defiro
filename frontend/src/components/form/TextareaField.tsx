import { useId, type ReactNode, type TextareaHTMLAttributes } from 'react'
import { cx } from '../../lib/cx'
import { Field, type FieldLabelProps } from './Field'
import { textareaClasses, type InputTone } from './inputClasses'

type TextareaFieldProps = FieldLabelProps &
  TextareaHTMLAttributes<HTMLTextAreaElement> & {
    hint?: ReactNode
    /** Help text shown between the label and the box */
    description?: ReactNode
    tone?: InputTone
    fieldClassName?: string
    labelClassName?: string
    /** Keep the label for screen readers only */
    hideLabel?: boolean
  }

export function TextareaField({
  label,
  required,
  requiredTone,
  optional,
  hint,
  description,
  tone,
  fieldClassName,
  labelClassName,
  hideLabel,
  className,
  rows = 3,
  ...textareaProps
}: TextareaFieldProps) {
  const id = useId()
  const hintId = hint ? `${id}-hint` : undefined
  const descriptionId = description ? `${id}-description` : undefined
  return (
    <Field
      id={id}
      label={label}
      required={required}
      requiredTone={requiredTone}
      optional={optional}
      hint={hint}
      hintId={hintId}
      className={fieldClassName}
      labelClassName={hideLabel ? 'sr-only' : labelClassName}
    >
      {description && (
        <span id={descriptionId} className="-mt-0.5 mb-0.5 text-label-sm text-ink-3">
          {description}
        </span>
      )}
      <textarea
        id={id}
        rows={rows}
        aria-required={required || undefined}
        aria-describedby={cx(descriptionId, hintId) || undefined}
        className={textareaClasses(tone, className)}
        {...textareaProps}
      />
    </Field>
  )
}
