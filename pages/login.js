import Head from 'next/head'

export default function Login() {
  return (
    <div className="container-center f-screen items-center">
      <Head>
        <title>V-CANA login</title>
        <meta name="description" content="VCANA" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <div className="max-w-xs">
        <h1 className="h1">Вход:</h1>
        <input className="form-valid mt-8 mb-2" type="text" placeholder="Логин:"></input>
        <input className="form-valid mb-4" type="password" placeholder="Пароль:"></input>
        <div className="flex gap-2.5 mt-2 h-9">
          <button className="w-8/12 btn-disabled">Написать админу</button>
          <button className="w-4/12 btn-active-filled">Далее</button>
        </div>
      </div>
    </div>
  )
}
