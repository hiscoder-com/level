import React, { useEffect, useState } from 'react'
import Link from 'next/link'

export default function Footer() {
  const [checked, setChecked] = useState(false)
  const [disabledButton, setDisabledButton] = useState(false)
  const [nextHref, setNextHref] = useState('')

  useEffect(() => {
    if (checkUrl('agreements_text')) {
      setNextHref('confession_description')
    } else if (checkUrl('confession_text')) {
      setNextHref('') // пока нет страницы личный кабинет перевод сделал на главную
    }
  }, [nextHref])

  useEffect(() => {
    setDisabledButton(!disabledButton)
  }, [checked])

  return (
    <div className="border-t">
      <div className="max-w-7xl mx-auto flex justify-end items-center px-4">
        <div className="relative flex items-center h-16 ">
          {/* the confirmation & button "Next" */}
          <div className="flex flex-row items-center space-x-6">
            {/* the confirmation button */}
            <div className="space-x-1.5 items-center h4">
              <input
                type="checkbox"
                checked={checked}
                onChange={() => setChecked(!checked)}
              />
              <label>Согласен</label>
            </div>
            <Link href={`/${nextHref}`}>
              <button className="btn-filled w-28" disabled={disabledButton}>
                <a>Далее</a>
              </button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}

const checkUrl = (url) => {
  return window.location.href.toString().includes(url)
}
