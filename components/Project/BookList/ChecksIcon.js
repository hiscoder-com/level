import { useMemo } from 'react'
import { useGetChapters, useGetCreatedChapters } from 'utils/hooks'
import Checking from '/public/checking.svg'

function ChecksIcon({ book, user, project }) {
  const [chapters] = useGetChapters({
    token: user?.access_token,
    code: project?.code,
    book_code: book,
  })
  const [createdChapters] = useGetCreatedChapters({
    token: user?.access_token,
    code: project?.code,
    chapters: chapters?.map((el) => el.id),
  })
  const checktype = useMemo(
    () =>
      createdChapters?.length &&
      chapters?.filter((el) => el.finished_at)?.length === chapters?.length
        ? 'first-check'
        : '',
    [chapters, createdChapters?.length]
  )
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
    <div className={`text-gray-400 ${checks.join(' ')}`}>
      <Checking />
    </div>
  )
}

export default ChecksIcon
