import { useCallback, useEffect, useRef, useState } from 'react'

import axios from 'axios'

import { useGetAquiferResources } from 'utils/hooks'
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

  function createTool(name, Component) {
    return {
      name,
      node: (
        <Component
          resourceType={name}
          reference={config.config.reference}
          languageCode={config.config.config.languageCode}
          query={search}
          setIsLoadingSearch={setIsLoadingSearch}
          setSelectedNote={setSelectedNote}
        />
      ),
    }
  }

  const tools = [
    createTool('images', Images),
    // createTool('dictionary', Notes), //закрыл, чтобы не было лишних запросов
    // createTool('studyNotes', Notes), //закрыл, чтобы не было лишних запросов
  ]

  const options = tools.map((item) => item.name)
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
          <div className="flex items-center gap-2.5 border-b border-th-secondary-300 pb-5 mb-7">
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
          {tools.map((tool) => {
            if (selectedOptions.includes(tool.name)) {
              return (
                <div key={tool.name}>
                  <h3 className="font-bold text-xl my-3.5">{t(tool.name)}</h3>
                  {tool.node}
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

  const { resources, loadMore, error, isLoading, isShowLoadMoreButton, isLoadingMore } =
    useGetAquiferResources({
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
              <span> Подгрузить ещё{/*TODO нужен перевод*/}</span>
              <Down className="w-6 max-w-[1.5rem] stroke-th-secondary-300" />
            </>
          )}
        </button>
      )}
    </>
  )
}

function Images({
  resourceType,
  reference,
  languageCode,
  query,
  setSelectedNote,
  setIsLoadingSearch,
}) {
  const verse = useRecoilValue(currentVerse)

  const { resources, loadMore, error, isLoading, isShowLoadMoreButton, isLoadingMore } =
    useGetAquiferResources({
      book_code: reference.book,
      chapter_num: reference.chapter,
      verse_num: verse,
      query,
      language_code: languageCode,
      resource_type: resourceType,
    })
  return (
    <>
      <Carousel
        images={resources}
        isShowLoadMoreButton={isShowLoadMoreButton}
        loadMore={loadMore}
        isLoadingMore={isLoadingMore}
      />
    </>
  )
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
  15. Исправить баг с лоадингом - когда вводишь первые 3 символа. готово
16. проверить все переводы и перевести, если нужно
  17. дизайн фильтра и поиска привести к виду в фигме - готово
  18. поправить дизайн готово


РАБОТА С КАРТИНКАМИ
  1. сделать малую карусель с моковыми данными (взять 10 элементов разных форматов) в работе
2. отображение миниатюр
3. кнопки навигации
4. карусель большая
5. в большую карусель добавить малую карусель
  6. сделать API для загрузки списка, который создаёт массив из id и запрос к каждой картинке по id, чтобы на клиент получить название картинки, id url Саша / готово
  7. написать хук для дозагрузки картинок, если их больше лимита / готово -
8. После настройки карусели удалить моковые картинки
9. Сделать рефакторинг - создать папку Aquifer и в неё перенести компоненты

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
        className="input-primary bg-th-secondary-50"
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
        <SearchIcon
          className="р-6 w-6 stroke-2 stroke-th-secondary-300"
          onClick={handleSearch}
        />
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
      {({ open }) => (
        <div className="relative text-th-text-primary flex items-center w-full">
          <Listbox.Button className="relative flex items-center w-full">
            <input
              className={`input-primary !text-th-secondary-300 truncate bg-th-secondary-50 w-full !pr-8 ${
                open ? '!rounded-b-none' : ''
              }`}
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

            <ArrowRight className="absolute min-w-[1.5rem] stroke-th-secondary-300 right-2 stroke-2 rotate-90" />
          </Listbox.Button>
          <div className="mt-8">
            <Listbox.Options className="absolute w-full left-0 max-h-[40vh] bg-th-secondary-10 border-th-secondary-300 rounded-b-lg overflow-y-auto z-10 border-r border-l border-b">
              {options.map((el) => (
                <Listbox.Option
                  as="div"
                  className="relative flex justify-between items-center px-5 py-1 bg-th-secondary-50 cursor-pointer last:pb-3 hover:bg-th-secondary-100"
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

function Carousel({ images, isShowLoadMoreButton, loadMore, isLoadingMore }) {
  const [currentIndex, setCurrentIndex] = useState(0)
  const containerRef = useRef(null)
  const containerWidth = useRef(null)
  const cardWidth = 144

  const lastIndex = images.length - 1
  const visibleCards = containerWidth.current
    ? Math.floor(containerWidth.current / cardWidth)
    : 0
  const maxVisibleIndex = lastIndex - visibleCards + 2

  const handlePrevClick = () => {
    setCurrentIndex((prevIndex) => (prevIndex === 0 ? 0 : prevIndex - 1))
  }

  const handleNextClick = () => {
    setCurrentIndex((prevIndex) => {
      if (prevIndex === maxVisibleIndex) {
        return prevIndex
      } else {
        return prevIndex + 1
      }
    })
  }

  useEffect(() => {
    if (containerRef.current && containerWidth.current === null) {
      containerWidth.current = containerRef.current.offsetWidth
    }
  }, [])

  useEffect(() => {
    if (containerRef.current) {
      const containerElement = containerRef.current

      containerElement.style.transform = `translateX(-${currentIndex * cardWidth}px)`
      containerElement.style.transition = 'transform 0.3s ease-in-out'
    }
  }, [currentIndex])

  return (
    <>
      <div className="relative overflow-hidden">
        <div className="flex pb-10" ref={containerRef}>
          {images.map((image) => (
            <div key={image.id} className="flex-none w-[134px] h-[83px] mr-2.5">
              <img
                src={image.url}
                alt={image.name}
                className="w-[134px] h-[83px] rounded-[5px]"
              />
              <div className="text-left text-sm mt-2.5 truncate">{image.name}</div>
            </div>
          ))}
          <LoadMoreButton
            isShowLoadMoreButton={isShowLoadMoreButton}
            loadMore={loadMore}
            isLoadingMore={isLoadingMore}
          />
        </div>

        <div className="flex justify-between">
          <button
            className="bg-th-text-primary text-th-secondary-10 font-bold p-3.5 rounded-full disabled:bg-th-secondary-100 disabled:text-gray-400 disabled:cursor-not-allowed"
            onClick={handlePrevClick}
            disabled={currentIndex === 0}
          >
            <ArrowRight className="stroke-2 rotate-180" />
          </button>
          <button
            className="bg-th-text-primary text-th-secondary-10 font-bold p-3.5 rounded-full disabled:bg-th-secondary-100 disabled:text-gray-400 disabled:cursor-not-allowed"
            onClick={handleNextClick}
            disabled={currentIndex === maxVisibleIndex}
          >
            <ArrowRight className="stroke-2" />
          </button>
        </div>
      </div>
    </>
  )
}

const LoadMoreButton = ({ loadMore, isShowLoadMoreButton, isLoadingMore = false }) => {
  return (
    <div className="flex-none w-[134px] h-[83px] mr-2.5 bg-gray-200 hover:bg-gray-300 rounded-[5px] flex items-center justify-center">
      <button
        className="text-gray-800 font-bold py-2 px-4 rounded"
        onClick={loadMore}
        disabled={!isShowLoadMoreButton}
      >
        {isLoadingMore ? (
          <Loading className="progress-custom-colors m-auto w-6 animate-spin stroke-th-primary-100 opacity-70" />
        ) : (
          <span>Подгрузить еще</span>
        )}
      </button>
      {/* TODO:добавить перевод*/}
    </div>
  )
}
