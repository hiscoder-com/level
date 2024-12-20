import { useRouter } from 'next/router'

import AboutVersion from 'components/AboutVersion'

import Download from './Download'

function SectionContainer({ showSections, toggleSection, t }) {
  const router = useRouter()

  const onClose = () => {
    router.replace('/', undefined, { shallow: true, scroll: false })
    toggleSection({ download: false, updates: false })
  }

  const handleSectionClick = async (section) => {
    if (!showSections[section]) {
      await router.replace('/', undefined, { shallow: true, scroll: false })
    }

    toggleSection({ [section]: !showSections[section] })

    await router.replace(`/${section}`, undefined, { shallow: true, scroll: false })
  }

  return (
    <div className="grid grid-cols-2 gap-5 text-center">
      {!showSections.updates && (
        <div
          onClick={() => handleSectionClick('download')}
          className={`cursor-pointer rounded-xl bg-th-secondary-10 p-5 ${
            showSections.download ? 'col-span-2' : ''
          }`}
        >
          <p className={`mb-9 ${showSections.download ? 'font-semibold' : ''}`}>
            {t('common:Download')}
          </p>
          {showSections.download && <Download t={t} onClose={onClose} />}
        </div>
      )}

      {!showSections.download && (
        <div
          onClick={() => handleSectionClick('updates')}
          className={`cursor-pointer rounded-xl bg-th-secondary-10 p-5 ${
            showSections.updates ? 'col-span-2' : ''
          }`}
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
