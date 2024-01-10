import { useEffect, useState, useRef } from 'react'
import { useTranslation } from 'next-i18next'
import axios from 'axios'
import toast from 'react-hot-toast'
import { useRecoilState } from 'recoil'
import { avatarSelectorModalIsOpen, userAvatarState } from './state/atoms'

function AvatarSelector({ id, userAvatarUrl }) {
  const { t } = useTranslation('common')
  const [modalIsOpen, setModalIsOpen] = useRecoilState(avatarSelectorModalIsOpen)
  const [userAvatar, setUserAvatar] = useRecoilState(userAvatarState)
  const [avatarUrlArr, setAvatarUrlArr] = useState([])
  const [isLoading, setIsLoading] = useState(true)

  const updateAvatar = async (userId, avatarUrl) => {
    try {
      await axios.post('/api/user_avatars', {
        id: userId,
        avatar_url: avatarUrl,
      })
      toast.success(t('SaveSuccess'))
      setUserAvatar({ id, url: avatarUrl })

      setAvatarUrlArr((prevAvatars) =>
        prevAvatars.map((avatar) =>
          avatar.url === avatarUrl
            ? { ...avatar, selected: true }
            : { ...avatar, selected: false }
        )
      )
    } catch (error) {
      toast.error(t('SaveFailed'))
      console.error('Error updating user avatar:', error)
    }
  }

  useEffect(() => {
    const fetchAvatarData = async () => {
      try {
        setIsLoading(true)
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
      } finally {
        setIsLoading(false)
      }
    }

    fetchAvatarData()
  }, [userAvatarUrl, userAvatar.url])

  const fileInputRef = useRef(null)

  const handleFileChange = async (e) => {
    const file = e.target.files[0]
    if (file) {
      const formData = new FormData()
      formData.append('file', file)

      try {
        const response = await axios.post('/api/user_avatar_upload', formData)
        if (response.status === 200) {
          const { url } = response.data
          updateAvatar(id, url)
        } else {
          toast.error(t('UploadFailed'))
        }
      } catch (error) {
        console.error('Error uploading avatar:', error)
        toast.error(t('UploadFailed'))
      }
    }
  }

  const handleFileUpload = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click()
    }
  }

  return (
    <>
      <input
        type="file"
        accept="image/*"
        onChange={handleFileChange}
        ref={fileInputRef}
        style={{ display: 'none' }}
      />
      {modalIsOpen && (
        <div
          className="absolute flex flex-col right-0 top-0 w-full h-full md:h-min px-3 sm:px-7 pb-3 sm:pb-7 overflow-auto sm:overflow-visible cursor-default shadow-md bg-th-secondary-10 border-th-secondary-300 sm:border sm:rounded-2xl md:max-h-full md:left-full md:ml-5"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="sticky top-0 flex justify-center py-6 mb-6 border-b border-th-secondary-300 bg-th-secondary-10">
            <button onClick={handleFileUpload} className="btn-primary w-full">
              {t('AddFromComputer')}
            </button>
          </div>
          {isLoading ? (
            <div role="status" className="w-full animate-pulse">
              <div className="flex flex-wrap gap-3 justify-between">
                {[...Array(4)].map((_, index) => (
                  <div
                    key={index}
                    className="w-16 h-16 bg-th-secondary-100 rounded-full"
                  ></div>
                ))}
              </div>
            </div>
          ) : (
            <div className="flex flex-wrap gap-4 justify-between">
              {avatarUrlArr?.map((avatar, index) => (
                <div
                  key={index}
                  className={`border-4 rounded-full overflow-hidden shadow-lg ${
                    avatar.selected ? 'border-th-secondary-400' : 'border-transparent'
                  }`}
                  onClick={() => updateAvatar(id, avatar.url)}
                >
                  <img
                    src={avatar.url}
                    alt={avatar.name}
                    className="w-16 h-16 md:w-12 md:h-12 object-cover"
                  />
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </>
  )
}

export default AvatarSelector
