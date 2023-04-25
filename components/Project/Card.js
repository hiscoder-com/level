import Link from 'next/link'
import Gear from '/public/gear.svg'

function Card({ children, title, link = '/', access }) {
  return (
    <div className="card flex flex-col gap-7 h-full">
      <div className="flex justify-between items-start gap-7">
        <h3 className="h3 font-bold truncate">{title}</h3>
        {access && (
          <Link href={link}>
            <a className="w-6 min-w-[1.5rem]">
              <Gear />
            </a>
          </Link>
        )}
      </div>
      <div>{children}</div>
    </div>
  )
}

export default Card
