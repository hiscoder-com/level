import { useMemo } from 'react'

import { useRouter } from 'next/router'

const defaultColor = [
  'fill-th-divide-verse1',
  'fill-th-divide-verse2',
  'fill-th-divide-verse3',
  'fill-th-divide-verse4',
  'fill-th-divide-verse5',
  'fill-th-divide-verse6',
  'fill-th-divide-verse7',
  'fill-th-divide-verse8',
  'fill-th-divide-verse9',
]

function TranslatorImage({ item, size, clickable, showModerator = false }) {
  const {
    push,
    query: { project, book, chapter, step, translator },
  } = useRouter()

  const canClick = useMemo(
    () => clickable && (!translator || translator !== item.users?.login),
    [clickable, item.users?.login, translator]
  )

  return (
    <div
      title={`${item?.users ? `${item.users?.login}` : ''}`}
      onClick={() => {
        if (canClick) {
          push(`/translate/${project}/${book}/${chapter}/${step}/${item?.users?.login}`)
        }
      }}
      className={`relative ${canClick ? 'cursor-pointer' : 'cursor-default'} ${
        showModerator && item.is_moderator ? 'border-th-secondary-400 border-2' : ''
      } rounded-full select-none`}
    >
      {item.avatar ? (
        <div
          style={{
            backgroundImage: 'url(' + item?.url + ')',
            width: size,
            height: size,
          }}
          className={`relative rounded-full bg-contain bg-center bg-no-repeat`}
        ></div>
      ) : (
        <svg viewBox="0 0 168 168" width={size} xmlns="http://www.w3.org/2000/svg">
          <circle
            cx="84"
            cy="84"
            r="84"
            className={
              defaultColor[item?.users?.login.length % 6] ?? 'fill-th-divide-verse1'
            }
          />
          <text
            x="84"
            y="110"
            textAnchor="middle"
            className="text-7xl fill-th-text-primary font-bold"
          >
            {item?.users?.login.toUpperCase().slice(0, 2)}
          </text>
        </svg>
      )}
    </div>
  )
}

export default TranslatorImage
