import { useContext } from 'react'

import Link from 'next/link'
import { AppContext } from '../lib/AppContext'

export default function Footer({ textCheckbox, textButton, href }) {
  // const [checked, setChecked] = useState(false)
  // const { introductionStep, setIntroductionStep } = useContext(AppContext)
  const { state } = useContext(AppContext)
  console.log(state)

  return (
    <div className="max-w-7xl w-full mx-auto flex justify-end items-center px-4 bg-blue-150">
      <div className="relative flex items-center h-16">
        <div className="flex flex-row items-center space-x-6">
          <div className="space-x-1.5 items-center h4">
            <input
              className="cursor-pointer"
              id="cb"
              type="checkbox"
              checked={introductionStep}
              onChange={() => setIntroductionStep((prev) => !prev)}
            />
            <label className="cursor-pointer" htmlFor="cb">
              {textCheckbox}
            </label>
          </div>
          <Link href={href}>
            <button className="btn-cyan w-28" disabled={!introductionStep}>
              {textButton}
            </button>
          </Link>
        </div>
      </div>
    </div>
  )
}
