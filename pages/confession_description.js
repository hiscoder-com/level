import React, { useState } from 'react'
import Head from 'next/head'

export default function Confession_description() {
  return (
    <div className="container-center f-screen items-center">
      <div className="text-center max-w-lg px-2">
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
        <button className="btn-filled w-28 mt-7">Начать</button>
      </div>
    </div>
  )
}
