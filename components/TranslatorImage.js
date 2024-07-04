import { useEffect, useState } from 'react'

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

function TranslatorImage({ item, size, showModerator = false, isPointerCursor = false }) {
  const [userAvatarUrl, setUserAvatarUrl] = useState(item?.users?.avatar_url || null)
  const userAvatar = useRecoilValue(userAvatarState)

  useEffect(() => {
    userAvatar?.id === item.users?.id
      ? setUserAvatarUrl(userAvatar?.url || null)
      : setUserAvatarUrl(item?.users?.avatar_url || null)
  }, [item.users?.id, item.users?.avatar_url, userAvatar])

  const cursorStyle = isPointerCursor ? 'cursor-pointer' : ''

  return (
    <div
      title={`${item?.users ? `${item.users?.login}` : ''}`}
      className={`relative ${cursorStyle} ${
        showModerator && item.is_moderator ? 'border-th-secondary-400 border-2' : ''
      } rounded-full select-none`}
    >
      {userAvatarUrl ? (
        <img
          src={userAvatarUrl}
          alt={`${item?.users?.login} avatar`}
          className="rounded-full"
          width={size}
          height={size}
        />
      ) : (
        <svg
          viewBox="0 0 168 168"
          width={size}
          xmlns="http://www.w3.org/2000/svg"
          className="rounded-full"
        >
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
