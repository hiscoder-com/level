import { useEffect, useRef, useState } from 'react'

import axios from 'axios'
import { useTranslation } from 'next-i18next'
import toast from 'react-hot-toast'
import { useRecoilState, useRecoilValue } from 'recoil'

import ImageEditor from './ImageEditor'
import { modalsSidebar, userAvatarState } from './state/atoms'

import { useUser } from 'utils/hooks'

import Close from 'public/icons/close.svg'
import Trash from 'public/icons/trash.svg'

function AvatarSelector({ id }) {
  const { t } = useTranslation('common')
  const fileInputRef = useRef(null)
  const [modalsSidebarState, setModalsSidebarState] = useRecoilState(modalsSidebar)
  const [avatars, setAvatars] = useState([])
  const [userAvatar, setUserAvatar] = useRecoilState(userAvatarState)
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
            className="absolute right-0 top-0 flex h-full w-full items-center justify-center border-th-secondary-300 bg-th-secondary-10 shadow-md sm:rounded-2xl sm:border md:left-full md:ml-5 md:h-4/6 md:max-h-full md:bg-black md:bg-opacity-50"
            onClick={() => setIsDragOver(false)}
            onDragEnter={handleDragEnterOver}
            onDragLeave={handleDragLeave}
            onDragOver={handleDragEnterOver}
            onDrop={handleDrop}
          >
            <p className="mb-40 text-center md:text-white">{t('DropZoneText')}</p>
          </div>
        ) : (
          <div
            className="absolute right-0 top-0 z-20 flex h-full min-h-full w-full cursor-default flex-col overflow-auto rounded-none border-th-secondary-300 bg-th-secondary-10 pb-3 shadow-md sm:overflow-visible sm:rounded-2xl sm:border-x sm:border-b sm:pb-5 md:left-full md:ml-5 md:h-min md:max-h-full md:rounded-xl lg:ml-0 lg:w-[30rem] lg:rounded-none"
            onClick={(e) => e.stopPropagation()}
            onDragEnter={handleDragEnterOver}
            onDragLeave={handleDragLeave}
            onDragOver={handleDragEnterOver}
          >
            <div className="sticky top-0 flex h-[3.75rem] items-center justify-center rounded-none bg-th-secondary-400 py-4 sm:rounded-t-xl md:rounded-t-xl lg:rounded-none lg:px-7">
              <button
                className="absolute right-4"
                onClick={() => {
                  setModalsSidebarState({
                    aboutVersion: false,
                    avatarSelector: false,
                    notepad: false,
                    writeToUs: false,
                    about: false,
                  })
                }}
              >
                <Close className="h-8 stroke-th-secondary-10" />
              </button>
            </div>
            <div className="sticky top-0 flex justify-center border-b border-th-secondary-300 bg-th-secondary-10 px-7 py-6">
              <button
                onClick={selectedFile ? () => setSelectedFile(null) : handleFileUpload}
                className="btn-primary w-full"
              >
                {selectedFile ? t('CancelAvatarUpload') : t('UploadAvatar')}
              </button>
            </div>
            {isLoading ? (
              <div role="status" className="w-full animate-pulse px-7 py-6">
                <div className="flex flex-wrap justify-between gap-3">
                  {[...Array(4)].map((_, index) => (
                    <div
                      key={index}
                      className="h-16 w-16 rounded-full bg-th-secondary-100"
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
                <div className="z-10 flex flex-wrap items-center justify-start gap-4 overflow-y-auto bg-white px-7 py-6">
                  {avatars?.map((avatar, index) => (
                    <div
                      key={index}
                      className={`group relative cursor-pointer overflow-hidden rounded-full border-4 shadow-lg ${
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
                        className="h-16 w-16 object-cover md:h-12 md:w-12"
                        draggable="false"
                      />
                      {avatar.selected && (
                        <div
                          className="absolute bottom-0 left-0 flex h-1/3 w-full items-center justify-center bg-black opacity-70 transition-opacity duration-500 group-hover:opacity-70 md:opacity-0"
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
                <p className="hidden text-center text-gray-300 md:block">
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
