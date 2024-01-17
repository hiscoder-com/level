import { useEffect, useState, useRef } from 'react'
import { useTranslation } from 'next-i18next'
import axios from 'axios'
import toast from 'react-hot-toast'
import { useRecoilState } from 'recoil'
import { avatarSelectorModalIsOpen, userAvatarState } from './state/atoms'
import ImageEditor from './ImageEditor'

function AvatarSelector({ id, userAvatarUrl }) {
  const { t } = useTranslation('common')
  const [modalIsOpen, setModalIsOpen] = useRecoilState(avatarSelectorModalIsOpen)
  const [userAvatar, setUserAvatar] = useRecoilState(userAvatarState)
  const [avatarsArr, setAvatarsArr] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [selectedFile, setSelectedFile] = useState(null)

  const updateAvatar = async (userId, avatarUrl) => {
    try {
      await axios.post('/api/user_avatars', {
        id: userId,
        avatar_url: avatarUrl,
      })
      toast.success(t('SaveSuccess'))
      setUserAvatar({ id, url: avatarUrl })

      setAvatarsArr((prevAvatars) =>
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
        const response = await axios.get(`/api/user_avatars?id=${id}`)
        let currentAvatarUrl

        if (userAvatar.id === id) {
          currentAvatarUrl = userAvatar.url || userAvatarUrl
        } else {
          currentAvatarUrl = userAvatarUrl
        }

        if (response.status !== 200) {
          throw new Error('Failed to fetch avatars')
        }
        const avatarsData = response.data.data.map((avatar) => ({
          ...avatar,
          selected: currentAvatarUrl === avatar.url,
        }))

        setAvatarsArr(avatarsData)
      } catch (error) {
        console.error('Error fetching avatars:', error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchAvatarData()
  }, [userAvatarUrl, userAvatar.url, id, userAvatar.id])

  const fileInputRef = useRef(null)

  const handleFileChange = async (e) => {
    const file = e.target.files[0]

    if (file) {
      setSelectedFile(file)
    }
  }

  const handleFileUpload = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click()
    }
  }

  const handleDragOver = (e) => {
    e.preventDefault()
  }

  const handleDrop = (e) => {
    e.preventDefault()
    const files = e.dataTransfer.files
    if (files.length > 0) {
      const file = files[0]
      setSelectedFile(file)
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
          onDragOver={handleDragOver}
          onDrop={handleDrop}
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
          ) : selectedFile ? (
            <ImageEditor
              selectedFile={selectedFile}
              updateAvatar={updateAvatar}
              setSelectedFile={setSelectedFile}
              id={id}
              t={t}
            />
          ) : (
            <div className="flex flex-wrap gap-4 justify-between">
              {avatarsArr?.map((avatar, index) => (
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
