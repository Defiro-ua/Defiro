import { Link } from 'react-router'

type BreadcrumbProps = {
  /** Parent pages, in order */
  trail: Array<{ label: string; to: string }>
  /** Current page */
  current: string
}

export function Breadcrumb({ trail, current }: BreadcrumbProps) {
  return (
    <nav aria-label="Caminho" className="text-body-sm text-ink-3">
      <ol className="flex flex-wrap items-center gap-1">
        {trail.map((item) => (
          <li key={item.to} className="flex items-center gap-1">
            <Link to={item.to}>{item.label}</Link>
            <span aria-hidden="true">/</span>
          </li>
        ))}
        <li aria-current="page">{current}</li>
      </ol>
    </nav>
  )
}
