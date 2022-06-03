import React, { useEffect, useState } from 'react'

export default function Footer() {
  const [checked, setChecked] = useState(false)
  const [disabledButton, setDisabledButton] = useState(false)

  useEffect(() => {
    setDisabledButton(!disabledButton)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [checked])

  return (
    // <div className="border-t">
    <div>
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
            <button className="btn-filled w-28" disabled={disabledButton}>
              Далее
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
