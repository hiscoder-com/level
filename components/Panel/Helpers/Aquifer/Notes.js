import { useEffect, useState } from 'react'

import axios from 'axios'
import ArrowRight from 'public/folder-arrow-right.svg'
import Loading from 'public/progress.svg'
import { useTranslation } from 'react-i18next'
import { useRecoilValue } from 'recoil'
import { useGetAquiferResources } from 'utils/hooks'

import { currentVerse } from '../../../state/atoms'
import Down from '/public/arrow-down.svg'

function Notes({
  resourceType,
  reference,
  languageCode,
  query,
  setSelectedNote,
  setIsLoadingSearch,
  isShowAllChapter,
}) {
  const { t } = useTranslation('common')
  const verse = useRecoilValue(currentVerse)
  const [loadingNoteId, setLoadingNoteId] = useState(null)

  const { resources, loadMore, error, isLoading, isShowLoadMoreButton, isLoadingMore } =
    useGetAquiferResources({
      book_code: reference.book,
      chapter_num: isShowAllChapter ? 0 : reference.chapter,
      verse_num: isShowAllChapter ? 0 : verse,
      query,
      language_code: languageCode,
      resource_type: resourceType,
    })

  useEffect(() => {
    if (query.length > 2) {
      setIsLoadingSearch(isLoading)
    }
  }, [isLoading, query, setIsLoadingSearch])

  const getNoteContent = async (id) => {
    setLoadingNoteId(id)
    try {
      const response = await axios.get(`/api/aquifer/notes/${id}`)
      const { name, content } = response.data
      const text = content
        .map((item) => {
          const paragraphs = item.tiptap.content.map((node) => {
            if (node.type === 'paragraph') {
              return node.content.map((textNode) => textNode.text).join('')
            }
            return ''
          })
          return paragraphs.join('\n\n')
        })
        .join('')

      const formattedNote = { text, title: name }
      setSelectedNote(formattedNote)
    } catch (error) {
      console.error('Error fetching note:', error)
    } finally {
      setLoadingNoteId(null)
    }
  }

  return (
    <>
      {isLoading && !resources?.length ? (
        <Loading className="progress-custom-colors right-2 m-auto w-6 animate-spin stroke-th-primary-100" />
      ) : (
        <ul>
          {resources.map((note) => (
            <li
              key={note.id}
              onClick={() => {
                if (loadingNoteId !== note.id) {
                  getNoteContent(note.id)
                }
              }}
              className={`mt-2.5 flex items-center justify-between rounded-lg bg-th-secondary-100 px-5 text-lg leading-[47px] hover:bg-th-secondary-200 ltr:flex ${
                loadingNoteId === note.id
                  ? 'cursor-not-allowed opacity-70'
                  : 'cursor-pointer'
              }`}
            >
              <div
                className={`relative flex-1 overflow-hidden whitespace-nowrap ${
                  loadingNoteId === note.id ? '' : 'text-ellipsis'
                }`}
              >
                <span
                  className={`${loadingNoteId === note.id ? 'opacity-0' : 'opacity-100'}`}
                >
                  {note.name}
                </span>
                {loadingNoteId === note.id && (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <Loading className="h-6 w-6 animate-spin stroke-th-primary-100" />
                  </div>
                )}
              </div>

              {loadingNoteId !== note.id && (
                <span>
                  <ArrowRight className="stroke-2" />
                </span>
              )}
            </li>
          ))}
        </ul>
      )}
      {isShowLoadMoreButton && (
        <button
          className="mt-2.5 flex w-full justify-center gap-1 border-t border-th-secondary-300 pt-3 text-th-secondary-300"
          onClick={loadMore}
          disabled={isLoadingMore}
        >
          {isLoadingMore ? (
            <Loading className="progress-custom-colors m-auto w-6 animate-spin stroke-th-primary-100 opacity-70" />
          ) : (
            <>
              <span>{t('LoadMore')}</span>
              <Down className="w-6 max-w-[1.5rem] stroke-th-secondary-300" />
            </>
          )}
        </button>
      )}
    </>
  )
}
export default Notes
