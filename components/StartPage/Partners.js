import Link from 'next/link'
import UnfoldingWord from 'public/unfolding-word.svg'

function Partners({ t }) {
  return (
    <div className="flex flex-col w-full gap-6 md:gap-14">
      <p className="font-semibold md:font-bold">{t('Partners')}</p>
      <div
        className="flex justify-center items-center w-full h-32 md:h-56 rounded-xl bg-th-secondary-100"
        onClick={(e) => e.stopPropagation()}
      >
        <Link href="https://www.unfoldingword.org/" target="_blank">
          <UnfoldingWord />
        </Link>
      </div>
    </div>
  )
}

export default Partners
