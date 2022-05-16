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
        <h1 className="header">Вход:</h1>
        <input className="mt-8 mb-2  form-valid" type="text" placeholder="Логин:"></input>
        <input className="mb-4  form-valid" type="password" placeholder="Пароль:"></input>
        <div className="flex mt-2 h-9 gap-2.5">
          <button className="w-8/12 btn-disabled">Написать админу</button>
          <button className="w-4/12  btn-active-filled">Далее</button>
        </div>
      </div>
    </div>
  )
}
