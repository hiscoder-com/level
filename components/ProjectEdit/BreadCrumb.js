import Link from 'next/link'
import LeftArrow from '../../public/left-big-arrow.svg'

function BreadCrumb({ title, link, full }) {
  return (
    <div className={`${full ? 'bread-crumb lg:w-2/3w-full' : ''}`}>
      <Link href={link}>
        <a className="flex items-center gap-3">
          <LeftArrow />
          <h3 className="h3 font-bold">{title}</h3>
        </a>
      </Link>
    </div>
  )
}

export default BreadCrumb
