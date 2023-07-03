import { useEffect, useState } from 'react'

import Head from 'next/head'
import { useRouter } from 'next/router'

import { serverSideTranslations } from 'next-i18next/serverSideTranslations'

import IntroStep from 'components/IntroStep'

import useSupabaseClient from 'utils/supabaseClient'
import { supabaseService } from 'utils/supabaseServer'

export default function IntroPage() {
  const supabase = useSupabaseClient()
  const { query, replace } = useRouter()
  const { project, book, chapter, step } = query

  const [introMd, setIntroMd] = useState('')
  const [title, setTitle] = useState('')
  useEffect(() => {
    supabase
      .from('steps')
      .select('title,intro,sorting,projects!inner(code,id)')
      .match({ 'projects.code': project, sorting: step })
      .single()
      .then((res) => {
        setIntroMd(res.data.intro)
        setTitle(res.data.title)
        supabase
          .rpc('get_current_steps', { project_id: res.data.projects.id })
          .then((response) => {
            // пришел массив из книг, глав и шагов. Надо пройти, проверить есть ли наша глава.
            // если нет - ошибка или редирект
            // если есть - сверить шаг. Если совпадает - все ок, если нет - перейти на нужный шаг
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
          })
      })
  }, [book, chapter, project, replace, step, supabase])
  return (
    <div className="layout-appbar">
      <Head>
        <title>{title}</title>
        <meta name="description" content="VCANA" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <IntroStep
        markdown={introMd}
        title={title}
        nextLink={`/translate/${project}/${book}/${chapter}/${step}/`}
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
      ...(await serverSideTranslations(locale, ['intro-steps', 'common', 'users'])),
    },
  }
}
