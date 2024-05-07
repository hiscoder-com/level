import { useEffect, useState } from 'react'

import axios from 'axios'
import { useRecoilValue } from 'recoil'
import { useTranslation } from 'react-i18next'

import { currentVerse } from '../../../state/atoms'
import { useGetAquiferResources } from 'utils/hooks'

import Down from '/public/arrow-down.svg'
import ArrowRight from 'public/folder-arrow-right.svg'
import Loading from 'public/progress.svg'

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
        <Loading className="progress-custom-colors m-auto w-6 animate-spin stroke-th-primary-100 right-2" />
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
              className={`flex justify-between items-center px-5 mt-2.5 leading-[47px] text-lg rounded-lg bg-th-secondary-100 hover:bg-th-secondary-200 ltr:flex ${
                loadingNoteId === note.id
                  ? 'opacity-70 cursor-not-allowed'
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
                    <Loading className="w-6 h-6 animate-spin stroke-th-primary-100" />
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
          className="flex gap-1 justify-center w-full pt-3 border-t border-th-secondary-300 text-th-secondary-300 mt-2.5"
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
