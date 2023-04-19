import { useMemo } from 'react'

import { useTranslation } from 'next-i18next'

import { useGetBooks } from 'utils/hooks'

import Checking from '../../public/checking.svg'
import Gear from '../../public/gear.svg'
import Book from '../../public/dictionary.svg'
import Pencil from '../../public/editor-pencil.svg'
import Download from '../../public/download.svg'
import Play from '../../public/play.svg'

import { oldTestamentList, newTestamentList } from 'utils/config'

function BookListNew({ user, project, access }) {
  const testaments = [
    { title: 'OldTestament', books: oldTestamentList },
    { title: 'NewTestament', books: newTestamentList },
  ]
  return (
    <div className="card flex">
      {testaments.map((testament) => (
        <div key={testament.title} className="w-1/2">
          <Testament
            bookList={testament.books}
            title={testament.title}
            user={user}
            project={project}
            access={access}
          />
        </div>
      ))}
    </div>
  )
}

export default BookListNew

function Testament({
  bookList,
  title,
  user,
  project,
  access: { isCoordinatorAccess, isModeratorAccess },
  checktype = '',
}) {
  const { t } = useTranslation(['books'])
  const [books, { mutate: mutateBooks }] = useGetBooks({
    token: user?.access_token,
    code: project?.code,
  })

  const createdBooks = useMemo(() => books?.map((el) => el.code), [books])

  const checks = ['first-check', 'second-check', 'third-check'].filter((el) => {
    switch (checktype) {
      case 'first-check':
        return ['first-check'].includes(el)
      case 'second-check':
        return ['first-check', 'second-check'].includes(el)
      case 'third-check':
        return ['first-check', 'second-check', 'third-check'].includes(el)
      default:
        break
    }
  })
  return (
    <div className="flex flex-col gap-7 max-h-[100vh] px-3">
      <h3 className="h3 font-bold">{title}</h3>
      <div className="flex flex-col gap-4 overflow-y-scroll px-4">
        {bookList.map((el) => (
          <div key={el} className="flex justify-between items-center gap-2">
            <div className="flex items-center h5 gap-5">
              <div className={`text-gray-400 ${checks.join(' ')}`}>
                <Checking />
              </div>
              <div
                className={createdBooks?.includes(el) ? 'text-teal-500' : 'text-gray-400'}
              >
                {t(`books:${el}`)}
              </div>
            </div>
            <div className="flex gap-2 text-darkBlue">
              {isCoordinatorAccess && (
                <>
                  <Gear className="w-6" /> <Pencil className="w-6" />
                  <Play className="w-6" />
                </>
              )}
              {isModeratorAccess && <Download className="w-6" />}
              <Book className="w-6" />
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
