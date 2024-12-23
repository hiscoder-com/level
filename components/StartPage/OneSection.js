import { useRouter } from 'next/router'

import Feedback from './Feedback'
import Logo from './Logo'
import Partners from './Partners'

import Close from 'public/icons/close.svg'

function OneSection({ showSections, toggleSection, label, logo, t }) {
  const router = useRouter()
  const onClose = () => {
    router.replace('/', undefined, { shallow: true, scroll: false })
    toggleSection({ partners: false, connect: false })
  }

  const handleSectionClick = async (section) => {
    const sectionKey =
      section === 'connect-with-us' ? 'connect' : section === 'about' ? 'logo' : section

    if (showSections[sectionKey]) {
      toggleSection({ [sectionKey]: false })
      await router.replace('/', undefined, { shallow: true, scroll: false })
    } else {
      await router.replace('/', undefined, { shallow: true, scroll: false })
      toggleSection({ [sectionKey]: true })
      await router.replace(`/${section}`, undefined, { shallow: true, scroll: false })
    }
  }

  const renderSectionContent = () => {
    if (label === t('Partners')) {
      return (
        <div
          onClick={() => handleSectionClick('partners')}
          className={`cursor-pointer rounded-xl bg-th-secondary-10 p-5 text-center ${
            showSections.partners ? 'col-span-2' : ''
          }`}
        >
          {!showSections.partners && (
            <p className={`${showSections.partners ? 'font-semibold' : ''}`}>{label}</p>
          )}
          {showSections.partners && <Partners t={t} onClose={onClose} />}
        </div>
      )
    }

    if (label === t('WriteToUs')) {
      return (
        <div
          onClick={() => handleSectionClick('connect-with-us')}
          className={`cursor-pointer rounded-xl bg-th-secondary-10 p-5 text-center ${
            showSections.connect ? 'col-span-2' : ''
          }`}
        >
          <p className={`${showSections.connect ? 'pb-10 font-semibold' : ''}`}>
            {label}
          </p>

          {showSections.connect && <Feedback isStartPage={true} onClose={onClose} />}
        </div>
      )
    }

    if (label === 'logo') {
      return (
        <div
          onClick={() => handleSectionClick('about')}
          className={`flex cursor-pointer justify-center rounded-xl bg-th-secondary-10 p-5`}
        >
          {!showSections.logo && <p>{logo}</p>}
          {showSections.logo && <Logo t={t} isMobilePage={true} onClose={onClose} />}
        </div>
      )
    }

    return null
  }

  return (
    <div className="relative rounded-xl bg-th-secondary-10 p-0">
      {renderSectionContent()}
    </div>
  )
}

export default OneSection
