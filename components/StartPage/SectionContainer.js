import Link from 'next/link'
import { useRouter } from 'next/router'

import AboutVersion from 'components/AboutVersion'

import Download from './Download'

function SectionContainer({ showSections, toggleSection, t }) {
  const router = useRouter()

  const onClose = () => {
    router.replace('/', undefined, { shallow: true, scroll: false })
    toggleSection({ download: false, updates: false })
  }
  return (
    <div className="grid grid-cols-2 gap-5 text-center">
      {!showSections.updates && (
        <Link
          href="/download"
          shallow
          scroll={false}
          className={`rounded-xl bg-th-secondary-10 p-5 ${
            showSections.download ? 'col-span-2' : ''
          }`}
        >
          <p className={`mb-9 ${showSections.download ? 'font-semibold' : ''}`}>
            {t('common:Download')}
          </p>
          {showSections.download && <Download t={t} onClose={onClose} />}
        </Link>
      )}

      {!showSections.download && (
        <Link
          href="/updates"
          shallow
          scroll={false}
          className={`rounded-xl bg-th-secondary-10 p-5 ${
            showSections.updates ? 'col-span-2' : ''
          }`}
        >
          {!showSections.updates ? (
            <p>{t('Updates')}</p>
          ) : (
            <AboutVersion isStartPage={true} onClose={onClose} />
          )}
        </Link>
      )}
    </div>
  )
}

export default SectionContainer
