import React, { useEffect, useState } from 'react'
import Left_arrow from '../public/left_arrow.svg'
import Right_arrow from '../public/right_arrow.svg'

export default function Confession_text() {
  const [checked, setChecked] = useState(false)
  const [disabledButton, setDisabledButton] = useState(false)

  useEffect(() => {
    setDisabledButton(!disabledButton)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [checked])

  return (
    <div className="LTAppbar flex-col gap-7">
      <div className="h1">Исповедание веры:</div>
      <div className="flex flex-row h-72 gap-4">
        <div className="flex items-center">
          <div className="arrow">
            <Left_arrow />
          </div>
        </div>
        <div className="confession-text">
          Главные верования являются определяющими для последователей Иисуса Христа.
          <br /> С ними нельзя идти на компромисс и их нельзя игнорировать.
        </div>
        <div className="flex items-center">
          <button className="arrow">
            <Right_arrow />
          </button>
        </div>
      </div>
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
  )
}
Confession_text.layoutType = 'appbarStartFooter'
