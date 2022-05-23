import React from 'react'

export default function Agreements_home() {
  return (
    <div className="LTAppbar">
      <div className="flex flex-col space-y-2.5">
        <a href="/agreements_text">
          <button className="btn-transparent w-64">Соглашения</button>
        </a>
        <a href="/confession_description">
          <button className="btn-transparent w-64">Исповедание веры</button>
        </a>
        <a href="/agreements_text">
          <button className="btn-filled w-64">Далее</button>
        </a>
      </div>
    </div>
  )
}
Agreements_home.layoutType = 'appbar'
