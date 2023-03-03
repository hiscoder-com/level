import { useTranslation } from 'next-i18next'
import { useRouter } from 'next/router'
import Footer from 'components/Footer'
import MarkdownExtended from 'components/MarkdownExtended'

function IntroStep({ title, markdown, nextLink }) {
  const router = useRouter()
  const { t } = useTranslation(['common'])
  const saveStepLocalStorage = () => {
    let viewedSteps = JSON.parse(localStorage.getItem('viewedIntroSteps'))

    if (!viewedSteps) {
      localStorage.setItem('viewedIntroSteps', JSON.stringify([router.query]))
      router.push(nextLink)
      return
    }
    viewedSteps = viewedSteps.filter((e) => {
      const { project, book, chapter, step } = router.query
      return (
        JSON.stringify(e) !==
        JSON.stringify({
          project,
          book,
          chapter: chapter.toString(),
          step: (step - 1).toString(),
        })
      )
    })

    localStorage.setItem(
      'viewedIntroSteps',
      JSON.stringify([...viewedSteps, router.query])
    )
    router.push(nextLink)
  }
  return (
    <div className="mb-4 w-full f-screen-appbar max-w-3xl">
      <div
        style={{ height: 'calc(100vh - 11rem)' }}
        className="overflow-auto mb-4 py-6 mx-auto pb-6 px-6 lg:px-8 bg-white rounded-lg"
      >
        <h2 className="mb-4 h2">{title}</h2>
        <MarkdownExtended>{markdown}</MarkdownExtended>
      </div>
      <Footer
        textButton={t('Next')}
        textCheckbox={t('Ok')}
        handleClick={saveStepLocalStorage}
      />
    </div>
  )
}

export default IntroStep
