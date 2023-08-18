import { useEffect, useMemo, useState } from 'react'

import { useRouter } from 'next/router'

import { useTranslation } from 'next-i18next'

import axios from 'axios'
import { toast } from 'react-hot-toast'
import { useForm } from 'react-hook-form'

import { Tab } from '@headlessui/react'

import Brief from './Brief'
import ResourceSettings from './ResourceSettings'
import Participants from './Participants/Participants'
import Breadcrumbs from '../Breadcrumbs'
import Steps from '../Steps'
import BasicInformation from '../BasicInformation'
import LanguageCreate from '../LanguageCreate'

import { useAccess, useGetSteps, useLanguages, useProject, useUsers } from 'utils/hooks'
import { useCurrentUser } from 'lib/UserContext'

function ProjectEdit() {
  const {
    replace,
    query,
    query: { code, setting },
  } = useRouter()
  const { t } = useTranslation(['common', 'project-edit'])
  const [customSteps, setCustomSteps] = useState([])
  const [isOpenLanguageCreate, setIsOpenLanguageCreate] = useState(false)

  const { user } = useCurrentUser()

  const [users] = useUsers()
  const [languages, { mutate: mutateLanguage }] = useLanguages()

  const [steps] = useGetSteps({
    code,
  })
  const [project, { mutate: mutateProject }] = useProject({ code })
  const [{ isCoordinatorAccess, isModeratorAccess, isAdminAccess, isTranslatorAccess }] =
    useAccess({
      user_id: user?.id,
      code: project?.code,
    })
  const defaults = useMemo(
    () => ({
      title: project?.title,
      origtitle: project?.orig_title,
      code: project?.code,
      languageId: project?.languages?.id,
    }),
    [project?.title, project?.orig_title, project?.code, project?.languages?.id]
  )
  const {
    register,
    handleSubmit,
    formState: { errors },
    getValues,
  } = useForm({
    mode: 'onChange',
    values: defaults,
    resetOptions: {
      keepDirtyValues: true,
    },
  })
  const errorsBasicInfo = { errors }
  const saveBasicToDb = async (basicInfo) => {
    const { title, code: codeProject, languageId, origtitle } = basicInfo
    if (!title || !codeProject || !languageId || !origtitle) {
      return
    }
    axios
      .put(`/api/projects/${code}`, {
        basicInfo: {
          title,
          code: codeProject,
          language_id: languageId,
          orig_title: origtitle,
        },
        user_id: user?.id,
      })
      .then(() => {
        mutateProject()
        if (codeProject !== code) {
          replace(
            {
              pathname: `/projects/${codeProject}/edit`,
              query: { setting: 'general' },
            },
            undefined,
            { shallow: true }
          )
        }
      })
      .catch((err) => {
        toast.error(t('SaveFailed'))
      })
  }

  const saveStepToDb = async (updatedStep) => {
    const step = ['title', 'intro', 'description'].reduce(
      (acc, key) => ({ ...acc, [key]: updatedStep[key] }),
      {}
    )
    axios
      .put(`/api/projects/${code}/steps/${updatedStep?.id}`, {
        step,
      })
      .then()
      .catch((err) => {
        toast.error(t('SaveFailed'))
      })
  }

  const updateSteps = ({ index, fieldName, value }) => {
    const _steps = customSteps.map((obj, idx) => {
      if (index === idx) {
        const updatedStep = { ...obj, [fieldName]: value }
        saveStepToDb(updatedStep)
        return updatedStep
      }

      return obj
    })
    setCustomSteps(_steps)
  }

  const tabs = useMemo(
    () =>
      [
        {
          id: 'general',
          access: isAdminAccess,
          label: 'project-edit:General',
          panel: (
            <div className="card space-y-7">
              <h3 className="text-xl font-bold">{t('BasicInformation')}</h3>
              <form className="space-y-7" onSubmit={handleSubmit(saveBasicToDb)}>
                <BasicInformation
                  register={register}
                  errors={errors}
                  user={user}
                  setIsOpenLanguageCreate={setIsOpenLanguageCreate}
                  uniqueCheck={getValues('code') !== code}
                />
                <input className="btn-primary" type="submit" value={t('Save')} />
              </form>
            </div>
          ),
        },
        {
          id: 'brief',
          access: isTranslatorAccess,
          label: 'project-edit:Brief',
          panel: (
            <div className="card space-y-7">
              <Brief access={isCoordinatorAccess} title />
            </div>
          ),
        },
        {
          id: 'participants',
          access: isModeratorAccess,
          label: 'Participants',
          panel: (
            <div className="card space-y-7">
              <h3 className="text-xl font-bold">{t('Participants')}</h3>
              <Participants
                user={user}
                users={users}
                access={{ isCoordinatorAccess, isAdminAccess }}
              />
            </div>
          ),
        },
        {
          id: 'resources',
          access: isAdminAccess,
          label: 'Resources',
          panel: (
            <div className="card space-y-7">
              <h3 className="text-lg md:text-xl font-bold">{t('ListResources')}</h3>
              <ResourceSettings />
            </div>
          ),
        },
        {
          id: 'steps',
          access: isAdminAccess,
          label: 'Steps',
          panel: (
            <div className="card space-y-7">
              <p className="text-xl font-bold">{t('Steps')}</p>
              <div className="space-y-7">
                <Steps customSteps={customSteps} updateSteps={updateSteps} />
              </div>
              <button
                className="btn-primary w-fit"
                onClick={() => saveStepsToDb({ steps: customSteps })}
              >
                {t('Save')}
              </button>
            </div>
          ),
        },
      ].filter((el) => el.access),

    // eslint-disable-next-line react-hooks/exhaustive-deps
    [
      isAdminAccess,
      errorsBasicInfo,
      user,
      isTranslatorAccess,
      isCoordinatorAccess,
      isModeratorAccess,
      users,
      customSteps,
      getValues,
    ]
  )

  const idTabs = useMemo(() => tabs.map((tab) => tab.id), [tabs])

  const saveStepsToDb = async ({ steps }) => {
    const _steps = steps.map((el) => {
      const { id, description, intro, title } = el
      return { id, description, intro, title }
    })
    axios
      .put(`/api/projects/${code}/steps`, {
        _steps,
        project_id: project.id,
      })
      .then(() => toast.success(t('SaveSuccess')))
      .catch((error) => {
        toast.error(t('SaveFailed') + '. ' + t('CheckInternet'), {
          duration: 8000,
        })
        console.log(error)
      })
  }

  useEffect(() => {
    if (steps) {
      setCustomSteps(steps)
    }
  }, [steps])
  const index = useMemo(() => idTabs.indexOf(setting), [idTabs, setting])
  return (
    <div className="flex flex-col gap-7 mx-auto pb-10 max-w-7xl">
      <div className="hidden md:block">
        <Breadcrumbs
          links={[
            { title: project?.title, href: '/projects/' + code },
            { title: t('Settings') },
          ]}
          full
        />
      </div>
      <div className="hidden sm:flex flex-col gap-7">
        {user?.id && (
          <Tab.Group defaultIndex={tabs.length ? index : 0}>
            <Tab.List className="grid grid-cols-3 sm:grid-cols-6 xl:grid-cols-9 gap-4 mt-2 lg:text-lg font-bold text-center border-b border-slate-600">
              {tabs.map((tab) => (
                <Tab
                  key={tab.label}
                  className={({ selected }) =>
                    selected ? 'tab-active truncate' : 'tab truncate'
                  }
                  onClick={() =>
                    replace(
                      {
                        query: { ...query, setting: tab.id },
                      },
                      undefined,
                      { shallow: true }
                    )
                  }
                >
                  {t(tab.label)}
                </Tab>
              ))}
            </Tab.List>

            <Tab.Panels>
              {tabs.map((tab, idx) => (
                <Tab.Panel key={idx}>{tab.panel}</Tab.Panel>
              ))}
            </Tab.Panels>
          </Tab.Group>
        )}
      </div>
      <div className="flex sm:hidden px-4 py-10 -mt-5 -mx-5 -mb-10 flex-col gap-7 bg-white">
        <Breadcrumbs
          links={[
            { title: project?.title, href: '/projects/' + code },
            { title: t('Settings') },
          ]}
        />
        <div className="space-y-7 divide-y divide-slate-900">
          <div className="space-y-7">
            <h3 className="text-lg font-bold">{t('project-edit:BasicInformation')}</h3>
            <form className="space-y-7" onSubmit={handleSubmit(saveBasicToDb)}>
              <BasicInformation
                register={register}
                errors={errors}
                user={user}
                setIsOpenLanguageCreate={setIsOpenLanguageCreate}
                uniqueCheck={getValues('code') !== code}
              />
              <input className="btn-primary" type="submit" value={t('Save')} />
            </form>
          </div>
          <div className="space-y-7">
            <h3 className="mt-7 text-lg font-bold">{t('project-edit:EditBriefTitle')}</h3>
            <Brief access={isCoordinatorAccess} />
          </div>
          <div className="space-y-7">
            <h3 className="mt-7 text-lg font-bold">{t('Participants')}</h3>
            <Participants
              user={user}
              users={users}
              access={{ isCoordinatorAccess, isAdminAccess }}
            />
          </div>
          <div className="space-y-7">
            <h3 className="mt-7 text-lg font-bold">{t('ListResources')}</h3>
            <ResourceSettings />
          </div>
          <div className="space-y-7">
            <h3 className="mt-7 text-lg font-bold">{t('Steps')}</h3>
            <Steps customSteps={customSteps} updateSteps={updateSteps} />
          </div>
        </div>
      </div>
      <LanguageCreate
        user={user}
        t={t}
        isOpen={isOpenLanguageCreate}
        closeHandle={() => setIsOpenLanguageCreate(false)}
        mutateLanguage={mutateLanguage}
        languages={languages}
      />
    </div>
  )
}

export default ProjectEdit
