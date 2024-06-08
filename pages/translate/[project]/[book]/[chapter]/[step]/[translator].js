import { useEffect, useState } from 'react'

import Head from 'next/head'
import { useRouter } from 'next/router'
import Link from 'next/link'

import { useSetRecoilState } from 'recoil'
import { useTranslation } from 'next-i18next'
import { serverSideTranslations } from 'next-i18next/serverSideTranslations'

import Workspace from 'components/Workspace'

import { stepConfigState } from 'components/state/atoms'

import { useCurrentUser } from 'lib/UserContext'
import useSupabaseClient from 'utils/supabaseClient'
import { supabaseService } from 'utils/supabaseService'
import Progress from 'public/progress.svg'

/**
 * что если тут мы заменим все инструменты на обычную читалку, и так же надо подгрузить чужие стихи
 * либо в компонентах для редактора надо проверять, чьи стихи
 */
function TranslatorPage({ last_step }) {
  const supabase = useSupabaseClient()
  const { user } = useCurrentUser()
  const { query, replace } = useRouter()
  const setStepConfigData = useSetRecoilState(stepConfigState)
  const { project, book, chapter, step, translator } = query
  const { t } = useTranslation(['common'])
  const [stepConfig, setStepConfig] = useState(null)
  const [versesRange, setVersesRange] = useState([])

  useEffect(() => {
    if (user?.login) {
      supabase
        .rpc('get_whole_chapter', {
          project_code: project,
          chapter_num: chapter,
          book_code: book,
        })
        .then((res) => {
          setVersesRange(res.data.filter((el) => el.translator === translator))
        })
    }
  }, [book, chapter, project, supabase, translator, user?.login])

  const fetchStepsData = async (project, step) => {
    const stepsData = await supabase
      .from('steps')
      .select('*,projects!inner(*)')
      .eq('projects.code', project)
      .eq('sorting', step)
      .single()
    return stepsData.data
  }
  const fetchIsAwaitTeamCheck = async ({
    projectCode,
    chapterNum,
    bookCode,
    stepNum,
  }) => {
    const res = await supabase.rpc('get_is_await_team', {
      project_code: projectCode,
      chapter_num: chapterNum,
      book_code: bookCode,
      step: stepNum,
    })
    return res.data
  }

  const fetchCurrentSteps = async (projectId) => {
    const res = await supabase.rpc('get_current_steps', {
      project_id: projectId,
    })
    return res.data
  }

  useEffect(() => {
    const getSteps = async () => {
      try {
        const stepsData = await fetchStepsData(project, step)
        if (!stepsData) {
          return replace('/')
        }
        const curentSteps = await fetchCurrentSteps(stepsData.projects.id)
        const currentStepObject = curentSteps.find(
          (el) => el.book === book && el.chapter.toString() === chapter.toString()
        )
        if (!currentStepObject) {
          return replace(`/account`)
        }
        const currentStep = currentStepObject.step
        if (currentStep > 1) {
          const isAwaitTeam = await fetchIsAwaitTeamCheck({
            projectCode: project,
            chapterNum: chapter,
            bookCode: book,
            stepNum: currentStep,
          })
          if (isAwaitTeam) {
            const previousStep = currentStep - 1
            if (parseInt(step) !== parseInt(previousStep)) {
              return replace(`/translate/${project}/${book}/${chapter}/${previousStep}`)
            }
          } else if (parseInt(step) !== parseInt(currentStep)) {
            return replace(
              `/translate/${project}/${book}/${chapter}/${currentStep}/intro`
            )
          }
        }
        let stepConfig = {
          title: stepsData.title,
          subtitle: stepsData.subtitle,
          config: [...stepsData.config],
          whole_chapter: stepsData.whole_chapter,
          resources: { ...stepsData.projects?.resources },
          base_manifest: stepsData.projects?.base_manifest?.resource,
          is_rtl: stepsData.projects?.is_rtl,
        }
        setStepConfigData({
          count_of_users: stepsData.count_of_users,
          time: stepsData.time,
          title: stepsData.title,
          description: stepsData.description,
          last_step,
          current_step: step,
          project_code: project,
        })
        setStepConfig(stepConfig)
      } catch (error) {
        console.log(error)
      }
    }
    getSteps()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [book, chapter, project, step])

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
        <div className="h-empty-screen flex items-center justify-center mx-auto max-w-7xl py-5">
          <Progress className=" progress-custom-colors w-14 animate-spin stroke-th-primary-100" />
        </div>
      )}

      <div className="flex justify-end px-0 mx-auto w-full max-w-7xl lg:px-4 xl:px-0 bg-th-secondary-100">
        <Link href={`/translate/${project}/${book}/${chapter}/${step}`} legacyBehavior>
          <button className="my-2 btn-quaternary !px-6">{t('BackTo')}</button>
        </Link>
      </div>
    </div>
  )
}

export default TranslatorPage

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
      ...(await serverSideTranslations(locale, ['common', 'steps', 'audio', 'users'])),
      last_step: steps.data.sorting,
    },
  }
}
