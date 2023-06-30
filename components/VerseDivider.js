import { useEffect, useState } from 'react'

import { useRouter } from 'next/router'

import { useTranslation } from 'next-i18next'

import toast, { Toaster } from 'react-hot-toast'

import useSupabaseClient from 'utils/supabaseClient'

import { useProject, useTranslators } from 'utils/hooks'
import { useCurrentUser } from 'lib/UserContext'

const defaultColor = [
  'bg-yellow-400',
  'bg-red-400',
  'bg-blue-400',
  'bg-pink-400',
  'bg-violet-400',
  'bg-orange-400',
  'bg-cyan-400',
  'bg-red-400',
  'bg-fuchsia-400',
  'bg-teal-400',
]

function VerseDivider({ verses }) {
  const supabase = useSupabaseClient()
  const [currentTranslator, setCurrentTranslator] = useState(null)
  const [colorTranslators, setColorTranslators] = useState([])
  const [versesDivided, setVersesDivided] = useState([])
  const [isHighlight, setIsHighlight] = useState(false)

  const { t } = useTranslation('common')

  const { user } = useCurrentUser()
  const {
    query: { code },
  } = useRouter()

  const [translators] = useTranslators({
    token: user?.access_token,
    code,
  })

  const [project] = useProject({
    token: user?.access_token,
    code,
  })

  useEffect(() => {
    const colorTranslators = translators?.map((translator, index) => ({
      ...translator,
      color: defaultColor[index],
    }))
    setColorTranslators(colorTranslators)
  }, [translators])

  useEffect(() => {
    if (colorTranslators?.length > 0) {
      const extVerses = verses?.map((verse) => {
        const translator = colorTranslators.find(
          (element) => element.id === verse.project_translator_id
        )

        return {
          ...verse,
          color: translator ? translator.color : 'bg-slate-300',
          translator_name: translator ? translator.users.login : '',
        }
      })
      setVersesDivided(extVerses)
    }
  }, [verses, colorTranslators])

  const coloring = (index) => {
    const newArr = [...versesDivided]
    newArr[index] = {
      ...newArr[index],
      translator_name: currentTranslator?.users?.login,
      project_translator_id: currentTranslator?.id,
      color: currentTranslator?.color,
    }
    setVersesDivided(newArr)
  }

  const verseDividing = async () => {
    //TODO сделать сравнение стейта до изменения и после - и если после изменения не нажали сохранить - проинформировать пользователя
    let { data, error } = await supabase.rpc('divide_verses', {
      divider: versesDivided,
      project_id: project?.id,
    })

    if (error) {
      console.error(error)
      toast.error(t('SaveFailed'))
    } else {
      console.log('Success', data)
      toast.success(t('SaveSuccess'))
    }
  }

  return (
    <div className="md:flex mx-4">
      <div
        onMouseDown={() => setIsHighlight(true)}
        onMouseUp={() => setIsHighlight(false)}
        onMouseLeave={() => setIsHighlight(false)}
        className="select-none lg:grid-cols-6 grid-cols-4 grid"
      >
        {versesDivided
          ?.sort((a, b) => a.num > b.num)
          .map((verse, index) => {
            return (
              <div
                onMouseDown={() => {
                  if (currentTranslator !== null) {
                    coloring(index)
                  }
                }}
                onMouseOver={() => {
                  if (isHighlight && currentTranslator !== null) {
                    coloring(index)
                  }
                }}
                onClick={() => {
                  if (currentTranslator === null) {
                    return
                  }
                  coloring(index)
                }}
                className={`${
                  verse?.color ?? 'bg-slate-300'
                } w-32 border-slate-200 border-2 cursor-pointer hover:border-1 hover:border-cyan-300 truncate flex justify-between p-1`}
                key={index}
              >
                <div className="mr-1">
                  {verse.num === 0
                    ? t('Title')
                    : verse.num === 200
                    ? t('Reference')
                    : verse.num}
                </div>
                <div>{verse.translator_name}</div>
              </div>
            )
          })}
      </div>
      <div className="grid grid-cols-2 md:block">
        {colorTranslators?.map((translator, index) => (
          <div key={index} className="flex">
            <div
              onClick={() => setCurrentTranslator(translator)}
              className={`${
                currentTranslator?.users?.login === translator.users.login
                  ? 'border-4 border-cyan-300 p-1'
                  : 'p-2'
              } cursor-pointer ml-10 my-2 w-fit rounded-md ${translator.color} btn`}
            >
              {translator.users.login}
            </div>
          </div>
        ))}
        <button
          onClick={() =>
            setCurrentTranslator((prev) => {
              return { ...prev, users: { login: '' }, color: ' bg-slate-300' }
            })
          }
          className={`${
            currentTranslator?.users?.login === ''
              ? 'border-4 border-cyan-300 p-1'
              : 'p-2'
          } bg-slate-300 cursor-pointer ml-10 p-2 my-2 w-fit rounded-md btn`}
        >
          {t('Clearing')}
        </button>
        <button
          onClick={() =>
            setVersesDivided(
              verses?.map((verse) => ({
                ...verse,
                color: 'bg-slate-300',
                translator_name: '',
                project_translator_id: null,
              }))
            )
          }
          className={`bg-slate-400 cursor-pointer ml-10 p-2 my-2 w-fit rounded-md btn`}
        >
          {t('Reset')}
        </button>
        <button
          onClick={verseDividing}
          className={`bg-green-400 cursor-pointer ml-10 p-2 my-2 w-fit rounded-md btn`}
        >
          {t('Save')}
        </button>
      </div>
      <Toaster />
    </div>
  )
}

export default VerseDivider
