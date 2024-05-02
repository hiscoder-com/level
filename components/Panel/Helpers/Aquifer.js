import { useCallback, useEffect, useState } from 'react'

import axios from 'axios'

<<<<<<< HEAD
import { useGetAquiferNotes } from 'utils/hooks'
import { useRecoilValue } from 'recoil'
import toast from 'react-hot-toast'
import { useTranslation } from 'react-i18next'
=======
import { useTranslation } from 'react-i18next'
import { useGetAquiferNotes } from 'utils/hooks'
import { useRecoilValue } from 'recoil'
import toast from 'react-hot-toast'
>>>>>>> ccc6eac42a520bdd9bba13c6602a13197972abb4

import { currentVerse } from '../../state/atoms'
import { TNTWLContent } from '../UI'

<<<<<<< HEAD
import Down from '/public/arrow-down.svg'
import ArrowRight from 'public/folder-arrow-right.svg'
import Loading from 'public/progress.svg'
import SearchIcon from 'public/search.svg'

function Aquifer(config) {
  const { t } = useTranslation()
  const [search, setSearch] = useState('')
  const [selectedNote, setSelectedNote] = useState(null)
  const [isLoadingSearch, setIsLoadingSearch] = useState(false)

=======
import SearchIcon from 'public/search.svg'
import ArrowRight from 'public/folder-arrow-right.svg'
import Loading from 'public/progress.svg'
import Down from '/public/arrow-down.svg'

function Aquifer(config) {
  const { t } = useTranslation()
  const [query, setQuery] = useState('')
  const [selectedNote, setSelectedNote] = useState(null)
  const [search, setSearch] = useState('')
  const [isLoadingSearch, setIsLoadingSearch] = useState(false)
>>>>>>> ccc6eac42a520bdd9bba13c6602a13197972abb4
  return (
    <>
      {selectedNote ? (
        <div className="relative h-full">
          <TNTWLContent
            setItem={setSelectedNote}
            item={{
              text: selectedNote.text,
              title: selectedNote.title,
            }}
          />
        </div>
      ) : (
        <>
          <Search setSearch={setSearch} isLoading={isLoadingSearch} />
          <h3 className="font-bold text-xl my-3.5">{t('dictionary')}</h3>

          <Notes
            resourceType="Dictionary"
            reference={config.config.reference}
            languageCode={config.config.config.languageCode}
            query={search}
            setIsLoadingSearch={setIsLoadingSearch}
<<<<<<< HEAD
            setSelectedNote={setSelectedNote}
          />
          <h3 className="font-bold text-xl my-3.5">StudyNotes</h3>
          {/*TODO нужен перевод*/}
=======
          />
          <h3 className="font-bold text-xl my-3.5">StudyNotes</h3>
 {/*TODO нужен перевод*/}
>>>>>>> ccc6eac42a520bdd9bba13c6602a13197972abb4
          <Notes
            resourceType="StudyNotes"
            reference={config.config.reference}
            languageCode={config.config.config.languageCode}
            query={search}
            setIsLoadingSearch={setIsLoadingSearch}
<<<<<<< HEAD
            setSelectedNote={setSelectedNote}
=======
>>>>>>> ccc6eac42a520bdd9bba13c6602a13197972abb4
          />
        </>
      )}
    </>
  )
}

export default Aquifer

<<<<<<< HEAD
function Notes({
  resourceType,
  reference,
  languageCode,
  query,
  setSelectedNote,
  setIsLoadingSearch,
}) {
=======
function Notes({ resourceType, reference, languageCode, query, setIsLoadingSearch }) {
>>>>>>> ccc6eac42a520bdd9bba13c6602a13197972abb4
  const verse = useRecoilValue(currentVerse)
  const [loadingNoteId, setLoadingNoteId] = useState(null)
  const [note, setNote] = useState(null)
  const { notes, loadMore, error, isLoading, isShowLoadMoreButton, isLoadingMore } =
    useGetAquiferNotes({
      book_code: reference.book,
      chapter_num: reference.chapter,
      verse_num: verse,
      query,
      language_code: languageCode,
      resource_type: resourceType,
    })

<<<<<<< HEAD
  const { notes, loadMore, error, isLoading, isShowLoadMoreButton, isLoadingMore } =
    useGetAquiferNotes({
      book_code: reference.book,
      chapter_num: reference.chapter,
      verse_num: verse,
      query,
      language_code: languageCode,
      resource_type: resourceType,
    })

=======
>>>>>>> ccc6eac42a520bdd9bba13c6602a13197972abb4
  useEffect(() => {
    if (query.length > 2) {
      setIsLoadingSearch(isLoading)
    }
  }, [isLoading, query, setIsLoadingSearch])

  const getNoteContent = async (id) => {
    setIsLoadingNote(true)
    const currentNote = await axios.get(`api/aquaphier/notes/${id}`)
    if (currentNote) {
      setNote(currentNote.data)

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
      {isLoading && !notes?.length ? (
        <Loading className="progress-custom-colors m-auto w-6 animate-spin stroke-th-primary-100 right-2" />
      ) : (
<<<<<<< HEAD
        <ul>
          {notes.map((note) => (
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
=======
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
>>>>>>> ccc6eac42a520bdd9bba13c6602a13197972abb4
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
              <span> Подгрузить ещё{/*TODO нужен перевод*/}</span>
              <Down className="w-6 max-w-[1.5rem] stroke-th-secondary-300" />
            </>
          )}
        </button>
      )}
    </>
  )
}

function Images() {
  return <div className="mb-10">Тут будут картинки</div>
}

//TODO
/*
1. Сделать api для загрузки конкретной note по id
  2. Сделать список на клиенте по дизайну. - готово
3. Сделать открытие конкретной note по клику, используя наш комопнент TNTWLContent
4. Подумать, как показывать TNTWLContent на весь компонент Aquifer
5. Переделать кнопку "Подгрузить всё"  
  6. Проверить правильную работу компонента, меняя параметры.//Саша - готово
  7. Убрать значения по-умолчанию в хуке, передавать в компонент Aquifer референс и languageCode.//Саша - готово
8. Добавить фильтр, который отключает разные типы ресурсов
  9. Добавить поиск // Саша - готово
  10. Возвращать кол-во всех записей с запроса (параметр totalItemCount) из хука и на клиенте сравнивать с кол-вом всех записей в масиве Notes
  и если значение равны - кнопку "подгрузить ещё" не показывать. также не показывать эту кнопку, если длина массива notes больше или равна limits.
  может быть делать эти расчёты внутри хука а выдавать параметр - isShowLoadMoreButton  - готово
  11. Сделать лоадинг, когда грузятся записи. //готово
12 Сделать лоадинг, когда грузится 1 запись 
  13. Сделать лоадинг и сделать неактивным нажатие кнопки "подгрузить ещё" в момент загрузки. -готово


Владу задачи - вопросы
Кнопка дозагрузки
Кнопка для начала поиска

*/

function Search({ setSearch, isLoading = false }) {
  const { t } = useTranslation()
  const [query, setQuery] = useState('')
  const handleSearch = useCallback(() => {
    if (!query || query.length < 3) {
      toast(t('Please enter at least 3 characters'), {
        icon: <SearchIcon className="w-6" />,
      })
    }
    setSearch(query)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [query])
  useEffect(() => {
    const keyDownHandler = (event) => {
      if (event.key === 'Enter') {
        event.preventDefault()
        handleSearch()
      }
    }
    document.addEventListener('keydown', keyDownHandler)
    return () => {
      document.removeEventListener('keydown', keyDownHandler)
    }
  }, [handleSearch])
  return (
    <div className="relative flex items-center w-full">
      <input
        className="input-primary "
        placeholder={t('Search')}
        onChange={(e) => {
          const text = e.target.value
          setQuery(text)
          if (!text) {
            setSearch('')
          }
        }}
        value={query}
      />
      <button className="absolute right-2 z-10 cursor-pointer disabled={isLoading}">
        <SearchIcon className=" р-6 w-6 stroke-2" onClick={handleSearch} />
      </button>
    </div>
  )
}
