import { useTranslation } from 'next-i18next'

import Footer from 'components/Footer'
import MarkdownExtended from 'components/MarkdownExtended'

function IntroStep({ title, markdown, nextLink }) {
  const { t } = useTranslation(['common'])
  return (
    <div className="mb-4 w-full f-screen-appbar max-w-3xl">
      <div
        style={{ height: 'calc(100vh - 11rem)' }}
        className="overflow-auto mb-4 py-6 mx-auto pb-6 px-6 lg:px-8 bg-white rounded-lg"
      >
        <h2 className="mb-4 h2">{title}</h2>
        <MarkdownExtended>{markdown}</MarkdownExtended>
      </div>
      <Footer textButton={t('Next')} textCheckbox={t('Ok')} href={nextLink} />
    </div>
  )
}

export default IntroStep
