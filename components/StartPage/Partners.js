import Image from 'next/image'
import Link from 'next/link'

const partners = [
  {
    name: 'Unfolding Word',
    url: 'https://www.unfoldingword.org/',
    logo: '/unfolding-word.svg',
    width: 201,
    height: 35,
  },
  {
    name: 'Aquifer',
    url: 'https://aquifer.bible/',
    logo: '/aquifer.svg',
    width: 102,
    height: 37,
  },
  {
    name: 'Glokas',
    url: 'https://glokas.com/',
    logo: '/glokas.svg',
    width: 126,
    height: 23,
  },
  {
    name: 'BibleVis',
    url: 'https://biblevis.com/',
    logo: '/biblevis.svg',
    width: 141,
    height: 22,
  },
]

function Partners({ t }) {
  return (
    <div className="flex flex-col w-full gap-6 md:gap-14">
      <p className="font-semibold md:font-bold">{t('Partners')}</p>
      <div className="grid grid-cols-2 gap-3">
        {partners.map((partner) => (
          <div
            key={partner.name}
            className="flex h-28 w-full items-center justify-center rounded-xl bg-th-secondary-100 px-8 py-11"
            onClick={(e) => e.stopPropagation()}
          >
            <Link href={partner.url} target="_blank">
              <Image
                src={partner.logo}
                alt={partner.name}
                width={partner.width}
                height={partner.height}
              />
            </Link>
          </div>
        ))}
      </div>
    </div>
  )
}

export default Partners
