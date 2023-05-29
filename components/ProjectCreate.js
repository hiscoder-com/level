import { useEffect, useState } from 'react'

import { useRouter } from 'next/router'
import { useTranslation } from 'next-i18next'

import { useForm, useWatch } from 'react-hook-form'

import axios from 'axios'

import { Switch } from '@headlessui/react'

import CommitsList from './CommitsList'

import { useLanguages, useMethod, useProjects } from 'utils/hooks'
import { useCurrentUser } from 'lib/UserContext'

function ProjectCreate() {
  const [customResources, setCustomResources] = useState('')
  const [isBriefEnable, setIsBriefEnable] = useState(true)
  const [customBriefs, setCustomBriefs] = useState('')
  const [resourcesUrl, setResourcesUrl] = useState()
  const [customSteps, setCustomSteps] = useState('')
  const [method, setMethod] = useState()

  const { t } = useTranslation(['projects', 'project-edit'])
  const { user } = useCurrentUser()
  const router = useRouter()

  const [languages] = useLanguages(user?.access_token)
  const [methods] = useMethod(user?.access_token)
  const [_, { mutate: mutateProjects }] = useProjects({
    token: user?.access_token,
  })
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
        setCustomSteps(JSON.stringify(selectedMethod.steps, null, 2))
        setCustomBriefs(JSON.stringify(selectedMethod.brief, null, 2))
        setCustomResources(selectedMethod.resources)
      }
    }
  }, [methodId, methods])

  useEffect(() => {
    if (methods) {
      setValue('methodId', methods?.[0]?.id)
    }
  }, [methods, setValue])

  useEffect(() => {
    if (languages) {
      setValue('languageId', languages?.[0]?.id)
    }
  }, [languages, setValue])

  const onSubmit = async (data) => {
    const { title, code, languageId } = data
    if (!title || !code || !languageId) {
      return
    }

    axios.defaults.headers.common['token'] = user?.access_token
    axios
      .post('/api/projects', {
        isBriefEnable,
        customBriefs,
        title,
        language_id: languageId,
        code,
        method_id: method.id,
        steps: method.steps,
        resources: resourcesUrl,
      })
      .then((result) => {
        const {
          status,
          headers: { location },
        } = result
        if (status === 201) {
          router.push(location)
        }
      })
      .catch(console.log)
      .finally(mutateProjects)
  }

  const inputs = [
    {
      id: 1,
      title: t('Title'),
      classname: errors?.title ? 'input-invalid' : 'input',
      placeholder: '',
      register: {
        ...register('title', {
          required: true,
        }),
      },
      errorMessage: errors?.title ? errors?.title.message : '',
    },
    {
      id: 2,
      title: t('Code'),
      classname: errors?.code ? 'input-invalid' : 'input',
      placeholder: '',
      register: {
        ...register('code', {
          required: true,
          pattern: {
            value: /^[a-z\d\-]{2,12}\_[a-z\d\-]{1,12}$/i,
            message: t('CodeMessage'),
          },
        }),
      },
      errorMessage: errors?.code ? errors?.code.message : '',
    },
  ]

  return (
    <div className="py-0 sm:py-10">
      <div className="card">
        <form onSubmit={handleSubmit(onSubmit)}>
          <p>
            Повесить слушателя чтобы проверять, есть такой код проекта или нет. Либо на
            ввод с задержкой, либо на отправку.
          </p>
          {inputs.map((el) => (
            <div key={el.title}>
              <div>{el.title}</div>
              <input
                className={`${el.classname} max-w-sm`}
                placeholder={el.placeholder}
                {...el.register}
              />
              {el.errorMessage && <span>{' ' + el.errorMessage}</span>}
            </div>
          ))}
          <div>{t('Language')}</div>
          <select
            className="input max-w-sm"
            placeholder={t('Language')}
            {...register('languageId')}
          >
            {languages &&
              languages.map((el) => {
                return (
                  <option key={el.id} value={el.id}>
                    {el.orig_name}
                  </option>
                )
              })}
          </select>
          <div>{t('Method')}</div>
          <select
            placeholder={t('Method')}
            {...register('methodId')}
            className="input max-w-sm"
            defaultValue={methods?.[0]?.id}
          >
            {methods &&
              methods.map((el) => {
                return (
                  <option key={el.id} value={el.id}>
                    {el.title} ({el.type})
                  </option>
                )
              })}
          </select>
          <div>{t('Brief')}</div>
          <textarea
            cols="50"
            rows="30"
            onChange={(e) => setCustomBriefs(e.target.value)}
            value={customBriefs}
            className="w-full"
          />
          <div>
            <span className="mr-3">
              {t(`project-edit:${isBriefEnable ? 'DisableBrief' : 'EnableBrief'}`)}
            </span>
            <Switch
              checked={isBriefEnable}
              onChange={() => setIsBriefEnable((prev) => !prev)}
              className={`${
                isBriefEnable ? 'bg-blue-600' : 'bg-gray-300'
              } relative inline-flex h-6 w-11 items-center rounded-full`}
            >
              <span
                className={`${
                  isBriefEnable ? 'translate-x-6' : 'translate-x-1'
                } inline-block h-4 w-4 transform rounded-full bg-white transition`}
              />
            </Switch>
          </div>
          <br />
          <p>
            Тут самое сложное, так как это будет настройка шагов метода. Нужно как-то
            аккуратно его разрешить исправлять, не давать чего-то лишнего исправить. Это
            массив из шагов. Может для одного шага сделать компонент. У шага есть такие
            параметры.
          </p>
          <pre className="whitespace-pre-wrap break-words">
            {`"title": Название шага, даем юзеру возможность перевода этого поля
"description": Описание шага, возможность редактировать
"time": время, сколько минут длится шаг
"count_of_users": сколько юзеров выполняют этот шаг
"intro": введение в шаг в формате MD
"config": [ массив объектов, в котором прописано какие карточки и ресурсы отображать тут
Пока что редактировать не будем давать
Пример объекта
  "size": размер блока, ширина экрана - 6 единиц
  "tools": [ массив объектов тулсов. Есть наши стандартные, и есть пользовательские
      "name": название тулсы, редактор, заметки, глава и т.д.
      "config": а тут конфиг этого компонента`}
          </pre>
          <textarea
            cols="50"
            rows="30"
            onChange={(e) => setCustomSteps(e.target.value)}
            value={customSteps}
            className="w-full"
          />
          <br />
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
          <textarea
            cols="50"
            rows="6"
            disabled={true}
            value={JSON.stringify(customResources, null, 2)}
            className="w-full"
          />
          <br />
          {method?.type !== 'obs' ? (
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
          )}
          <br />
          <CommitsList
            methodId={methodId}
            resourcesUrl={resourcesUrl}
            setResourcesUrl={setResourcesUrl}
          />
          <br />
          <p>
            После того как нажимают на кнопку сохранить, мы делаем следующее: <br />
            1. Получаем манифесты всех ресурсов чтобы записать в таблицу проектов, в
            колонку Ресурсы. <br />
            Создаем вот такой объект
          </p>
          <pre className="whitespace-pre-wrap break-words">
            {`"тут идентификатор который в шагах у нас": {
"owner": "unfoldingword",
"repo": "en_ult",
"commit": "acf32a196",
"manifest": "{}" // а здесь будет манифест в нужном формате
},`}
          </pre>
          <p>
            2. Особенно мы обработаем основной ресурс, с которого будет идти перевод.
            Возьмем его манифест и сделаем такую структуру{' '}
          </p>
          <pre className="whitespace-pre-wrap break-words">
            {`{
"resource": "тут идентификатор этого основного ресурса",
"books": [ // массив из списка книг
  {
    "name": "gen", // айди книги
    "link": "unfoldingword/en_ult/raw/commit/a3c1876/01_GEN.usfm" // ссылка на нее
  },
]
}`}
          </pre>
          <p>
            3. Все шаги мы переносим в таблицу степс, и связываем с созданным проектом.
            <br />
            Сейчас этого кода нет, нужно подумать на сколько это критично. Мне кажется что
            для первой версии мы можем создать проект в ручную, и отложить разработку на
            время после запуска
          </p>
          <input
            className="btn-cyan btn-filled"
            type="submit"
            value={t('CreateProject')}
          />
        </form>
      </div>
    </div>
  )
}

export default ProjectCreate
