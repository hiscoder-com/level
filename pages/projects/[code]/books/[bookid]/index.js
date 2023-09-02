import { useEffect } from 'react'

import { serverSideTranslations } from 'next-i18next/serverSideTranslations'

import ChapterList from 'components/Project/ChapterList/ChapterList'
import { useSetRecoilState } from 'recoil'
import { isSwitchingPageState } from 'components/state/atoms'

function ChapterListPage() {
  const setSwitchingPage = useSetRecoilState(isSwitchingPageState)

  useEffect(() => {
    setSwitchingPage(false)
  }, [setSwitchingPage])
  return <ChapterList />
}

export default ChapterListPage

export async function getServerSideProps({ locale }) {
  return {
    props: {
      ...(await serverSideTranslations(locale, ['common', 'books', 'users'])),
    },
  }
}
