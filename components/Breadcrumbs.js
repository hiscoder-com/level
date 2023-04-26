import Link from 'next/link'
import LeftArrow from 'public/left.svg'
import { Fragment } from 'react'

function Breadcrumbs({ links = [], full }) {
  const arrowLink = links?.length > 1 ? links[links?.length - 2]?.href : links[0].href
  return (
    <div className={`${full ? 'card' : ''}`}>
      <div className="flex flex-row overflow-x-auto whitespace-nowrap items-center gap-2 text-lg font-bold">
        <Link href={arrowLink}>
          <a>
            <LeftArrow className="h-5 w-5 min-w-[1.25rem]" />
          </a>
        </Link>
        {links?.map((link, index) => (
          <Fragment key={index}>
            {index === links.length - 1 ? (
              <h3>{link.title}</h3>
            ) : (
              <Link href={link.href}>
                <a>{link.title}</a>
              </Link>
            )}
            {index !== links.length - 1 && <span>/</span>}
          </Fragment>
        ))}
      </div>
    </div>
  )
}

export default Breadcrumbs
