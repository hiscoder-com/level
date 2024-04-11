import { useEffect, useState } from 'react'

import Head from 'next/head'
import { useRouter } from 'next/router'
import { useTranslation } from 'react-i18next'

import { serverSideTranslations } from 'next-i18next/serverSideTranslations'

import IntroStep from 'components/IntroStep'
import Modal from 'components/Modal'

import useSupabaseClient from 'utils/supabaseClient'
import { supabaseService } from 'utils/supabaseService'

export default function IntroPage() {
  const supabase = useSupabaseClient()
  const { t } = useTranslation('common')
  const { query, replace } = useRouter()
  const { project, book, chapter, step } = query
  const [introMd, setIntroMd] = useState('')
  const [title, setTitle] = useState({})
  const [isOpenModal, setIsOpenModal] = useState(false)

  const fetchStepsData = async (project, step) => {
    const stepsData = await supabase
      .from('steps')
      .select(
        'title, subtitle, intro, is_awaiting_team, sorting, projects!inner(code, id)'
      )
      .match({ 'projects.code': project, sorting: step })
      .single()
    return stepsData.data
  }
  const fetchCurrentSteps = async (projectId) => {
    const res = await supabase.rpc('get_current_steps', {
      project_id: projectId,
    })
    return res.data
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
  useEffect(() => {
    // пришел массив из книг, глав и шагов. Надо пройти, проверить есть ли наша глава.
    // если нет - ошибка или редирект
    // если есть - сверить шаг. Если совпадает - все ок, если нет - перейти на нужный шаг
    const getSteps = async () => {
      try {
        const stepsData = await fetchStepsData(project, step)
        setIntroMd(stepsData.intro)
        setTitle({ title: stepsData.title, subtitle: stepsData.subtitle })
        const curentSteps = await fetchCurrentSteps(stepsData.projects.id)
        const current_step = curentSteps.filter(
          (el) => el.book === book && el.chapter.toString() === chapter.toString()
        )?.[0]?.step
        if (!current_step) {
          return replace(`/account`)
        }
        if (current_step > 1) {
          const previousStep = current_step - 1
          const isAwaitTeam = await fetchIsAwaitTeamCheck({
            projectCode: project,
            chapterNum: chapter,
            bookCode: book,
            stepNum: current_step,
          })

          if (isAwaitTeam) {
            setIsOpenModal(true)
            setTimeout(() => {
              return replace(`/translate/${project}/${book}/${chapter}/${previousStep}`)
            }, 3000)
          }
        }
        if (parseInt(current_step) !== parseInt(step)) {
          return replace(`/translate/${project}/${book}/${chapter}/${current_step}/intro`)
        }
      } catch (error) {}
    }
    getSteps()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [book, chapter, project, step, supabase])
  return (
    <div className="layout-appbar">
      <Head>
        <title>{title?.title}</title>
        <meta name="description" content="VCANA" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <IntroStep
        markdown={introMd}
        title={title}
        nextLink={`/translate/${project}/${book}/${chapter}/${step}/`}
      />
      <Modal isOpen={isOpenModal}>
        <div className="mx-auto">{t('SomeTranslatorsNotFinish')}</div>
      </Modal>
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
      ...(await serverSideTranslations(locale, ['intro-steps', 'common', 'users'])),
    },
  }
}
