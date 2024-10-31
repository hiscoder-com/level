import { useRouter } from 'next/router'

import { useTranslation } from 'next-i18next'

import Footer from 'components/Footer'
import MarkdownExtended from 'components/MarkdownExtended'

function IntroStep({ title, markdown, nextLink }) {
  const { t } = useTranslation('common')
  const router = useRouter()
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
    <div className="f-screen-appbar mb-4 w-full max-w-3xl">
      <div
        style={{ height: 'calc(100vh - 11rem)' }}
        className="mx-auto mb-4 overflow-auto rounded-lg bg-th-secondary-10 px-6 py-6 lg:px-8"
      >
        <h2 className="mb-4 text-3xl">{title.title}</h2>
        {title.subtitle && <h3 className="mb-4 text-xl">{title.subtitle}</h3>}

        <MarkdownExtended className="markdown-body">{markdown}</MarkdownExtended>
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
