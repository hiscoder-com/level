import Link from 'next/link'

export default function Confession() {
  return (
    <div className="layout-appbar">
      <div className="text-center max-w-lg">
        <h1 className="h1 mb-6">Исповедание веры:</h1>
        <p className="h5 mb-2">
          согласуется с историческими символами веры:
          <br /> Апостольский символ веры, Никейский символ веры, и Афанасьевский символ
          веры; а также Lausanne Covenant.
        </p>
        <p className="h6 font-light">
          Официальная версия этого документа находится на сайте &nbsp;
          <a
            href="https://texttree.org/"
            target={'_blank'}
            className="underline text-cyan-600"
            rel="noreferrer"
          >
            https://texttree.org/
          </a>
        </p>
        <Link href="/confession-steps">
          <a className="btn-filled w-28 mt-7">Начать</a>
        </Link>
      </div>
    </div>
  )
}
Confession.backgroundColor = 'bg-white'
