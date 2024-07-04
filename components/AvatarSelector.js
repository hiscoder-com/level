import { useEffect, useState, useRef } from 'react'
import { useTranslation } from 'next-i18next'

import axios from 'axios'
import toast from 'react-hot-toast'
import { useRecoilState, useRecoilValue } from 'recoil'

import ImageEditor from './ImageEditor'

import { userAvatarState, modalsSidebar } from './state/atoms'
import { useUser } from 'utils/hooks'

import Trash from 'public/trash.svg'

function AvatarSelector({ id }) {
  const { t } = useTranslation('common')
  const fileInputRef = useRef(null)
  const modalsSidebarState = useRecoilValue(modalsSidebar)
  const [userAvatar, setUserAvatar] = useRecoilState(userAvatarState)
  const [avatars, setAvatars] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [selectedFile, setSelectedFile] = useState(null)
  const [isDragOver, setIsDragOver] = useState(false)
  const [user, { mutate }] = useUser(id)

  const updateAvatar = async (userId, avatarUrl, newAvatar = null) => {
    const pngPattern = new RegExp(`user_${userId}.*\.png$`)
    const svgPattern = new RegExp(`avatar_(0[1-9]|1[0-9]|2[0-2])\.png$`)

    if (!avatarUrl || (!pngPattern.test(avatarUrl) && !svgPattern.test(avatarUrl))) {
      toast.error(t('SaveFailed'))
      return
    }

    try {
      await axios.post('/api/users/avatars', {
        id: userId,
        avatar_url: avatarUrl,
      })
      mutate()
      toast.success(t('SaveSuccess'))
      setUserAvatar({ id, url: avatarUrl })

      setAvatars((prevAvatars) => {
        const updatedAvatars = prevAvatars.map((avatar) => ({
          ...avatar,
          selected: avatar.url === avatarUrl,
        }))

        if (newAvatar) {
          setAvatars((prevAvatars) => {
            const filteredAvatars = prevAvatars.filter(
              (avatar) => !avatar.name.includes(`_${userId}_`)
            )
            return [newAvatar, ...filteredAvatars]
          })
        }

        return updatedAvatars
      })
    } catch (error) {
      toast.error(t('SaveFailed'))
      console.error('Error updating user avatar:', error)
    }
  }

  useEffect(() => {
    const fetchAvatarData = async () => {
      if (!id || !user) {
        return
      }

      try {
        setIsLoading(true)
        const response = await axios.get(`/api/users/avatars?id=${id}`)

        if (response.status !== 200) {
          throw new Error('Failed to fetch avatars')
        }

        const avatarsData = response.data.data.map((avatar) => ({
          ...avatar,
          selected: user?.avatar_url === avatar.url,
        }))

        setAvatars(avatarsData)
      } catch (error) {
        console.error('Error fetching avatars:', error)
      } finally {
        setIsLoading(false)
      }
    }

    !avatars.length && fetchAvatarData()
  }, [avatars.length, id, user])

  const MAX_FILE_SIZE = 5 * 1024 * 1024
  const ALLOWED_FILE_TYPES = ['image/jpeg', 'image/png', 'image/svg+xml']

  const isValidFile = (file) => {
    if (file.size > MAX_FILE_SIZE) {
      toast.error(t('FileTooLarge'))
      return false
    }

    if (!ALLOWED_FILE_TYPES.includes(file.type)) {
      toast.error(t('UnsupportedFileType'))
      return false
    }

    return true
  }

  const handleFileChange = async (e) => {
    const file = e.target.files[0]
    if (file && isValidFile(file)) {
      setSelectedFile(file)
    }
  }

  const handleFileUpload = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click()
    }
  }

  const handleDragEnterOver = (e) => {
    e.preventDefault()
    setIsDragOver(true)
  }

  const handleDrop = (e) => {
    handleDragLeave(e)

    const files = e.dataTransfer.files
    if (files.length > 0) {
      const file = files[0]

      if (isValidFile(file)) {
        setSelectedFile(file)
      }
    }
  }

  const handleDragLeave = (e) => {
    e.preventDefault()
    setIsDragOver(false)
  }

  const resetAvatar = async (userId) => {
    try {
      const response = await axios.post('/api/users/avatars', {
        id: userId,
        avatar_url: null,
      })

      if (response.status === 200) {
        mutate()
        toast.success(t('AvatarResetSuccess'))
        setUserAvatar({ id: userId, url: null })

        setAvatars((avatars) =>
          user.avatar_url.includes(`_${userId}_`)
            ? avatars.filter((avatar) => avatar.url !== user.avatar_url)
            : avatars.map((avatar) => ({ ...avatar, selected: false }))
        )
      } else {
        toast.error(t('AvatarResetFailed'))
      }
    } catch (error) {
      toast.error(t('AvatarResetFailed'))
      console.error('Error resetting user avatar:', error)
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

      {modalsSidebarState.avatarSelector &&
        (isDragOver ? (
          <div
            className="absolute flex justify-center items-center right-0 top-0 w-full h-full md:h-4/6 shadow-md bg-th-secondary-10 border-th-secondary-300 sm:border sm:rounded-2xl md:max-h-full md:left-full md:ml-5 md:bg-black md:bg-opacity-50"
            onClick={() => setIsDragOver(false)}
            onDragEnter={handleDragEnterOver}
            onDragLeave={handleDragLeave}
            onDragOver={handleDragEnterOver}
            onDrop={handleDrop}
          >
            <p className="md:text-white text-center mb-40">{t('DropZoneText')}</p>
          </div>
        ) : (
          <div
            className="absolute flex flex-col right-0 top-0 w-full h-full md:h-min px-3 sm:px-7 pb-3 sm:pb-5 overflow-auto sm:overflow-visible cursor-default shadow-md bg-th-secondary-10 border-th-secondary-300 sm:border sm:rounded-2xl md:max-h-full md:left-full md:ml-5"
            onClick={(e) => e.stopPropagation()}
            onDragEnter={handleDragEnterOver}
            onDragLeave={handleDragLeave}
            onDragOver={handleDragEnterOver}
          >
            <div className="sticky top-0 flex justify-center py-6 border-b border-th-secondary-300 bg-th-secondary-10">
              <button
                onClick={selectedFile ? () => setSelectedFile(null) : handleFileUpload}
                className="btn-primary w-full"
              >
                {selectedFile ? t('CancelAvatarUpload') : t('UploadAvatar')}
              </button>
            </div>
            {isLoading ? (
              <div role="status" className="w-full animate-pulse py-6">
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
              <>
                <div className="flex flex-wrap items-center justify-start gap-4 overflow-y-auto py-6 z-10 bg-white">
                  {avatars?.map((avatar, index) => (
                    <div
                      key={index}
                      className={`relative border-4 rounded-full overflow-hidden shadow-lg cursor-pointer group ${
                        avatar.selected ? 'border-th-secondary-400' : 'border-transparent'
                      }`}
                      onClick={() => {
                        if (avatar.url !== userAvatar.url) {
                          updateAvatar(id, avatar.url)
                        }
                      }}
                    >
                      <img
                        src={avatar.url}
                        alt={avatar.name}
                        className="w-16 h-16 md:w-12 md:h-12 object-cover"
                        draggable="false"
                      />
                      {avatar.selected && (
                        <div
                          className="absolute bottom-0 left-0 w-full h-1/3 bg-black opacity-70 md:opacity-0 group-hover:opacity-70 transition-opacity duration-500 flex justify-center items-center"
                          onClick={(e) => {
                            e.stopPropagation()
                            resetAvatar(id)
                          }}
                        >
                          <Trash className="w-3 text-white" />
                        </div>
                      )}
                    </div>
                  ))}
                </div>
                <p className="hidden md:block text-center text-gray-300">
                  {t('DropZoneHint')}
                </p>
              </>
            )}
          </div>
        ))}
    </>
  )
}

export default AvatarSelector
