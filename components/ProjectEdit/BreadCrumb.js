import Link from 'next/link'
import LeftArrow from 'public/left-big-arrow.svg'

function BreadCrumb({ links = [], full }) {
  return (
    <div className={`${full ? 'bread-crumb lg:w-2/3w-full' : ''} `}>
      <div className="flex items-center gap-2 ">
        <LeftArrow />
        {links?.map((link, index) => (
          <div className="flex" key={link.title}>
            <Link href={link.href}>
              <a className="flex items-center gap-3">
                <h3 className="h3 font-bold">{link.title}</h3>
              </a>
            </Link>
            {index !== links.length - 1 && <span className="h3">/</span>}
          </div>
        ))}
      </div>
    </div>
  )
}

export default BreadCrumb
