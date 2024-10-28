import AboutVersion from 'components/AboutVersion'
import { useRouter } from 'next/router'
import Link from 'next/link'
import Download from './Download'

function SectionContainer({ showSections, toggleSection, t }) {
  const router = useRouter()

  const handleRouteChange = (section) => {
    toggleSection(section)
  }

  const onClose = () => {
    router.push('/')
    toggleSection({ download: false, updates: false })
  }
  return (
    <div className="grid grid-cols-2 gap-5 text-center">
      {!showSections.updates && (
        <Link
          href="/download"
          shallow
          onClick={() => handleRouteChange('download')}
          className={`p-5 bg-th-secondary-10 rounded-xl ${
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
          onClick={() => handleRouteChange('updates')}
          className={`p-5 bg-th-secondary-10 rounded-xl ${
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
