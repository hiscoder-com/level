/* eslint-disable react/jsx-key */
import React, { useEffect, useState } from 'react'
import Left_arrow from '../public/left_arrow.svg'
import Right_arrow from '../public/right_arrow.svg'

export default function Confession_text() {
  const [checked, setChecked] = useState(false)
  const [disabledButton, setDisabledButton] = useState(false)
  const [page, setPage] = useState(0)
  const [disabledLeftArrow, setDisabledLeftArrow] = useState(false)
  const [disabledRightArrow, setDisabledRightArrow] = useState(false)
  const [confirm, setConfirm] = useState('')

  useEffect(() => {
    setDisabledButton(!disabledButton)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [checked])

  useEffect(() => {
    const objConfirm = (
      <div className="flex flex-row items-center space-x-6">
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
    )
    page == 0 ? setDisabledLeftArrow(true) : setDisabledLeftArrow(false)
    if (page == 5) {
      setDisabledRightArrow(true)
      setConfirm(objConfirm)
    } else {
      setDisabledRightArrow(false)
      setConfirm('')
    }
  }, [checked, disabledButton, page])

  const arrConfText = [
    <p>
      Главные верования являются определяющими для последователей Иисуса Христа.
      <br /> С ними нельзя идти на компромисс и их нельзя игнорировать.
    </p>,
    <ul className="list-disc">
      <li className="leading-10">
        Мы верим в то, что Библия – единственное Боговдохновенное, непогрешимое,
        достаточное, авторитетное Божье Слово (1 Фессалоникийцам 2:13; 2 Тимофею 3:16-17).
      </li>
      <li className="leading-10">
        Мы верим, что есть один Бог, вечно существующий в трёх лицах: Бог Отец, Бог Сын —
        Иисус Христос, Святой Дух. (Матфея 28:19; Иоанна 10:30).
      </li>
      <li className="leading-10">
        Мы верим в Божественность Иисуса Христа (Иоанна 1:1-4; Филиппийцам 2:5-11; 2 Петра
        1:1).
      </li>
    </ul>,
    <ul>
      <li className="leading-10">
        Мы верим в человеческую природу Иисуса Христа, в Его непорочное зачатие,
        безгрешную жизнь, чудеса, заместительную и искупительную смерть через Его пролитую
        кровь, в Его телесное воскресение и вознесение одесную Отца (Матфея 1:18,25; 1
        Коринфянам 15:1-8; Евреям 4:15; Деяния 1:9-11; Деяния 2:22-24).
      </li>
      <li className="leading-10">
        Мы верим, что каждый человек наследует греховную природу и поэтому заслуживает
        вечный ад (Римлянам 3:23; Исаия 64:6-7).
      </li>
    </ul>,
    <ul>
      <li className="leading-10">
        Мы верим, что спасение от греха является Божьим даром через жертвенную смерть и
        воскресение Иисуса Христа и принимается по благодати верой, а не делами (Иоанна
        3:16; Иоанна 14:6; Ефесянам 2:8-9, Титу 3:3-7).
      </li>
      <li className="leading-10">
        Мы верим, что истинная вера всегда сопровождается покаянием и возрождением силой
        Духа Святого (Иакова 2:14-26; Иоанна 16:5-16; Римлянам 8:9).
      </li>
      <li className="leading-10">
        Мы верим в служение Духа Святого, обитающего в нас, и что благодаря Ему
        последователи Иисуса Христа обретают силу жить благочестивой жизнью (Иоанна
        14:15-26; Ефесянам 2:10; Галатам 5:16-18).
      </li>
    </ul>,
    <ul>
      <li className="leading-10">
        Мы верим в духовное единство всех верующих в Господа Иисуса Христа из всех наций,
        языков и народов (Филиппийцам 2:1-4; Ефесянам 1:22-23; 1 Коринфянам 12:12,27).
      </li>
      <li className="leading-10">
        Мы верим в личное и физическое второе пришествие Иисуса Христа (Матфея 24:30;
        Деяния 1:10-11).
      </li>
      <li className="leading-10">
        Мы верим в воскресение спасённых и погибших: неспасённые воскреснут к вечному
        осуждению в аду, а спасённые воскреснут к вечному блаженству с Богом на небесах
        (Евреям 9:27-28; Матфея 16:27; Иоанна 14:1-3; Матфея 25:31-46).
      </li>
    </ul>,
    <p className="h3">
      Второстепенными являются все остальные верования в Писании, с которыми искренние
      последователи Христа могут расходиться во мнениях (напр., крещение, вечеря Господня,
      вознесение и т.п.). Мы соглашаемся оставаться несогласными в этих вопросах и вместе
      стремиться к общей цели научить все народы и сделать их учениками Христа (Матфея
      28:18-20).
    </p>,
  ]

  const prevPage = () => {
    if (page > 0) {
      setPage(page - 1)
    }
  }

  const nextPage = () => {
    if (page < 5) {
      setPage(page + 1)
    }
  }

  return (
    <div className="layout-appbar flex-col gap-7">
      <div className="h1">Исповедание веры:</div>
      <div className="flex flex-row h-72 gap-4">
        <div className="flex items-center">
          <button disabled={disabledLeftArrow} onClick={prevPage} className="arrow">
            <Left_arrow />
          </button>
        </div>
        <div className="confession-text">{arrConfText[page]}</div>
        <div className="flex items-center">
          <button disabled={disabledRightArrow} onClick={nextPage} className="arrow">
            <Right_arrow />
          </button>
        </div>
      </div>
      {confirm}
    </div>
  )
}
Confession_text.layoutType = 'appbarStartFooter'
