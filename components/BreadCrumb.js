import Link from 'next/link'
import LeftArrow from 'public/left-big-arrow.svg'

function BreadCrumb({ links = [], full }) {
  const arrowLink = links?.length > 1 ? links[links?.length - 2]?.href : links[0].href
  return (
    <div className={`${full ? 'card' : ''}`}>
      <div className="flex items-center gap-2">
        <Link href={arrowLink}>
          <a className="w-6 min-w-[1.5rem]">
            <LeftArrow />
          </a>
        </Link>
        {links?.map((link, index) => (
          <div className="flex" key={index}>
            {index === links.length - 1 ? (
              <h3 className="text-2xl font-bold">{link.title}</h3>
            ) : (
              <Link href={link.href}>
                <a className="flex items-center gap-3">
                  <h3 className="text-2xl font-bold">{link.title}</h3>
                </a>
              </Link>
            )}
            {index !== links.length - 1 && (
              <span className="ml-2 text-2xl font-bold">/</span>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}

export default BreadCrumb
