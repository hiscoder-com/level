import React, { useState } from 'react'
import Head from 'next/head'

export default function Agreements_home() {
  return (
    <div className="container-center f-screen items-center">
      <Head>
        <title>V-CANA login</title>
        <meta name="description" content="VCANA" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <div className="flex flex-col space-y-2.5 w-64">
        <button className="btn-transparent">Соглашения</button>
        <button className="btn-transparent">Исповедание веры</button>
        <button className="btn-filled">Далее</button>
      </div>
    </div>
  )
}
