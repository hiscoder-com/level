import { useTranslation } from 'next-i18next'

import Footer from 'components/Footer'
import MarkdownExtended from './MarkdownExtended'

function IntroStep({ markdown, nextLink }) {
  const { t } = useTranslation(['common'])
  return (
    <div className="mb-4">
      <div className="text-alignment text-justify mb-4 py-6">
        <MarkdownExtended>{markdown}</MarkdownExtended>
      </div>
      <Footer textButton={t('Next')} textCheckbox={t('Ok')} href={nextLink} />
    </div>
  )
}

export default IntroStep
