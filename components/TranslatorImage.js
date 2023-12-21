import { useEffect, useMemo, useState } from 'react'

import { useRouter } from 'next/router'

import { useRecoilValue } from 'recoil'
import { userAvatarState } from './state/atoms'

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
  const [userAvatarUrl, setUserAvatarUrl] = useState(item.users.avatar_url || '')
  const userAvatar = useRecoilValue(userAvatarState)

  const {
    push,
    query: { project, book, chapter, step, translator },
  } = useRouter()

  const canClick = useMemo(
    () => clickable && (!translator || translator !== item.users?.login),
    [clickable, item.users?.login, translator]
  )

  useEffect(() => {
    userAvatar.url !== null &&
      userAvatar.id === item.users.id &&
      setUserAvatarUrl(userAvatar.url)
  }, [item.users.id, userAvatar])

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
      {userAvatarUrl ? (
        <img
          src={userAvatarUrl}
          alt={`${item?.users?.login} avatar`}
          className="rounded-full shadow-lg"
          width={size}
          height={size}
        />
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
