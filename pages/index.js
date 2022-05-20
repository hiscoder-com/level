import TT_Logo from '../public/TT_Logo.svg'
import VCANA_logo from '../public/VCANA_logo.svg'

export default function Home() {
  return (
    <div className="index-page">
      <div className="flex absolute top-10 right-10  font-bold justify-end text-xl lg:text-base disabled:opacity-50">
        <a className="text-teal-500 p-2" href="#">
          RU
        </a>
        <a className="opacity-50 text-teal-500 p-2" href="#">
          EN
        </a>
      </div>
      <div className="flex flex-col justify-center items-center m-3">
        <TT_Logo className="mb-10 w-1/3 md:w-1/5 lg:w-32 xl:w-32" />
        <VCANA_logo className="md:w-4/5 lg:w-3/6 xl:w-5/12 2xl:w-1/3" />

        <div className="h2 mt-9 mb-16 text-center">
          Вход на данный сайт только по приглашению админов ресурса.
        </div>
        <a href="/login">
          <button className="btn-start">ВХОД</button>
        </a>
      </div>
    </div>
  )
}

Home.emptyLayout = true
