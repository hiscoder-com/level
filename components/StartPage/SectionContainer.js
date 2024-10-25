import AboutVersion from 'components/AboutVersion'
import { useRouter } from 'next/router'
import Download from './Download'

function SectionContainer({ showSections, toggleSection, t }) {
  const router = useRouter()

  const handleRouteChange = (section) => {
    toggleSection(section)

    if (section === 'download') {
      router.push('/download')
    } else if (section === 'updates') {
      router.push('/updates')
    } else {
      router.push('/', undefined, { shallow: true })
    }
  }

  const onClose = () => {
    router.push('/')
    toggleSection({ download: false, updates: false })
  }
  return (
    <div className="grid grid-cols-2 gap-5 text-center">
      {!showSections.updates && (
        <div
          className={`p-5 bg-th-secondary-10 rounded-xl ${
            showSections.download ? 'col-span-2' : ''
          }`}
          onClick={() => handleRouteChange('download')}
        >
          <p className={`mb-9 ${showSections.download ? 'font-semibold' : ''}`}>
            {t('common:Download')}
          </p>
          {showSections.download && <Download t={t} onClose={onClose} />}
        </div>
      )}

      {!showSections.download && (
        <div
          className={`p-5 bg-th-secondary-10 rounded-xl ${
            showSections.updates ? 'col-span-2' : ''
          }`}
          onClick={() => handleRouteChange('updates')}
        >
          {!showSections.updates ? (
            <p>{t('Updates')}</p>
          ) : (
            <AboutVersion isStartPage={true} onClose={onClose} />
          )}
        </div>
      )}
    </div>
  )
}

export default SectionContainer
