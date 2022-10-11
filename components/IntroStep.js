import { useTranslation } from 'next-i18next'

import Footer from 'components/Footer'
import MarkdownExtended from './MarkdownExtended'

function IntroStep({ step }) {
  const { t } = useTranslation(['intro-steps', 'common'])
  return (
    <div className="mb-4">
      <div className="text-alignment text-justify mb-4 py-6">
        <MarkdownExtended>{test}</MarkdownExtended>
      </div>
      <Footer
        textButton={t('common:Next')}
        textCheckbox={t('common:Ok')}
        href={`/steps/${step}`}
      />
    </div>
  )
}

export default IntroStep
