import { useEffect, useMemo, useState } from 'react'

import Head from 'next/head'
import { useRouter } from 'next/router'

import { useSetRecoilState } from 'recoil'
import { useTranslation } from 'next-i18next'
import { serverSideTranslations } from 'next-i18next/serverSideTranslations'

import Workspace from 'components/Workspace'
import Translators from 'components/Translators'

import { stepConfigState } from 'components/Panel/state/atoms'

import { useCurrentUser } from 'lib/UserContext'
import useSupabaseClient from 'utils/supabaseClient'
import { supabaseService } from 'utils/supabaseService'
import { useAccess } from 'utils/hooks'

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
  const [{ isSupporterAccess }] = useAccess({ user_id: user?.id, code: project })
  const { t } = useTranslation(['common'])
  const [stepConfig, setStepConfig] = useState(null)
  const [versesRange, setVersesRange] = useState([])
  const [translators, setTranslators] = useState([])

  useEffect(() => {
    supabase
      .rpc('get_all_steps_by_chapter', {
        project_code: project,
        book_code: book,
        chapter_num: chapter,
      })
      .then((res) => {
        console.log(res.data)
        const translators = res?.data?.map((translator) => ({
          step: translator.step,
          login: translator.login,
          stepTitle: translator.title,
        }))
        setTranslators(translators)
      })
  }, [book, chapter, project, supabase, step])

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
        const filters = ['personalNotes', 'teamNotes', 'dictionary']
        const filteredConfig = res.data?.config.map((config) => {
          return {
            ...config,
            tools: config.tools.filter((tool) => !filters.includes(tool.name)),
          }
        })

        let stepConfig = {
          title: res.data?.title,
          config: [...filteredConfig],
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
  }, [book, chapter, last_step, project, replace, setStepConfigData, step, supabase])

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

      <div className="flex justify-between items-center px-6 lg:px-0 mx-auto w-full max-w-7xl bg-blue-150">
        <div className="my-4">
          <Translators
            projectCode={project}
            size="34px"
            clickable={true}
            activeTranslators={translators}
            support
          />
        </div>
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
