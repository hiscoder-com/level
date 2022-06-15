import { useState, useEffect } from 'react'
import LeftArrow from '../public/left-arrow.svg'
import RightArrow from '../public/right-arrow.svg'

export default function ConfessionSteps() {
  const [checked, setChecked] = useState(false)
  const [page, setPage] = useState(0)

  const arrConfText = [
    <p key={1} className="text-center">
      Главные верования являются определяющими для последователей Иисуса Христа.
      <br /> С ними нельзя идти на компромисс и их нельзя игнорировать.
    </p>,
    <ul key={2} className="list-disc">
      <li className="pb-5">
        Мы верим в то, что Библия – единственное Боговдохновенное, непогрешимое,
        достаточное, авторитетное Божье Слово (1 Фессалоникийцам 2:13; 2 Тимофею 3:16-17).
      </li>
      <li className="pb-5">
        Мы верим, что есть один Бог, вечно существующий в трёх лицах: Бог Отец, Бог Сын —
        Иисус Христос, Святой Дух. (Матфея 28:19; Иоанна 10:30).
      </li>
      <li>
        Мы верим в Божественность Иисуса Христа (Иоанна 1:1-4; Филиппийцам 2:5-11; 2 Петра
        1:1).
      </li>
    </ul>,
    <ul key={3} className="list-disc">
      <li className="pb-5">
        Мы верим в человеческую природу Иисуса Христа, в Его непорочное зачатие,
        безгрешную жизнь, чудеса, заместительную и искупительную смерть через Его пролитую
        кровь, в Его телесное воскресение и вознесение одесную Отца (Матфея 1:18,25; 1
        Коринфянам 15:1-8; Евреям 4:15; Деяния 1:9-11; Деяния 2:22-24).
      </li>
      <li>
        Мы верим, что каждый человек наследует греховную природу и поэтому заслуживает
        вечный ад (Римлянам 3:23; Исаия 64:6-7).
      </li>
    </ul>,
    <ul key={4} className="list-disc">
      <li className="pb-5">
        Мы верим, что спасение от греха является Божьим даром через жертвенную смерть и
        воскресение Иисуса Христа и принимается по благодати верой, а не делами (Иоанна
        3:16; Иоанна 14:6; Ефесянам 2:8-9, Титу 3:3-7).
      </li>
      <li className="pb-5">
        Мы верим, что истинная вера всегда сопровождается покаянием и возрождением силой
        Духа Святого (Иакова 2:14-26; Иоанна 16:5-16; Римлянам 8:9).
      </li>
      <li>
        Мы верим в служение Духа Святого, обитающего в нас, и что благодаря Ему
        последователи Иисуса Христа обретают силу жить благочестивой жизнью (Иоанна
        14:15-26; Ефесянам 2:10; Галатам 5:16-18).
      </li>
    </ul>,
    <ul key={5} className="list-disc">
      <li className="pb-5">
        Мы верим в духовное единство всех верующих в Господа Иисуса Христа из всех наций,
        языков и народов (Филиппийцам 2:1-4; Ефесянам 1:22-23; 1 Коринфянам 12:12,27).
      </li>
      <li className="pb-5">
        Мы верим в личное и физическое второе пришествие Иисуса Христа (Матфея 24:30;
        Деяния 1:10-11).
      </li>
      <li>
        Мы верим в воскресение спасённых и погибших: неспасённые воскреснут к вечному
        осуждению в аду, а спасённые воскреснут к вечному блаженству с Богом на небесах
        (Евреям 9:27-28; Матфея 16:27; Иоанна 14:1-3; Матфея 25:31-46).
      </li>
    </ul>,
    <p key={6}>
      Второстепенными являются все остальные верования в Писании, с которыми искренние
      последователи Христа могут расходиться во мнениях (напр., крещение, вечеря Господня,
      вознесение и т.п.). Мы соглашаемся оставаться несогласными в этих вопросах и вместе
      стремиться к общей цели научить все народы и сделать их учениками Христа (Матфея
      28:18-20).
    </p>,
  ]

  const prevPage = () => {
    setPage((prev) => {
      return prev > 0 ? prev - 1 : prev
    })
  }
  const nextPage = () => {
    setPage((prev) => {
      return prev < 5 ? prev + 1 : prev
    })
  }

  const handleKeyDown = (e) => {
    switch (e.keyCode) {
      case 37:
        prevPage()
        break
      case 39:
        nextPage()
        break
    }
  }
  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown)
    return () => {
      window.removeEventListener('keydown', handleKeyDown)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page])
  return (
    <div className="layout-appbar gap-7">
      <h1 className="h1">Исповедание веры:</h1>
      <div className="flex flex-row min-h-[18rem] w-4/5 max-w-7xl gap-4">
        <div className="flex items-center">
          <button disabled={page < 1} onClick={prevPage} className="arrow">
            <LeftArrow />
          </button>
        </div>
        <div className="confession-text w-full">{arrConfText[page]}</div>
        <div className="flex items-center">
          <button disabled={page > 4} onClick={nextPage} className="arrow">
            <RightArrow />
          </button>
        </div>
      </div>
      <div
        className={`flex flex-row items-center space-x-6 ${
          page === 5 ? '' : 'invisible'
        }`}
      >
        <div className="space-x-1.5 items-center h4">
          <input
            id="cb"
            type="checkbox"
            checked={checked}
            onChange={() => setChecked((prev) => !prev)}
          />
          <label htmlFor="cb">Согласен</label>
        </div>
        <button className="btn-filled w-28" disabled={!checked}>
          Далее
        </button>
      </div>
    </div>
  )
}
