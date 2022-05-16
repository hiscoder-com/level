import Head from 'next/head'

export default function Login() {
  return (
    <div className="container min-h-screen flex justify-center items-center">
      <Head>
        <title>V-CANA login</title>
        <meta name="description" content="VCANA" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <div className="max-w-xs">
        <h1 className="text-start text-5xl text-slate-900">Вход:</h1>
        <input
          className="mt-8 mb-2 focus:ring-2 focus:ring-emerald-500 focus:outline-none appearance-none w-full text-sm leading-6 text-slate-900 placeholder-slate-400 rounded-md py-2 pl-2 ring-1 ring-slate-200 shadow-sm bg-zinc-100"
          type="text"
          placeholder="Логин:"
        ></input>
        <input
          className="mb-4 focus:ring-2 focus:ring-emerald-500 focus:outline-none appearance-none w-full text-sm leading-6 text-slate-900 placeholder-slate-400 rounded-md py-2 pl-2 ring-1 ring-slate-200 shadow-sm bg-zinc-100 
          invalid:border-red-600 invalid:text-red-600
          focus:invalid:border-red-600 focus:invalid:ring-red-600"
          type="password"
          placeholder="Пароль:"
        ></input>
        <div className="flex mt-2 ">
          <button
            className="w-8/12  border-2 mr-1  rounded-md text-teal-500 border-teal-500
          disabled:opacity-50"
          >
            Написать админу
          </button>
          <button className="w-4/12 h-9 border-2  bg-teal-500  rounded-md text-white">
            Далее
          </button>
        </div>
      </div>
    </div>
  )
}
