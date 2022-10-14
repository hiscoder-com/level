import { useEffect, useState } from 'react'

import Head from 'next/head'
import { useRouter } from 'next/router'

import { useTranslation } from 'next-i18next'
import { serverSideTranslations } from 'next-i18next/serverSideTranslations'

import Footer from 'components/Footer'
import Workspace from 'components/Workspace'

import { supabase } from 'utils/supabaseClient'
import { supabaseService } from 'utils/supabaseServer'

export default function ProgressPage({ last_step }) {
  console.log({ last_step })
  const { query, push } = useRouter()
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
        if (!res.data) {
          return push('/')
        }
        let stepConfig = {
          title: res.data?.title,
          config: [...res.data?.config],
          resources: { ...res.data?.projects?.resources },
          base_manifest: res.data?.projects?.base_manifest?.resource,
        }

        setStepConfig(stepConfig)
      })
  }, [project, push, step])

  const handleNextStep = async () => {
    const { data: next_step } = await supabase.rpc('go_to_next_step', {
      project,
      book,
      chapter,
    })
    if (parseInt(last_step) === parseInt(next_step)) {
      push(`/account`)
    } else {
      push(`/translate/${project}/${book}/${chapter}/${next_step}/intro`)
    }
  }
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
        handleClick={handleNextStep}
      />
    </div>
  )
}

export async function getServerSideProps({ locale, params }) {
  const steps = await supabaseService
    .from('steps')
    .select('sorting,projects!inner(code)')
    .eq('projects.code', params.project)
    .order('sorting', { ascending: false })
    .limit(1)
    .single()
  if (!steps.data.sorting) {
    return { notFound: true }
  }
  if (params.step > steps.data.sorting || params.step <= 0) {
    return { notFound: true }
  }

  return {
    props: {
      ...(await serverSideTranslations(locale, ['common', 'steps', 'audio'])),
      last_step: steps.data.sorting,
    },
  }
}
