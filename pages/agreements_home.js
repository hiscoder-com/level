import React from 'react'
import Link from 'next/link'

export default function Agreements_home() {
  return (
    <div className="LTAppbar">
      <div className="flex flex-col text-center space-y-2.5">
        <Link href="/agreements_text">
          <a className="btn-transparent w-64">Соглашения</a>
        </Link>
        <Link href="/confession_description">
          <a className="btn-transparent w-64">Исповедание веры</a>
        </Link>
        <Link href="/agreements_text">
          <a className="btn-filled w-64">Далее</a>
        </Link>
      </div>
    </div>
  )
}
Agreements_home.layoutType = 'appbar'
