import { useEffect, useState } from 'react'

import { useRouter } from 'next/router'

import axios from 'axios'
import { useCurrentUser } from 'lib/UserContext'
import { useTranslation } from 'next-i18next'
import { useForm, useWatch } from 'react-hook-form'
import { toast } from 'react-hot-toast'

import BasicInformation from './BasicInformation'
import BriefEditQuestions from './BriefEditQuestions'
import ButtonLoading from './ButtonLoading'
import CommitsList from './CommitsList'
import LanguageCreate from './LanguageCreate'
import SwitchLoading from './Panel/UI/SwitchLoading'
import Steps from './Steps'

import { useLanguages, useMethod } from 'utils/hooks'

function ProjectCreate() {
  const { t } = useTranslation(['projects', 'project-edit', 'common'])
  const { user } = useCurrentUser()
  const [_methods] = useMethod()
  const router = useRouter()
  const [methods, setMethods] = useState(_methods)
  const [method, setMethod] = useState({})
  const [isCreating, setIsCreating] = useState(false)
  const [isOpenLanguageCreate, setIsOpenLanguageCreate] = useState(false)
  const [isBriefEnable, setIsBriefEnable] = useState(true)
  const [resourcesUrl, setResourcesUrl] = useState({})
  const [customSteps, setCustomSteps] = useState([])
  const [customBriefQuestions, setCustomBriefQuestions] = useState([])
  const [languages, { mutate: mutateLanguage }] = useLanguages()
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
    if (languages) {
      setValue('languageId', languages?.[0]?.id)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [languages?.[0]?.id])

  useEffect(() => {
    if (!methods && _methods) {
      setMethods(_methods)
    }
  }, [_methods, methods])

  useEffect(() => {
    setResourcesUrl({})
  }, [methodId])

  const onSubmit = async (data) => {
    const { title, code, languageId, origtitle } = data
    if (!title || !code || !languageId) {
      return
    }
    const language = languages.find((el) => el.id.toString() === languageId.toString())

    setIsCreating(true)
    axios
      .post('/api/projects', {
        is_brief_enable: isBriefEnable,
        custom_brief_questions: customBriefQuestions,
        title,
        orig_title: origtitle,
        language: { id: languageId, is_rtl: language.is_rtl },
        code,
        method_id: method.id,
        steps: method.steps,
        resources: resourcesUrl,
      })
      .then((result) => {
        setMethods(_methods)
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
  const updateMethods = (methods, key, array) => {
    const _methods = methods.map((el) => {
      if (el.id === method.id) {
        return { ...el, [key]: array }
      }
      return el
    })
    setMethods(_methods)
  }
  const updateBlock = ({ value, index, fieldName, block, setBlock, blockName }) => {
    block[index][fieldName] = value
    setBlock(block)
    updateMethods(methods, blockName, block)
  }
  const updateSteps = ({ value, index, fieldName }) => {
    if (value && index != null && fieldName) {
      updateBlock({
        value,
        index,
        fieldName,
        block: customSteps,
        setBlock: setCustomSteps,
        blockName: 'steps',
      })
    }
  }
  const saveBrief = (array) => {
    updateMethods(methods, 'brief', array)
  }

  return (
    <>
      <div className="pb-8 pt-0 sm:py-5" onClick={(e) => e.stopPropagation()}>
        <form className="flex flex-col gap-0 md:gap-7" onSubmit={handleSubmit(onSubmit)}>
          <div className="card-md space-y-7 bg-transparent py-7 sm:bg-th-secondary-100">
            <h3 className="text-xl font-bold">{t('project-edit:BasicInformation')}</h3>
            <BasicInformation
              t={t}
              errors={errors}
              register={register}
              setValue={setValue}
              user={user}
              methods={methods}
              setIsOpenLanguageCreate={setIsOpenLanguageCreate}
              uniqueCheck
              isCreate
            />
          </div>
          <div className="card-md flex flex-col gap-7 bg-transparent py-7 sm:bg-th-secondary-100">
            <h3 className="text-xl font-bold">{t('project-edit:Steps')}</h3>
            <div className="flex flex-col gap-7 text-sm md:text-base">
              <Steps customSteps={customSteps} updateSteps={updateSteps} />
            </div>
          </div>
          <div className="card-md flex flex-col gap-7 bg-transparent py-7 sm:bg-th-secondary-100">
            <div className="flex justify-between">
              <h3 className="text-xl font-bold">{t('Brief')}</h3>
              <div className="flex items-center gap-2">
                <span className="mr-3 text-sm md:text-base">
                  {t(`project-edit:${isBriefEnable ? 'DisableBrief' : 'EnableBrief'}`)}
                </span>
                <SwitchLoading
                  id="brief-enable-switch"
                  checked={isBriefEnable}
                  withDelay={true}
                  onChange={(value) => setIsBriefEnable(value)}
                  backgroundColor="bg-th-secondary-200"
                />
              </div>
            </div>
            <BriefEditQuestions
              customBriefQuestions={customBriefQuestions}
              setCustomBriefQuestions={setCustomBriefQuestions}
              saveFunction={saveBrief}
              autoSave
            />
          </div>
          <div className="card-md flex flex-col gap-7 border-b border-th-secondary-300 bg-transparent pb-7 sm:bg-th-secondary-100">
            <h3 className="text-xl font-bold">{t('common:ListResources')}</h3>
            <CommitsList
              methodId={methodId}
              resourcesUrl={resourcesUrl}
              setResourcesUrl={setResourcesUrl}
            />
            <div className="flex items-center justify-center">
              <ButtonLoading
                className="btn-primary relative w-full"
                disabled={isCreating}
                value={t('CreateProject')}
                isLoading={isCreating}
              >
                {t('CreateProject')}
              </ButtonLoading>
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
