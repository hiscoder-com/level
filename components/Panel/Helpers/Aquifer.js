import { useCallback, useEffect, useState } from 'react'

import axios from 'axios'

import { useGetAquiferNotes } from 'utils/hooks'
import { useRecoilValue } from 'recoil'
import toast from 'react-hot-toast'
import { useTranslation } from 'react-i18next'
import { Listbox } from '@headlessui/react'

import { currentVerse } from '../../state/atoms'
import { TNTWLContent } from '../UI'

import Down from '/public/arrow-down.svg'
import ArrowRight from 'public/folder-arrow-right.svg'
import Loading from 'public/progress.svg'
import SearchIcon from 'public/search.svg'
import Check from 'public/check.svg'

function Aquifer(config) {
  const { t } = useTranslation()
  const [search, setSearch] = useState('')
  const [selectedNote, setSelectedNote] = useState(null)
  const [isLoadingSearch, setIsLoadingSearch] = useState(false)

  const resources = [
    { name: 'Images', node: <Images /> },
    {
      name: 'Dictionary',
      node: (
        <Notes
          resourceType="Dictionary"
          reference={config.config.reference}
          languageCode={config.config.config.languageCode}
          query={search}
          setIsLoadingSearch={setIsLoadingSearch}
          setSelectedNote={setSelectedNote}
        />
      ),
    },
    {
      name: 'StudyNotes',
      node: (
        <Notes
          resourceType="StudyNotes"
          reference={config.config.reference}
          languageCode={config.config.config.languageCode}
          query={search}
          setIsLoadingSearch={setIsLoadingSearch}
          setSelectedNote={setSelectedNote}
        />
      ),
    },
  ]
  const options = resources.map((item) => item.name)
  const [selectedOptions, setSelectedOptions] = useState(options)

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
          <div className="flex items-center gap-2 border-b border-th-secondary-300 pb-4">
            <ListBoxMultiple
              options={options}
              selectedOptions={selectedOptions}
              setSelectedOptions={setSelectedOptions}
              placeholderEmpty={t('ChooseResources')}
              placeholderFull={t('AllResources')}
            />
            {/*TODO нужен перевод - AllResources*/}
            <Search setSearch={setSearch} isLoading={isLoadingSearch} />
          </div>
          {resources.map((resource) => {
            if (selectedOptions.includes(resource.name)) {
              return (
                <div key={resource.name}>
                  <h3 className="font-bold text-xl my-3.5">{t(resource.name)}</h3>
                  {resource.node}
                </div>
              )
            }

            return null
          })}
        </>
      )}
    </>
  )
}

export default Aquifer

function Notes({
  resourceType,
  reference,
  languageCode,
  query,
  setSelectedNote,
  setIsLoadingSearch,
}) {
  const verse = useRecoilValue(currentVerse)
  const [loadingNoteId, setLoadingNoteId] = useState(null)

  const { notes, loadMore, error, isLoading, isShowLoadMoreButton, isLoadingMore } =
    useGetAquiferNotes({
      book_code: reference.book,
      chapter_num: reference.chapter,
      verse_num: verse,
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
      {isLoading && !notes?.length ? (
        <Loading className="progress-custom-colors m-auto w-6 animate-spin stroke-th-primary-100 right-2" />
      ) : (
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
  1. Сделать api для загрузки конкретной note по id  - готово
  2. Сделать список на клиенте по дизайну. - готово
  3 . Сделать открытие конкретной note по клику, используя наш комопнент TNTWLContent - готово
  4. Подумать, как показывать TNTWLContent на весь компонент Aquifer - готово
  5. Переделать кнопку "Подгрузить всё"  - готово
  6. Проверить правильную работу компонента, меняя параметры.// готово
  7. Убрать значения по-умолчанию в хуке, передавать в компонент Aquifer референс и languageCode.// готово
8. Добавить фильтр, который отключает разные типы ресурсов
  9. Добавить поиск // Саша - готово
  10. Возвращать кол-во всех записей с запроса (параметр totalItemCount) из хука и на клиенте сравнивать с кол-вом всех записей в масиве Notes
  и если значение равны - кнопку "подгрузить ещё" не показывать. также не показывать эту кнопку, если длина массива notes больше или равна limits.
  может быть делать эти расчёты внутри хука а выдавать параметр - isShowLoadMoreButton  - готово
  11. Сделать лоадинг, когда грузятся записи. //готово
  12 Сделать лоадинг, когда грузится 1 запись 
  13. Сделать лоадинг и сделать неактивным нажатие кнопки "подгрузить ещё" в момент загрузки. -готово
14. Запоминать позицию скролла - если останется время. Когда много элементов в словаре , открывается контент, а потом возвращается - скроллится в начало.
  15. Исправить баг с лоадингом - когда вводишь первые 3 символа. - готово

РАБОТА С КАРТИНКАМИ
1. сделать малую карусель с моковыми данными (взять 10 элементов разных форматов)
2. отображение миниатюр
3. кнопки навигации
4. карусель большая
5. в большую карусель добавить малую карусель
6. сделать API для загрузки списка, который создаёт массив из id и запрос к каждой картинке по id, чтобы на клиент получить название картинки, id url
7. написать хук для дозагрузки картинок, если их больше лимита


*/

function Search({ setSearch, isLoading = false }) {
  const { t } = useTranslation()
  const [query, setQuery] = useState('')
  const handleSearch = useCallback(() => {
    if (!query || query.length < 3) {
      //TODO Нужен перевод
      toast(t('Please enter at least 3 characters'), {
        icon: <SearchIcon className="w-6" />,
      })
      return
    }
    setSearch(query.trim())
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

function ListBoxMultiple({
  options,
  selectedOptions,
  setSelectedOptions,
  placeholderFull = '',
  placeholderEmpty = '',
}) {
  const isSelected = (value) => selectedOptions.includes(value)

  const handleOptionClicked = (value) => {
    if (isSelected(value)) {
      setSelectedOptions(selectedOptions.filter((option) => option !== value))
    } else {
      setSelectedOptions([...selectedOptions, value])
    }
  }

  return (
    <Listbox value={selectedOptions} onChange={() => {}} multiple>
      {/** TODO Проверить - нужен ли open, если нет- убрать */}
      {({ open }) => (
        <div className="relative text-th-text-primary flex items-center w-full">
          <Listbox.Button className="relative flex items-center w-full">
            <input
              className="input-primary truncate bg-th-secondary-100 w-full pr-4"
              value={
                options.length === selectedOptions.length
                  ? placeholderFull
                  : selectedOptions.length > 0
                  ? selectedOptions.join(', ')
                  : placeholderEmpty
              }
              readOnly
            />
            {/*TODO нужен перевод */}

            <ArrowRight className="absolute min-w-[1.5rem] stroke-th-text-primary right-2 rotate-90" />
          </Listbox.Button>
          <div className="mt-8">
            <Listbox.Options className="absolute w-full left-0 max-h-[40vh] bg-th-secondary-10 rounded-b-lg overflow-y-auto z-10 border-r border-l border-b">
              {options.map((el) => (
                <Listbox.Option
                  as="div"
                  className="relative flex justify-between items-center px-5 py-1 bg-th-secondary-10 cursor-pointer last:pb-3 hover:bg-th-secondary-100"
                  key={el}
                  value={el}
                  onClick={() => handleOptionClicked(el)}
                >
                  <span>{el}</span>
                  {selectedOptions.includes(el) && <Check className="w-6 h-6" />}
                </Listbox.Option>
              ))}
            </Listbox.Options>
          </div>
        </div>
      )}
    </Listbox>
  )
}
