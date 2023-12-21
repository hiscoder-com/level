import { useEffect, useState } from 'react'
import { useTranslation } from 'next-i18next'

import axios from 'axios'

import { useRecoilState } from 'recoil'

import { avatarSelectorModalIsOpen, userAvatarState } from './state/atoms'

import Close from 'public/close.svg'

function AvatarSelector({ id, userAvatarUrl }) {
  const { t } = useTranslation('common')
  const [modalIsOpen, setModalIsOpen] = useRecoilState(avatarSelectorModalIsOpen)
  const [userAvatar, setUserAvatar] = useRecoilState(userAvatarState)
  const [avatarUrlArr, setAvatarUrlArr] = useState([])

  const handleAvatarClick = async (userId, avatarUrl) => {
    try {
      await axios.post('/api/user_avatars', {
        id: userId,
        avatar_url: avatarUrl,
      })
      console.log('User avatar updated successfully!')
      setUserAvatar({ id, url: avatarUrl })

      setAvatarUrlArr((prevAvatars) =>
        prevAvatars.map((avatar) =>
          avatar.url === avatarUrl
            ? { ...avatar, selected: true }
            : { ...avatar, selected: false }
        )
      )
    } catch (error) {
      console.error('Error updating user avatar:', error)
    }
  }

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get('/api/user_avatars')
        const currentAvatarUrl = userAvatar.url || userAvatarUrl

        if (response.status !== 200) {
          throw new Error('Failed to fetch avatars')
        }

        const avatarsData = response.data.data.map((avatar) => ({
          ...avatar,
          selected: currentAvatarUrl === avatar.url,
        }))

        setAvatarUrlArr(avatarsData)
      } catch (error) {
        console.error('Error fetching avatars:', error)
      }
    }

    fetchData()
  }, [userAvatarUrl, userAvatar.url])

  return (
    <>
      {modalIsOpen && (
        <div
          className="absolute flex flex-col right-0 top-0 w-full h-full md:h-min px-3 sm:px-7 pb-3 sm:pb-7 overflow-auto sm:overflow-visible cursor-default shadow-md bg-th-secondary-10 border-th-secondary-300 sm:border sm:rounded-2xl md:max-h-full md:left-full md:ml-5"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="sticky top-0 flex items-center justify-between py-6 bg-th-secondary-10">
            <p className="text-left text-2xl font-bold">{t('AvatarSelection')}</p>
            <button className="text-right" onClick={() => setModalIsOpen(false)}>
              <Close className="h-8 stroke-th-primary-100" />
            </button>
          </div>
          <div className="flex flex-wrap gap-2 items-center mt-2">
            {avatarUrlArr?.map((avatar, index) => (
              <div
                key={index}
                className={`border-4 rounded-full overflow-hidden ${
                  avatar.selected ? 'border-th-primary' : 'border-transparent'
                }`}
                onClick={() => handleAvatarClick(id, avatar.url)}
              >
                <img
                  src={avatar.url}
                  alt={avatar.name}
                  className="rounded-full w-full h-full object-cover"
                />
              </div>
            ))}
          </div>
        </div>
      )}
    </>
  )
}

export default AvatarSelector
