import Link from 'next/link'
import Gear from '../../public/gear.svg'

function Card({ children, title, link = '/' }) {
  return (
    <div className="card flex flex-col gap-7">
      <div className="flex justify-between items-center">
        <h3 className="h3 font-bold">{title}</h3>
        <Link href={link}>
          <a className="w-6">
            <Gear />
          </a>
        </Link>
      </div>
      <div>{children}</div>
    </div>
  )
}

export default Card
