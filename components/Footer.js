import { useEffect, useState } from 'react'

import { useRouter } from 'next/router'

// handleSetAgreement почему оно тут? Тут надо только ссылку на следующий шаг
export default function Footer({ textCheckbox, textButton, handleSetAgreement }) {
  const router = useRouter()
  const [checked, setChecked] = useState(false)
  const handleClick = () => {
    if (!router) {
      return
    }
    if (router.route === '/user-agreement') handleSetAgreement()
  }
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

          <button onClick={handleClick} className="btn-cyan w-28" disabled={!checked}>
            {textButton}
          </button>
        </div>
      </div>
    </div>
  )
}
