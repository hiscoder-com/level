import { useEffect, useMemo, useState } from 'react'

import Head from 'next/head'
import { useRouter } from 'next/router'

import { useTranslation } from 'next-i18next'
import { serverSideTranslations } from 'next-i18next/serverSideTranslations'

import { useSetRecoilState } from 'recoil'

import Footer from 'components/Footer'
import Workspace from 'components/Workspace'
import Modal from 'components/Modal'

import { useCurrentUser } from 'lib/UserContext'
import { supabaseService } from 'utils/supabaseService'
import useSupabaseClient from 'utils/supabaseClient'
import { projectIdState, stepConfigState, currentVerse } from 'components/state/atoms'

export default function ProgressPage({ last_step }) {
  const supabase = useSupabaseClient()
  const { user } = useCurrentUser()
  const setStepConfigData = useSetRecoilState(stepConfigState)
  const setCurrentVerse = useSetRecoilState(currentVerse)

  const { t } = useTranslation('common')
  const {
    query: { project, book, chapter, step },
    replace,
    push,
  } = useRouter()
  const [stepConfig, setStepConfig] = useState(null)
  const setProjectId = useSetRecoilState(projectIdState)
  const [versesRange, setVersesRange] = useState([])
  const [loading, setLoading] = useState(false)
  const [isOpenModal, setIsOpenModal] = useState(false)
  const [lastTranslators, setLastTranslators] = useState([])
  const [isWaitLastTranslators, setIsWaitLastTranslators] = useState(false)

  function getLastTranslators(verses, currentStep) {
    const filteredVerses = verses.filter((verse) => verse.current_step < currentStep)
    return filteredVerses.length > 0 ? filteredVerses : null
  }
  useEffect(() => {
    if (user?.login) {
      supabase
        .rpc('get_whole_chapter', {
          project_code: project,
          chapter_num: chapter,
          book_code: book,
        })
        .then((res) => {
          setVersesRange(res.data.filter((el) => el.translator === user.login))
        })
    }
  }, [book, chapter, project, supabase, user?.login])

  const fetchStepsData = async (project, step) => {
    const stepsData = await supabase
      .from('steps')
      .select('*,projects!inner(*)')
      .eq('projects.code', project)
      .eq('sorting', step)
      .single()
    return stepsData.data
  }

  const fetchCurrentSteps = async (projectId) => {
    const res = await supabase.rpc('get_current_steps', {
      project_id: projectId,
    })
    return res.data
  }
  const fetchTranslatorStep = async (project, chapter, book) => {
    const res = await supabase.rpc('get_translators_step', {
      project_code: project,
      chapter_num: chapter,
      book_code: book,
    })
    return res.data
  }

  useEffect(() => {
    const handleSetStepsData = (stepsData) => {
      setProjectId(stepsData.projects?.id)
      let stepConfig = {
        title: stepsData.title,
        config: [...stepsData.config],
        whole_chapter: stepsData.whole_chapter,
        resources: { ...stepsData.projects?.resources },
        base_manifest: stepsData.projects?.base_manifest?.resource,
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
    }
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
          const translatorsChapter = await fetchTranslatorStep(project, chapter, book)
          const _lastTranslators = getLastTranslators(translatorsChapter, currentStep)
          setLastTranslators(_lastTranslators)
          if (_lastTranslators) {
            const previousStep = currentStep - 1
            const previousStepsData = await fetchStepsData(project, previousStep)
            if (previousStepsData.is_awaiting_team) {
              setIsWaitLastTranslators(true)
              handleSetStepsData(previousStepsData)
              return replace(`/translate/${project}/${book}/${chapter}/${previousStep}`)
            }
            if (parseInt(step) !== parseInt(currentStep)) {
              return replace(
                `/translate/${project}/${book}/${chapter}/${currentStep}/intro`
              )
            }
          }
        }
        handleSetStepsData(stepsData)
      } catch (error) {
        console.log(error)
      }
    }
    getSteps()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [book, chapter, project, step])

  const handleNextStep = async () => {
    setIsOpenModal(false)
    setLoading(true)
    const { data: next_step } = await supabase.rpc('go_to_step', {
      project,
      book,
      chapter,
      current_step: step,
    })
    localStorage.setItem('highlightIds', JSON.stringify({}))
    setCurrentVerse('1')
    const stepsData = await fetchStepsData(project, step)

    const translatorsChapter = await fetchTranslatorStep(project, chapter, book)
    const _lastTranslators = getLastTranslators(translatorsChapter, next_step)

    if (stepsData.is_awaiting_team && _lastTranslators) {
      setIsWaitLastTranslators(true)
      return
    }
    if (parseInt(step) === parseInt(next_step)) {
      replace(`/account`)
    } else {
      push(`/translate/${project}/${book}/${chapter}/${next_step}/intro`)
    }
  }
  useEffect(() => {
    let isMounted = true
    let mySubscription = null
    const subscribeToRealtimeUpdates = async (chapterId) => {
      if (!isMounted) return
      mySubscription = supabase
        .channel('waitTranslators' + chapterId)
        .on(
          'postgres_changes',
          {
            event: 'UPDATE',
            schema: 'public',
            table: 'verses',
            filter: 'chapter_id=eq.' + chapterId,
          },
          async () => {
            try {
              if (!isMounted) return
              const translatorsChapter = await fetchTranslatorStep(project, chapter, book)
              const _lastTranslators = getLastTranslators(
                translatorsChapter,
                parseInt(step) + 1
              )
              setLastTranslators(_lastTranslators)
              if (!_lastTranslators) {
                setIsWaitLastTranslators(false)
                if (isMounted) {
                  replace(
                    `/translate/${project}/${book}/${chapter}/${parseInt(step) + 1}/intro`
                  )
                }
              }
            } catch (error) {
              console.error(error)
            }
          }
        )
        .subscribe()
    }

    const initializeSubscription = async () => {
      try {
        const res = await supabase.rpc('get_project_book_chapter_verses', {
          project_code: project,
          chapter_num: chapter,
          book_c: book,
        })
        const chapterId = res.data.chapter.id
        subscribeToRealtimeUpdates(chapterId)
      } catch (error) {
        console.log(error)
      }
    }
    if (isWaitLastTranslators) {
      initializeSubscription()
    }
    return () => {
      isMounted = false
      if (mySubscription) {
        supabase.removeChannel(mySubscription)
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [book, chapter, isWaitLastTranslators, project, step, supabase])
  const last = useMemo(() => {
    if (lastTranslators) {
      return lastTranslators.map((translator) => translator.translator)
    }
  }, [lastTranslators])

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
          editable={true}
        />
      ) : (
        t('Loading')
      )}
      <Footer
        textButton={t('Next')}
        textCheckbox={t('Done')}
        handleClick={() => setIsOpenModal(true)}
        loading={loading}
        lastTranslators={last}
        isWaitTranslators={isWaitLastTranslators}
      />
      <Modal isOpen={isOpenModal} closeHandle={() => setIsOpenModal(false)}>
        <div className="flex flex-col gap-7 justify-center items-center">
          <div className="flex flex-row gap-2 text-2xl text-center">
            <p>{t('AreYouSureGoToNextStep')}</p>
          </div>

          <div className="flex justify-center self-center gap-7 w-1/2">
            <button className="btn-secondary flex-1" onClick={handleNextStep}>
              {t('Yes')}
            </button>

            <button
              className="btn-secondary flex-1"
              onClick={() => setIsOpenModal(false)}
            >
              {t('No')}
            </button>
          </div>
        </div>
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
      ...(await serverSideTranslations(locale, [
        'common',
        'steps',
        'audio',
        'books',
        'users',
        'error',
      ])),
      last_step: steps.data.sorting,
    },
  }
}
