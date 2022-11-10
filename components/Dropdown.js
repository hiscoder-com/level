import React, { useState } from 'react'
import Tools from 'public/tools.svg'
import StepGoal from './StepGoal'
import TranslationGoal from 'components/TranslationGoal'

function Dropdown({ description, user }) {
  const [open, setOpen] = useState(false)

  const closeM = () => {
    setOpen(false)
  }

  return (
    <div>
      <div
        className="relative px-3 py-4 whitespace-nowrap rounded-md"
        onClick={() => setOpen(!open)}
      >
        <a className="cursor-pointer">
          <Tools />
        </a>
      </div>

      {open && (
        <div className="absolute right-0 flex flex-col shadow-md border-2 border-cyan-600 z-40 divide-y divide-solid bg-white rounded-md">
          <StepGoal description={description} setOpen={setOpen} />
          <TranslationGoal user={user} />
        </div>
      )}
    </div>
  )
}

export default Dropdown
