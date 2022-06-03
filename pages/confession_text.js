import React from 'react'
import Left_arrow from '../public/left_arrow.svg'
import Right_arrow from '../public/right_arrow.svg'

export default function Confession_text() {
  return (
    <div className="LTAppbar flex-col gap-7">
      <div className="h1">Исповедание веры:</div>
      <div className="flex flex-row h-72 gap-4">
        <div className="arrow">
          <Left_arrow />
        </div>
        <div className="confession-text">
          Главные верования являются определяющими для последователей Иисуса Христа.
          <br /> С ними нельзя идти на компромисс и их нельзя игнорировать.
        </div>
        <div className="arrow">
          <Right_arrow />
        </div>
      </div>
    </div>
  )
}
Confession_text.layoutType = 'appbarStartFooter'
