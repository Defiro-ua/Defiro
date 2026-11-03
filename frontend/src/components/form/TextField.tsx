import { useId, type InputHTMLAttributes, type ReactNode } from 'react'
import { cx } from '../../lib/cx'
import { Field, type FieldLabelProps } from './Field'
import { inputClasses, type InputSize, type InputTone } from './inputClasses'

type TextFieldProps = FieldLabelProps &
  Omit<InputHTMLAttributes<HTMLInputElement>, 'size'> & {
    hint?: ReactNode
    error?: ReactNode
    after?: ReactNode
    size?: InputSize
    tone?: InputTone
    /** Tabular figures for dates, amounts and IBANs */
    numeric?: boolean
    fieldClassName?: string
    labelClassName?: string
  }

export function TextField({
  label,
  required,
  requiredTone,
  optional,
  hint,
  error,
  after,
  size = 'lg',
  tone,
  numeric,
  fieldClassName,
  labelClassName,
  className,
  id: idProp,
  ...inputProps
}: TextFieldProps) {
  const generatedId = useId()
  const id = idProp ?? generatedId
  const hintId = hint ? `${id}-hint` : undefined
  const errorId = error ? `${id}-error` : undefined
  return (
    <Field
      id={id}
      label={label}
      required={required}
      requiredTone={requiredTone}
      optional={optional}
      hint={hint}
      hintId={hintId}
      error={error}
      errorId={errorId}
      after={after}
      className={fieldClassName}
      labelClassName={labelClassName}
    >
      <input
        id={id}
        type="text"
        aria-invalid={error ? true : undefined}
        aria-describedby={cx(errorId, hintId) || undefined}
        aria-required={required || undefined}
        className={inputClasses(size, error ? 'error' : tone, cx(numeric && 'tabular-nums', className))}
        {...inputProps}
      />
    </Field>
  )
}
