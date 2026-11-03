import { useId, type SelectHTMLAttributes } from 'react'
import { Field, type FieldLabelProps } from './Field'
import { inputClasses } from './inputClasses'

type SelectFieldProps = FieldLabelProps &
  SelectHTMLAttributes<HTMLSelectElement> & {
    options: string[]
    fieldClassName?: string
  }

export function SelectField({
  label,
  required,
  requiredTone,
  optional,
  options,
  fieldClassName,
  className,
  ...selectProps
}: SelectFieldProps) {
  const id = useId()
  return (
    <Field
      id={id}
      label={label}
      required={required}
      requiredTone={requiredTone}
      optional={optional}
      className={fieldClassName}
    >
      <select id={id} aria-required={required || undefined} className={inputClasses('lg', 'default', className)} {...selectProps}>
        {options.map((option) => (
          <option key={option}>{option}</option>
        ))}
      </select>
    </Field>
  )
}
