import Link from 'next/link'

export default function Agreements() {
  return (
    <div className="layout-appbar">
      <div className="flex flex-col text-center space-y-2.5">
        <Link href="/user-agreement">
          <a className="btn-transparent w-64">Соглашение</a>
        </Link>
        <Link href="/confession">
          <a className="btn-transparent w-64">Исповедание веры</a>
        </Link>
        <Link href="/user-agreement">
          <a className="btn-filled w-64">Далее</a>
        </Link>
      </div>
    </div>
  )
}

Agreements.backgroundColor = 'bg-white'
