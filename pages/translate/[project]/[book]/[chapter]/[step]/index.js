import { useEffect, useState } from 'react'

import Head from 'next/head'
import { useRouter } from 'next/router'

import { useTranslation } from 'next-i18next'
import { serverSideTranslations } from 'next-i18next/serverSideTranslations'

import Footer from 'components/Footer'
import Workspace from 'components/Workspace'

import { supabase } from 'utils/supabaseClient'

export default function ProgressPage() {
  const { query } = useRouter()
  const { project, book, chapter, step } = query
  const { t } = useTranslation(['common'])
  const [stepConfig, setStepConfig] = useState(null)

  useEffect(() => {
    supabase
      .from('steps')
      .select('*,projects!inner(*)')
      .eq('projects.code', project)
      .eq('sorting', step)
      .single()
      .then((res) => {
        let stepConfig = {
          title: res.data.title,
          config: [...res.data.config],
          resources: { ...res.data.projects.resources },
          base_manifest: res.data.projects.base_manifest.resource,
        }

        setStepConfig(stepConfig)
      })
  }, [project, step])
  return (
    <div>
      <Head>
        <title>{stepConfig?.title}</title>
        <meta name="description" content="VCANA" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      {stepConfig ? (
        <Workspace
          reference={{ step, book, chapter, verses: [] }}
          stepConfig={stepConfig}
        />
      ) : (
        'Loading'
      )}
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
