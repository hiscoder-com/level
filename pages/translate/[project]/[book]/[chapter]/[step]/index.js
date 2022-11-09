import { useEffect, useState } from 'react'

import Head from 'next/head'
import { useRouter } from 'next/router'

import { useTranslation } from 'next-i18next'
import { serverSideTranslations } from 'next-i18next/serverSideTranslations'

import { useRecoilState } from 'recoil'

import Footer from 'components/Footer'
import Workspace from 'components/Workspace'

import { stepConfigState } from 'components/Panel/state/atoms'
import { supabase } from 'utils/supabaseClient'
import { supabaseService } from 'utils/supabaseServer'

export default function ProgressPage({ last_step }) {
  const { query, replace } = useRouter()
  const [, setStepConfigData] = useRecoilState(stepConfigState)
  const { project, book, chapter, step } = query
  const { t } = useTranslation(['common'])
  const [stepConfig, setStepConfig] = useState(null)
  const [projectId, setProjectId] = useState(null)
  const [versesRange, setVersesRange] = useState([])

  useEffect(() => {
    if (projectId) {
      supabase.rpc('get_verses', { project_id: projectId, chapter, book }).then((res) => {
        setVersesRange(res.data)
      })
    }
  }, [book, chapter, projectId])

  useEffect(() => {
    supabase
      .from('steps')
      .select('*,projects!inner(*)')
      .eq('projects.code', project)
      .eq('sorting', step)
      .single()
      .then((res) => {
        if (!res.data) {
          return replace('/')
        }
        supabase
          .rpc('get_current_steps', { project_id: res.data.projects.id })
          .then((response) => {
            const current_step = response.data.filter(
              (el) => el.book === book && el.chapter.toString() === chapter.toString()
            )?.[0]?.step
            if (!current_step) {
              return replace(`/account`)
            }
            if (parseInt(current_step) !== parseInt(step)) {
              return replace(
                `/translate/${project}/${book}/${chapter}/${current_step}/intro`
              )
            }
            setProjectId(res.data?.projects?.id)

            let stepConfig = {
              title: res.data?.title,
              config: [...res.data?.config],
              whole_chapter: res.data?.whole_chapter,
              resources: { ...res.data?.projects?.resources },
              base_manifest: res.data?.projects?.base_manifest?.resource,
            }
            setStepConfigData({
              count_of_users: res.data?.count_of_users,
              time: res.data?.time,
              title: res.data?.title,
              description: res.data?.description,
              last_step,
              current_step: step,
              project_code: project,
            })
            setStepConfig(stepConfig)
          })
      })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [book, chapter, project, step])

  const handleNextStep = async () => {
    const { data: next_step } = await supabase.rpc('go_to_next_step', {
      project,
      book,
      chapter,
    })
    if (parseInt(step) === parseInt(next_step)) {
      replace(`/account`)
    } else {
      replace(`/translate/${project}/${book}/${chapter}/${next_step}/intro`)
    }
    localStorage.setItem('scrollIds', {})
  }
  return (
    <div>
      <Head>
        <title>{stepConfig?.title}</title>
        <meta name="description" content="VCANA" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      {versesRange.length && stepConfig ? (
        <Workspace
          reference={{ step, book, chapter, verses: versesRange }}
          stepConfig={stepConfig}
        />
      ) : (
        t('Loading')
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
