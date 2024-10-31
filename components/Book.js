import { useMemo } from 'react'

import { useTranslation } from 'react-i18next'

import MarkdownExtended from 'components/MarkdownExtended'

import { obsCheckAdditionalVerses } from 'utils/helper'
import { useGetWholeBook } from 'utils/hooks'

import Loading from 'public/icons/progress.svg'

function Book({ config, url }) {
  const { t } = useTranslation()
  const { isLoading, data } = useGetWholeBook({
    config: {
      resource: config.mainResource,
      book: config.book,
      bookPath: config.bookPath,
    },
    url,
  })

  const chapters = useMemo(() => {
    if (!data && isLoading) {
      return (
        <Loading className="progress-light absolute inset-0 mx-auto my-auto w-12 animate-spin" />
      )
    }
    return Object.keys(data).map((key) => {
      return (
        <div key={key}>
          <h1 className="text-xl font-bold">{t('Chapter') + ' ' + key}</h1>
          <Verses verseObjects={data[key]} />
        </div>
      )
    })
  }, [data, isLoading, t])

  return <>{chapters}</>
}

export default Book

function Verses({ verseObjects }) {
  return (
    <>
      {verseObjects?.map((verseObject) => (
        <div key={verseObject.verse} className="rounded-lg p-2">
          <MarkdownExtended>
            {obsCheckAdditionalVerses(verseObject.verse) + ' ' + verseObject.text}
          </MarkdownExtended>
        </div>
      ))}
    </>
  )
}
