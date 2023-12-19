import { useEffect, useState } from 'react'
import { useTranslation } from 'next-i18next'

import { useRecoilState } from 'recoil'

import { avatarSelectorModalIsOpen } from './state/atoms'

import Close from 'public/close.svg'

function AvatarSelector() {
  const { t } = useTranslation('common')
  const [modalIsOpen, setModalIsOpen] = useRecoilState(avatarSelectorModalIsOpen)

  const [avatarUrlArr, setAvatarUrlArr] = useState([])

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch('/api/get_avatars')
        if (!response.ok) {
          throw new Error('Failed to fetch avatars')
        }

        const data = await response.json()
        setAvatarUrlArr(data.data)
      } catch (error) {
        console.error('Error fetching avatars:', error)
      }
    }

    fetchData()
  }, [])

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
          <div className="flex flex-wrap gap-2">
            {avatarUrlArr.map((avatarUrl, index) => (
              <div key={index} className="w-12 h-12">
                <img
                  src={avatarUrl}
                  alt={`Avatar ${index + 1}`}
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
