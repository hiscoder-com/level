import { useTranslation } from 'next-i18next'

import Footer from 'components/Footer'
import MarkdownExtended from 'components/MarkdownExtended'

function IntroStep({ markdown, nextLink }) {
  const { t } = useTranslation(['common'])
  return (
    <div className="w-full mb-4 f-screen-appbar">
      <div className="mb-4 py-6 mx-auto text-justify text-alignment f-screen-appbar">
        <MarkdownExtended>{markdown}</MarkdownExtended>
      </div>
      <Footer textButton={t('Next')} textCheckbox={t('Ok')} href={nextLink} />
    </div>
  )
}

export default IntroStep
