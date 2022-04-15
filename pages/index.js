import Head from 'next/head'
import Link from 'next/link'

export default function Home() {
  return (
    <div className="container p-10">
      <Head>
        <title>V-CANA</title>
        <meta name="description" content="VCANA" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <div className={'text-6xl py-8'}>Welcome to Vcana</div>
      <div className="flex flex-col">
        <Link href="/sign-up">
          <a
            className={
              'text-3xl py-3 px-4 rounded-xl bg-green-300 border-green-500 border max-w-xs text-center my-2'
            }
          >
            Sign up
          </a>
        </Link>
        <Link href="/sign-up">
          <a
            className={
              'text-3xl py-3 px-4 rounded-xl bg-blue-300 border-blue-500 border max-w-xs text-center my-2'
            }
          >
            Sign in
          </a>
        </Link>
      </div>
    </div>
  )
}
