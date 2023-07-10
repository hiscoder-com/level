import { useEffect, useRef, useState } from 'react'

import { useRouter } from 'next/router'
import { useTranslation } from 'next-i18next'

import { useForm, useWatch } from 'react-hook-form'

import { toast } from 'react-hot-toast'

import axios from 'axios'

import { Disclosure, Switch } from '@headlessui/react'

import CommitsList from '../CommitsList'
import Steps from './Steps'
import BasicInformation from './BasicInformation'
import LanguageCreate from './LanguageCreate'
import UpdateField from './UpdateField'

import { useLanguages, useMethod } from 'utils/hooks'
import { checkLSVal } from 'utils/helper'
import { useCurrentUser } from 'lib/UserContext'

import Down from 'public/arrow-down.svg'

function ProjectCreate() {
  const { t } = useTranslation(['projects', 'project-edit', 'common'])
  const { user } = useCurrentUser()

  const [_methods] = useMethod(user?.access_token)
  const router = useRouter()
  const [methods, setMethods] = useState(() => {
    return checkLSVal('methods', _methods, 'object')
  })
  const [method, setMethod] = useState({})
  const [isOpenLanguageCreate, setIsOpenLanguageCreate] = useState(false)
  const [customResources, setCustomResources] = useState({})
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
        setCustomResources(selectedMethod.resources)
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

  const resetMethods = (methods) => {
    localStorage.setItem('methods', JSON.stringify(methods))
    setMethods(methods)
  }
  useEffect(() => {
    setResourcesUrl({})
  }, [methodId])
  const onSubmit = async (data) => {
    const { title, code, languageId, origtitle } = data
    if (!title || !code || !languageId) {
      return
    }
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
        resetMethods(_methods)
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
    // .finally(mutateProjects)
  }

  const updateCollection = ({ ref, index, array, name, setter }) => {
    const _array = array.map((obj, idx) => {
      if (index === idx) {
        return { ...obj, ...ref }
      }
      return obj
    })
    const _methods = methods.map((el) => {
      if (el.id === method.id) {
        return { ...el, [name]: _array }
      }
      return el
    })
    resetMethods(_methods)
    setter(_array)
  }

  const updateBlockQuestion = ({ blockQuestion, indexBlock, indexQuestion }) => {
    const brief = customBriefQuestions.map((obj, idx) => {
      if (indexBlock === idx) {
        const block = obj.block.map((el, index) => {
          if (index === indexQuestion) {
            return { ...el, question: blockQuestion }
          }
          return el
        })
        return { ...obj, block }
      }
      return obj
    })
    const _methods = methods.map((el) => {
      if (method.id === el.id) {
        return { ...el, brief }
      }
      return el
    })
    resetMethods(_methods)
    setCustomBriefQuestions(brief)
  }

  return (
    <>
      <div className="py-0 sm:py-10" onClick={(e) => e.stopPropagation()}>
        <form className="flex flex-col gap-4" onSubmit={handleSubmit(onSubmit)}>
          <div className="card space-y-7 py-7">
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
          <div className="card flex flex-col gap-7 py-7">
            <p className="text-xl font-bold">{t('project-edit:Steps')}</p>
            <Steps
              customSteps={customSteps}
              updateCollection={updateCollection}
              t={t}
              method={method}
              setCustomSteps={setCustomSteps}
            />
          </div>
          <div className="card flex flex-col gap-7 py-7">
            <div className="flex justify-between">
              <p className="text-xl font-bold">{t('Brief')}</p>
              <div>
                <span className="mr-3">
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
            <BriefQuestions
              customBriefQuestions={customBriefQuestions}
              updateBlockQuestion={updateBlockQuestion}
              updateCollection={updateCollection}
              setCustomBriefQuestions={setCustomBriefQuestions}
            />
          </div>
          {/*
          <p>
            Нужно превратить в форму. Сейчас сюда приходит объект. Ключ - это
            идентификатор ресурса в шагах метода. Тут нет каких-то правил, можно называть
            как хочешь. Главное чтоб он встречался в шагах. Значение - булево. Тут только
            один тру, остальные фолс. Тру означает основной ресурс с которого будет
            вестись перевод. У нас это смысловой перевод. Это нужно тут в форме как-то
            показать, чтоб юзер знал что с него идет перевод. Форма такая, указан айди
            ресурса, точечка или жирным выделен основной, а рядом пустое поле куда юзер
            вводит ссылку на гит. Ссылка должна быть определенного формата, там должен
            быть коммит обязательно.
          </p>
          */}
          {/* {method?.type !== 'obs' ? (
            <pre className="whitespace-pre-wrap break-words">
              {`literal
https://git.door43.org/ru_gl/ru_rlob/src/commit/94fca1416d1c2a0ff5d74eedb0597f21bd3b59b6
simplified
https://git.door43.org/ru_gl/ru_rsob/src/commit/03519d2d1f66a07ba42d7a62afb75393cf83fa1c
tn
https://git.door43.org/ru_gl/ru_tn/src/commit/cd4216222c098dd1a58e49c0011e6b3220f9ef38
tq
https://git.door43.org/ru_gl/ru_tq/src/commit/787f3f48f4ada9f0a29451b5ef318125a5fd6c7a
twl
https://git.door43.org/ru_gl/ru_twl/src/commit/17383807b558d6a7268cb44a90ac105c864a2ca1
`}
            </pre>
          ) : (
            <pre className="whitespace-pre-wrap break-words">
              {`obs
https://git.door43.org/ru_gl/ru_obs/src/commit/e562a415f60c5262382ba936928f32479056310e
obs-tn
https://git.door43.org/ru_gl/ru_obs-tn/src/commit/c61f002ac87f8321ad14fb9660798be9109fcbf3
obs-tq
https://git.door43.org/ru_gl/ru_obs-tq/src/commit/f413397bdeb3e143b96b4d978b698fa8408a77fd
obs-twl
https://git.door43.org/ru_gl/ru_obs-twl/src/commit/9f3b5ac96ee5f3b86556d2a601faee4ecb1a0cad
`}
            </pre>
          )} */}
          <div className="card flex flex-col gap-7 border-b border-slate-900 pb-7 mb-7">
            <p className="text-xl font-bold">{t('common:ResourcesList')}</p>
            <CommitsList
              methodId={methodId}
              resourcesUrl={resourcesUrl}
              setResourcesUrl={setResourcesUrl}
            />
            <div>
              <input
                className="btn-secondary btn-filled"
                type="submit"
                value={t('CreateProject')}
              />
            </div>
          </div>
        </form>
      </div>
      <LanguageCreate
        user={user}
        t={t}
        isOpen={isOpenLanguageCreate}
        closeHandle={() => setIsOpenLanguageCreate(false)}
        mutateLanguage={mutateLanguage}
        languages={languages}
      />
    </>
  )
}

export default ProjectCreate

function BriefQuestions({
  customBriefQuestions = [],
  updateBlockQuestion,
  updateCollection,
  setCustomBriefQuestions,
}) {
  const { t } = useTranslation(['projects', 'project-edit', 'common'])
  return (
    <>
      {customBriefQuestions?.map((el, index) => (
        <Disclosure key={index}>
          {({ open }) => {
            return (
              <>
                <Disclosure.Button className="flex justify-between gap-2 py-2 px-4 bg-gray-300 rounded-md">
                  <span>{el.title}</span>
                  <Down
                    className={`w-5 h-5 transition-transform duration-200 ${
                      open ? 'rotate-180' : 'rotate-0'
                    } `}
                  />
                </Disclosure.Button>
                <Disclosure.Panel className="flex flex-col gap-2">
                  <div className="flex items-center gap-2">
                    <div>{t('common:Title')}</div>
                    <UpdateField
                      value={el.title}
                      updateCollection={updateCollection}
                      index={index}
                      type={'title'}
                      collection={customBriefQuestions}
                      name="brief"
                      setter={setCustomBriefQuestions}
                    />
                  </div>
                  <div>{t('common:Questions')}</div>
                  {el.block.map((item, idx) => (
                    <Question
                      key={item.question}
                      blockQuestion={item.question}
                      updateBlockQuestion={updateBlockQuestion}
                      indexBlock={index}
                      indexQuestion={idx}
                    />
                  ))}
                </Disclosure.Panel>
              </>
            )
          }}
        </Disclosure>
      ))}
    </>
  )
}

function Question({ blockQuestion, updateBlockQuestion, indexBlock, indexQuestion }) {
  const [question, setQuestion] = useState(blockQuestion)
  useEffect(() => {
    if (blockQuestion) {
      setQuestion(blockQuestion)
    }
  }, [blockQuestion])
  return (
    <input
      className="input-primary"
      value={question}
      onChange={(e) => setQuestion(e.target.value)}
      onBlur={() =>
        updateBlockQuestion({ blockQuestion: question, indexBlock, indexQuestion })
      }
    />
  )
}
