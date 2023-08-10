import { useEffect, useState } from 'react'

import { useRouter } from 'next/router'

import { useTranslation } from 'next-i18next'

import { useForm, useWatch } from 'react-hook-form'

import { toast } from 'react-hot-toast'

import axios from 'axios'

import { Switch } from '@headlessui/react'

import CommitsList from './CommitsList'
import Steps from './Steps'
import BasicInformation from './BasicInformation'
import LanguageCreate from './LanguageCreate'
import BriefEditQuestions from 'components/BriefEditQuestions'

import { useLanguages, useMethod } from 'utils/hooks'
import { checkLSVal } from 'utils/helper'
import { useCurrentUser } from 'lib/UserContext'
import Spinner from '../public/spinner.svg'

function ProjectCreate() {
  const { t } = useTranslation(['projects', 'project-edit', 'common'])
  const { user } = useCurrentUser()

  const [_methods] = useMethod(user?.access_token)
  const router = useRouter()
  const [methods, setMethods] = useState(() => {
    return checkLSVal('methods', _methods, 'object')
  })
  const [method, setMethod] = useState({})
  const [isCreating, setIsCreating] = useState(false)
  const [isOpenLanguageCreate, setIsOpenLanguageCreate] = useState(false)
  const [isBriefEnable, setIsBriefEnable] = useState(true)
  const [resourcesUrl, setResourcesUrl] = useState({})
  const [customSteps, setCustomSteps] = useState([])
  const [customBriefQuestions, setCustomBriefQuestions] = useState([])
  const [languages, { mutate: mutateLanguage }] = useLanguages(user?.access_token)
  const {
    register,
    handleSubmit,
    control,
    setValue,
    formState: { errors },
  } = useForm({ mode: 'onChange' })
  const methodId = useWatch({ control, name: 'methodId' })

  useEffect(() => {
    if (methods && methodId) {
      const selectedMethod = methods.find(
        (el) => el.id.toString() === methodId.toString()
      )
      if (selectedMethod) {
        setMethod(selectedMethod)
        setCustomSteps(selectedMethod.steps)
        setCustomBriefQuestions(selectedMethod.brief)
      }
    }
  }, [methodId, methods])

  useEffect(() => {
    if (methods) {
      setValue('methodId', methods?.[0]?.id)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [methods?.[0]?.id])

  useEffect(() => {
    if (!methods && _methods) {
      setMethods(_methods)
    }
  }, [_methods, methods])

  useEffect(() => {
    if (methods) {
      localStorage.setItem('methods', JSON.stringify(methods))
    }
  }, [methods])

  useEffect(() => {
    setResourcesUrl({})
  }, [methodId])

  const saveMethods = (methods) => {
    localStorage.setItem('methods', JSON.stringify(methods))
    setMethods(methods)
  }

  const onSubmit = async (data) => {
    saveMethods(_methods)

    const { title, code, languageId, origtitle } = data
    if (!title || !code || !languageId) {
      return
    }
    setIsCreating(true)
    axios.defaults.headers.common['token'] = user?.access_token
    axios
      .post('/api/projects', {
        isBriefEnable,
        customBriefQuestions,
        title,
        origtitle,
        language_id: languageId,
        code,
        method_id: method.id,
        steps: method.steps,
        resources: resourcesUrl,
      })
      .then((result) => {
        saveMethods(_methods)
        const {
          status,
          headers: { location },
        } = result
        if (status === 201) {
          router.push(location)
        }
      })
      .catch((err) => {
        toast.error(t('SaveFailed'))
      })
      .finally(() => setIsCreating(false))
  }
  //TODO проверить где ещё используется
  const updateArray = ({ array, index, fieldName, value }) => {
    const _array = array.map((obj, idx) => {
      if (index === idx) {
        return { ...obj, [fieldName]: value }
      }
      return obj
    })
    return _array
  }

  const updateMethods = (methods, key, array) => {
    const _methods = methods.map((el) => {
      if (el.id === method.id) {
        return { ...el, [key]: array }
      }
      return el
    })
    saveMethods(_methods)
  }

  const updateBlock = ({ value, index, fieldName, array, setArray, blockName }) => {
    const _array = updateArray({
      array,
      index,
      fieldName,
      value,
    })

    setArray(_array)
    updateMethods(methods, blockName, _array)
  }
  const updateSteps = ({ value, index, fieldName }) => {
    if (value && index != null && fieldName) {
      updateBlock({
        value,
        index,
        fieldName,
        array: customSteps,
        setArray: setCustomSteps,
        blockName: 'steps',
      })
    }
  }

  const saveBrief = (array) => {
    updateMethods(methods, 'brief', array)
  }

  return (
    <>
      <div className="py-0 sm:py-10" onClick={(e) => e.stopPropagation()}>
        <form className="flex flex-col gap-0 md:gap-4" onSubmit={handleSubmit(onSubmit)}>
          <div className="md:card py-7 space-y-7">
            <p className="text-xl font-bold">{t('project-edit:BasicInformation')}</p>
            <BasicInformation
              t={t}
              errors={errors}
              register={register}
              setValue={setValue}
              user={user}
              methods={methods}
              setIsOpenLanguageCreate={setIsOpenLanguageCreate}
              uniqueCheck
            />
          </div>
          <div className="md:card flex flex-col gap-7 py-7">
            <p className="text-xl font-bold">{t('project-edit:Steps')}</p>
            <div className="flex flex-col gap-7 text-sm md:text-base">
              <Steps customSteps={customSteps} updateSteps={updateSteps} />
            </div>
          </div>
          <div className="md:card flex flex-col gap-7 py-7">
            <div className="flex justify-between">
              <p className="text-xl font-bold">{t('Brief')}</p>
              <div className="flex items-center gap-2">
                <span className="mr-3 text-sm md:text-base">
                  {t(`project-edit:${isBriefEnable ? 'DisableBrief' : 'EnableBrief'}`)}
                </span>
                <Switch
                  checked={isBriefEnable}
                  onChange={() => setIsBriefEnable((prev) => !prev)}
                  className={`${
                    isBriefEnable ? 'bg-cyan-600' : 'bg-gray-300'
                  } relative inline-flex h-6 w-11 items-center rounded-full`}
                >
                  <span
                    className={`${
                      isBriefEnable ? 'translate-x-6' : 'translate-x-1'
                    } inline-block h-4 w-4 transform rounded-full bg-white transition`}
                  />
                </Switch>
              </div>
            </div>
            <BriefEditQuestions
              customBriefQuestions={customBriefQuestions}
              setCustomBriefQuestions={setCustomBriefQuestions}
              saveFunction={saveBrief}
              autoSave
            />
          </div>
          <div className="md:card flex flex-col gap-7 pb-7 mb-7 border-b border-slate-900">
            <p className="text-xl font-bold">{t('common:ListResources')}</p>
            <CommitsList
              methodId={methodId}
              resourcesUrl={resourcesUrl}
              setResourcesUrl={setResourcesUrl}
            />
            <div className="flex w-fit items-center justify-center">
              <input
                className={`btn-secondary btn-filled ${
                  isCreating ? '!text-gray-200 hover:!text-white' : ''
                }`}
                type="submit"
                value={t('CreateProject')}
                disabled={isCreating}
              />
              {isCreating && (
                <Spinner className="absolute animate-spin h-5 w-5 text-cyan-600 overflow-hidden" />
              )}
            </div>
          </div>
        </form>
      </div>
      <LanguageCreate
        user={user}
        isOpen={isOpenLanguageCreate}
        closeHandle={() => setIsOpenLanguageCreate(false)}
        mutateLanguage={mutateLanguage}
        languages={languages}
      />
    </>
  )
}

export default ProjectCreate
