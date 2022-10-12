import Head from 'next/head'
import { useRouter } from 'next/router'

import { useTranslation } from 'next-i18next'
import { serverSideTranslations } from 'next-i18next/serverSideTranslations'

import Footer from 'components/Footer'
import Workspace from 'components/Workspace'

import { stepsForBible, reference } from 'utils/db'

export default function ProgressPage() {
  const { query } = useRouter()
  const { project, book, chapter, step } = query
  const { t } = useTranslation(['common'])
  const title = `V-CANA Step ${step}`
  return (
    <div>
      <Head>
        <title>{title}</title>
        <meta name="description" content="VCANA" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <Workspace config={stepsForBible[step - 1].workspace} reference={reference} />
      <Footer
        textButton={t('Next')}
        textCheckbox={t('Done')}
        href={`/translate/${project}/${book}/${chapter}/${String(
          parseInt(step) + 1
        )}/intro`}
      />
    </div>
  )
}

export async function getServerSideProps({ locale, params }) {
  // TODO тут надо с базы взять, сколько максимум шагов может быть в методе
  // TODO передавать в компонент последний шаг, чтобы знать когда финиш
  if (params.step > 7 || params.step <= 0) {
    return { notFound: true }
  }

  return {
    props: {
      ...(await serverSideTranslations(locale, ['common', 'steps', 'audio'])),
    },
  }
}
