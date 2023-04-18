import { useTranslation } from 'next-i18next'
import { oldTestamentList, newTestamentList } from 'utils/config'

function BookListNew() {
  const testaments = [
    { title: 'OldTestament', books: oldTestamentList },
    { title: 'NewTestament', books: newTestamentList },
  ]
  return (
    <div className="card flex">
      {testaments.map((testament) => (
        <div key={testament.title} className="w-1/2">
          <Testament books={testament.books} title={testament.title} />
        </div>
      ))}
    </div>
  )
}

export default BookListNew
// import Checking from '../../public/checking.svg'
import Gear from '../../public/gear.svg'
import Book from '../../public/dictionary.svg'
import Pencil from '../../public/editor-pencil.svg'
import Download from '../../public/download.svg'

function Testament({ books, title }) {
  const { t } = useTranslation(['books'])
  return (
    <div className="flex flex-col gap-7 px-3 max-h-[80vh]">
      <h3 className="h3 font-bold">{title}</h3>
      <div className="flex flex-col gap-4 overflow-y-scroll px-4">
        {books.map((el) => (
          <div key={el} className="flex justify-between items-center gap-2">
            <div className="flex items-center text-darkBlue">
              <div>{/* <Checking /> */}</div>
              <div>{t(`books:${el}`)}</div>
            </div>
            <div className="flex gap-2 text-darkBlue">
              <Gear className="w-6" /> <Book className="w-6" /> <Pencil className="w-6" />{' '}
              <Download className="w-6" />
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
