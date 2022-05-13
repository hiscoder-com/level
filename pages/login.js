import Head from 'next/head'

export default function Login() {
  return (
    <div className="container flex flex-col mx-auto relative px-3 font-sans min-h-screen justify-center">
      <Head>
        <title>V-CANA login</title>
        <meta name="description" content="VCANA" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <div className="m-80">
        <h1 className="text-start text-5xl ">Вход:</h1>
        <input
          className="mt-8 mb-2 focus:ring-2 focus:ring-blue-500 focus:outline-none appearance-none w-full text-sm leading-6 text-slate-900 placeholder-slate-400 rounded-md py-2 pl-2 ring-1 ring-slate-200 shadow-sm"
          type="text"
          placeholder="Логин:"
        ></input>
        <input
          className="focus:ring-2 focus:ring-blue-500 focus:outline-none appearance-none w-full text-sm leading-6 text-slate-900 placeholder-slate-400 rounded-md py-2 pl-2 ring-1 ring-slate-200 shadow-sm"
          type="password"
          placeholder="Пароль:"
        ></input>
        <div className="flex">
          <button>button_1</button>
          <button>button_2</button>
        </div>
      </div>
    </div>
  )
}
