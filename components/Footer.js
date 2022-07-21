import { useEffect, useState } from 'react'

import { useRouter } from 'next/router'
import Link from 'next/link'

export default function Footer({ href, textCheckbox, textButton, handleClick }) {
  const router = useRouter()
  const [checked, setChecked] = useState(false)

  const { step } = router?.query

  useEffect(() => {
    setChecked(false)
  }, [step])

  return (
    <div className="max-w-7xl w-full mx-auto flex justify-end items-center px-4 bg-blue-150">
      <div className="relative flex items-center h-16">
        <div className="flex flex-row items-center space-x-6">
          <div className="space-x-1.5 items-center h4">
            <input
              className="cursor-pointer"
              id="cb"
              type="checkbox"
              checked={checked}
              onChange={() => setChecked((prev) => !prev)}
            />
            <label className="cursor-pointer" htmlFor="cb">
              {textCheckbox}
            </label>
          </div>
          <Link href={href}>
            <button onClick={handleClick} className="btn-cyan w-28" disabled={!checked}>
              {textButton}
            </button>
          </Link>
        </div>
      </div>
    </div>
  )
}
