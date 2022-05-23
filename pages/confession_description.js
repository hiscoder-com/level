import React from 'react'
import Link from 'next/link'

export default function Confession_description() {
  return (
    <div className="LTAppbar">
      <div className="text-center max-w-lg">
        <p className="h1 mb-6">Исповедание веры:</p>
        <p className="h5 mb-2">
          согласуется с историческими символами веры:
          <br /> Апостольский символ веры, Никейский символ веры, и Афанасьевский символ
          веры; а также Lausanne Covenant.
        </p>
        <p className="h6 font-light">
          Официальная версия этого документа находится на сайте
          <a href="https://www.unfoldingword.org/"> https://www.unfoldingword.org/</a>
        </p>
        <Link href="/confession_text">
          <a className="btn-filled w-28 mt-7">Начать</a>
        </Link>
      </div>
    </div>
  )
}
Confession_description.layoutType = 'appbar'
