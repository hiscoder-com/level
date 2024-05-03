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
  const imgArray = [
    {
      id: 1,
      name: 'WEB-0050_babylon_exil_fugel',
      url: 'http://localhost:3000/aquifer/WEB-0050_babylon_exil_fugel.jpg',
    },
    {
      id: 2,
      name: 'WEB-0121_fire',
      url: 'http://localhost:3000/aquifer/WEB-0121_fire.jpg',
    },
    {
      id: 3,
      name: 'WEB-0136_city_gate',
      url: 'http://localhost:3000/aquifer/WEB-0136_city_gate.jpg',
    },
    {
      id: 4,
      name: 'WEB-0206_exile_capture_lachish',
      url: 'http://localhost:3000/aquifer/WEB-0206_exile_capture_lachish copy.jpg',
    },
    {
      id: 5,
      name: 'WEB-0221_fire copy 2',
      url: 'http://localhost:3000/aquifer/WEB-0221_fire copy 2.jpg',
    },
    {
      id: 6,
      name: 'WEB-0422_city_gate_en',
      url: 'http://localhost:3000/aquifer/WEB-0422_city_gate_en.jpg',
    },
    {
      id: 7,
      name: 'WEB-0506_exile_capture_lachish',
      url: 'http://localhost:3000/aquifer/WEB-0506_exile_capture_lachish.jpg',
    },
    {
      id: 8,
      name: 'WEB-0544_jehu_obelisk',
      url: 'http://localhost:3000/aquifer/WEB-0544_jehu_obelisk.jpg',
    },
    {
      id: 9,
      name: 'WEB-0575_lachish_relief_exile',
      url: 'http://localhost:3000/aquifer/WEB-0575_lachish_relief_exile.jpg',
    },
    {
      id: 10,
      name: 'WEB-0621_fire copy',
      url: 'http://localhost:3000/aquifer/WEB-0621_fire copy.jpg',
    },
  ]
  return (
    <>
      {/* <div className="mb-10">Тут будут картинки</div> */}
      <Carousel images={imgArray} />
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
  6. сделать API для загрузки списка, который создаёт массив из id и запрос к каждой картинке по id, чтобы на клиент получить название картинки, id url Саша
7. написать хук для дозагрузки картинок, если их больше лимита
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

function Carousel({ images }) {
  const [currentIndex, setCurrentIndex] = useState(0)

  const handlePrevClick = () => {
    setCurrentIndex((prevIndex) => (prevIndex === 0 ? images.length - 1 : prevIndex - 1))
  }

  const handleNextClick = () => {
    setCurrentIndex((prevIndex) => (prevIndex === images.length - 1 ? 0 : prevIndex + 1))
  }

  return (
    <div className="relative">
      <div className="flex overflow-hidden">
        {images.map((image, index) => (
          <div
            key={image.id}
            className={`flex-none w-full md:w-1/3 ${
              index === currentIndex ? 'block' : 'hidden md:block'
            }`}
          >
            <img
              src={image.url}
              alt={image.name}
              className="w-[134px] h-[83px] rounded-[5px]"
            />
            <div className="text-center mt-2">{image.name}</div>
          </div>
        ))}
      </div>
      <div className="flex justify-center mt-4">
        <button
          className="bg-gray-300 hover:bg-gray-400 text-gray-800 font-bold py-2 px-4 rounded-l"
          onClick={handlePrevClick}
        >
          Prev
        </button>
        <button
          className="bg-gray-300 hover:bg-gray-400 text-gray-800 font-bold py-2 px-4 rounded-r"
          onClick={handleNextClick}
        >
          Next
        </button>
      </div>
    </div>
  )
}
