import Link from 'next/link'
import NotFound from '../public/404-error.svg'

const PageNotFound = () => {
  return (
    <div className="layout-appbar">
      <NotFound className="max-w-4xl" />
      <div className="text-xl">
        <h2>That page cannot be found.</h2>
        <p>
          Go back to the{' '}
          <Link href="/">
            <a className="text-2xl uppercase text-red-400 hover:text-stone-500">
              Homepage
            </a>
          </Link>
        </p>
      </div>
    </div>
  )
}
export default PageNotFound
