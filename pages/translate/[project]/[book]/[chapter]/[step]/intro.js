import { useEffect, useState } from 'react'

import Head from 'next/head'
import { useRouter } from 'next/router'

import { serverSideTranslations } from 'next-i18next/serverSideTranslations'
import { useTranslation } from 'next-i18next'

import IntroStep from 'components/IntroStep'
import { supabase } from 'utils/supabaseClient'
import { supabaseService } from 'utils/supabaseServer'

export default function IntroPage() {
  const { query } = useRouter()
  const { project, book, chapter, step } = query
  const [introMd, setIntroMd] = useState('')
  const { t } = useTranslation(['intro-steps'])
  useEffect(() => {
    supabase
      .from('steps')
      .select('intro,sorting,projects!inner(code)')
      .match({ 'projects.code': project, sorting: step })
      .single()
      .then((res) => setIntroMd(res.data.intro))
  }, [project, step])
  const title = t('V-CANAIntro') + ' ' + step
  return (
    <div className="layout-appbar">
      <Head>
        <title>{title}</title>
        <meta name="description" content="VCANA" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <IntroStep
        markdown={introMd}
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
      ...(await serverSideTranslations(locale, ['intro-steps', 'common'])),
    },
  }
}
