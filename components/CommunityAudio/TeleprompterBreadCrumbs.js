import Link from 'next/link'

import LeftArrow from 'public/icons/left.svg'

export default function Breadcrumbs({ full, title, backLink }) {
  return (
    <div className={full ? 'card bg-th-secondary-10' : ''}>
      <div className="relative flex flex-row items-center justify-center gap-2 overflow-x-auto whitespace-nowrap text-lg font-bold">
        <Link href={backLink} className="absolute left-0 right-0 h-5 w-5">
          <LeftArrow className="h-5 w-5 min-w-[1.25rem] text-th-primary-200 hover:opacity-70" />
        </Link>
        <h1>{title}</h1>
      </div>
    </div>
  )
}
