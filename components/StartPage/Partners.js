import Image from 'next/image'
import Link from 'next/link'

function Partners({ t }) {
  return (
    <div className="flex w-full flex-col gap-6 md:gap-14">
      <p className="font-semibold md:font-bold">{t('Partners')}</p>
      <div
        className="flex h-32 w-full items-center justify-center rounded-xl bg-th-secondary-100 md:h-56"
        onClick={(e) => e.stopPropagation()}
      >
        <Link href="https://www.unfoldingword.org/" target="_blank">
          <Image
            src="/icons/unfolding-word.svg"
            alt="Unfolding Word"
            width={201}
            height={35}
          />
        </Link>
      </div>
    </div>
  )
}

export default Partners
