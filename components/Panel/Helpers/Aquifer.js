import { useState } from 'react'

import axios from 'axios'

import { useGetAquaphierNotes } from 'utils/hooks'
import { useTranslation } from 'react-i18next'
import { useRecoilValue } from 'recoil'

import { currentVerse } from '../../state/atoms'
import { TNTWLContent } from '../UI'

import Close from 'public/close.svg'
import ArrowRight from 'public/folder-arrow-right.svg'

function Aquifer(config) {
  const { t } = useTranslation()
  const [query, setQuery] = useState('')
  const [search, setSearch] = useState('')
  const [selectedNote, setSelectedNote] = useState(null)

  return (
    <>
      {selectedNote ? (
        <TNTWLContent
          setItem={setSelectedNote}
          item={{
            text: selectedNote.text,
            title: selectedNote.title,
          }}
        />
      ) : (
        <>
          <div className="relative flex items-center">
            <input
              className="input-primary"
              placeholder={t('Search')}
              onChange={(e) => {
                setQuery(e.target.value)
              }}
              onBlur={() => {
                setSearch(query)
              }}
              value={query}
            />
            {query && (
              <Close
                className="absolute р-6 w-6 z-10 cursor-pointer right-2"
                onClick={() => {
                  setQuery('')
                  setSearch('')
                }}
              />
            )}
          </div>
          <div className="mb-10">Тут будет поиск</div>
          <div className="mb-10">Тут будут картинки</div>
          <h3 className="font-bold text-xl my-3.5">Dictionary</h3>

          <Notes
            resourceType="Dictionary"
            reference={config.config.reference}
            languageCode={config.config.config.languageCode}
            query={search}
            setSelectedNote={setSelectedNote}
          />
          <h3 className="font-bold text-xl my-3.5">StudyNotes</h3>
          <Notes
            resourceType="StudyNotes"
            reference={config.config.reference}
            languageCode={config.config.config.languageCode}
            query={search}
            setSelectedNote={setSelectedNote}
          />
        </>
      )}
    </>
  )
}

export default Aquifer

function Notes({ resourceType, reference, languageCode, query, setSelectedNote }) {
  const verse = useRecoilValue(currentVerse)
  const [isLoadingNote, setIsLoadingNote] = useState(false)

  const {
    notes,
    loadMore,
    error,
    isLoading,
    isValidating,
    mutate,
    size,
    setSize,
    isShowLoadMoreButton,
  } = useGetAquaphierNotes({
    book_code: reference.book,
    chapter_num: reference.chapter,
    verse_num: verse,
    query,
    language_code: languageCode,
    resource_type: resourceType,
  })

  const getNoteContent = async (id) => {
    setIsLoadingNote(true)
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
      setIsLoadingNote(false)
    }
  }

  return (
    <>
      <ul>
        {notes.map((note) => (
          <li
            key={note.id}
            onClick={() => getNoteContent(note.id)}
            className="flex justify-between items-center px-5 mt-2.5 leading-[47px] text-lg cursor-pointer rounded-lg bg-th-secondary-100 hover:bg-th-secondary-200 ltr:flex"
          >
            <span>{note.name}</span>
            <span>
              <ArrowRight className="stroke-2" />
            </span>
          </li>
        ))}
      </ul>

      {isShowLoadMoreButton && (
        <button className="btn-primary mt-3.5" onClick={loadMore}>
          Подгрузить ещё
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
  1. Сделать api для загрузки конкретной note по id - готово
  2. Сделать список на клиенте по дизайну. - готово
  3. Сделать открытие конкретной note по клику, используя наш комопнент TNTWLContent - готово
  4. Подумать, как показывать TNTWLContent на весь компонент Aquifer - готово
5. Спросить у Влада про кнопку "Подгрузить всё"
  6. Проверить правильную работу компонента, меняя параметры.//Саша - готово
  7. Убрать значения по-умолчанию в хуке, передавать в компонент Aquifer референс и languageCode.//Саша - готово
8. Добавить фильтр, который отключает разные типы ресурсов
  9. Добавить поиск // готово
  10. Возвращать кол-во всех записей с запроса (параметр totalItemCount) из хука и на клиенте сравнивать с кол-вом всех записей в масиве Notes
и если значение равны - кнопку "подгрузить ещё" не показывать. также не показывать эту кнопку, если длина массива notes больше или равна limits.
может быть делать эти расчёты внутри хука а выдавать параметр - isShowLoadMoreButton готово
11. Сделать лоадинг, когда грузятся записи. Саша
12 Сделать лоадинг, когда грузится 1 запись и сделать неактивным нажатие кнопки "подгрузить ещё" в момент загрузки Саша


Владу задачи - вопросы
Кнопка дозагрузки
Кнопка для начала поиска

*/
