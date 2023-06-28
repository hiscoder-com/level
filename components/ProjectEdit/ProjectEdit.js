import { useEffect, useMemo, useState } from 'react'

import { useRouter } from 'next/router'

import { useTranslation } from 'next-i18next'

import { Tab } from '@headlessui/react'

import Brief from './Brief/BriefBlock'
import ResourceSettings from './ResourceSettings'
import Participants from './Participants/Participants'
import Breadcrumbs from '../Breadcrumbs'

import { useAccess, useGetSteps, useProject, useUsers } from 'utils/hooks'
import { useCurrentUser } from 'lib/UserContext'
import BaseInformation from 'components/ProjectCreate/BaseInformation'
import Steps from 'components/ProjectCreate/Steps'
import { supabase } from 'utils/supabaseClient'

function ProjectEdit() {
  const {
    replace,
    query,
    query: { code, setting },
  } = useRouter()
  const { t } = useTranslation()
  const [customSteps, setCustomSteps] = useState([])

  const { user } = useCurrentUser()

  const [users] = useUsers(user?.access_token)
  const [steps] = useGetSteps({ token: user?.access_token, code })
  const [project] = useProject({ token: user?.access_token, code })
  const [{ isCoordinatorAccess, isModeratorAccess, isAdminAccess }] = useAccess({
    token: user?.access_token,
    user_id: user?.id,
    code: project?.code,
  })

  const tabs = useMemo(
    () =>
      [
        { id: 'general', access: isAdminAccess, label: 'project-edit:General' },
        { id: 'brief', access: true, label: 'project-edit:Brief' },
        { id: 'participants', access: isModeratorAccess, label: 'Participants' },
        {
          id: 'resources',
          access: isAdminAccess,
          label: 'Resources',
        },
        {
          id: 'steps',
          access: isAdminAccess,
          label: 'Steps',
        },
        {
          id: 'briefLocale',
          access: isAdminAccess,
          label: 'BriefLocalization',
        },
      ].filter((el) => el.access),
    [isAdminAccess, isModeratorAccess]
  )
  const idTabs = tabs.map((tab) => tab.id)
  const updateStep = ({ ref, index }) => {
    const _steps = customSteps.map((obj, idx) => {
      if (index === idx) {
        return { ...obj, ...ref }
      }

      return obj
    })
    const updateDB = async () => {}
    // localStorage.setItem('methods', JSON.stringify(_methods))
    setCustomSteps(_steps)
  }

  useEffect(() => {
    if (steps) {
      console.log(steps)
      setCustomSteps(steps)
    }
    // const getSteps = async () => {
    //   const { data, error } = await supabase
    //     .from('steps')
    //     .select('*')
    //     .eq('project_id', project.id)
    //   setCustomSteps(data)
    // }
    // if (project) {
    //   getSteps()
    // }
  }, [steps])

  return (
    <div className="flex flex-col gap-7 mx-auto pb-10 max-w-7xl">
      <Breadcrumbs
        links={[
          { title: project?.title, href: '/projects/' + code },
          { title: t('Settings') },
        ]}
        full
      />

      <div className="hidden sm:flex flex-col gap-7">
        {user?.id && (
          <Tab.Group defaultIndex={idTabs.indexOf(setting)}>
            <Tab.List className="grid grid-cols-3 md:grid-cols-6 xl:grid-cols-9 gap-4 mt-2 lg:text-lg font-bold text-center border-b border-slate-600">
              {tabs.map((tab) => (
                <Tab
                  key={tab.label}
                  className={({ selected }) => (selected ? 'tab-active' : 'tab')}
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
              <Tab.Panel>
                {/* <BaseInformation
                  access={isCoordinatorAccess}
                  t={t}
                  errors={errors}
                  register={register}
                  setValue={setValue}
                  user={user}
                  methods={methods}
                /> */}
              </Tab.Panel>
              <Tab.Panel>
                <Brief access={isCoordinatorAccess} />
              </Tab.Panel>
              <Tab.Panel>
                <Participants
                  user={user}
                  users={users}
                  access={{ isCoordinatorAccess, isAdminAccess }}
                />
              </Tab.Panel>
              <Tab.Panel>
                <ResourceSettings />
              </Tab.Panel>
              <Tab.Panel>
                <div className="card flex flex-col gap-2 border-y border-slate-900 py-7">
                  <p className="text-xl font-bold mb-5">Шаги</p>
                  <Steps customSteps={customSteps} updateStep={updateStep} t={t} />
                </div>
              </Tab.Panel>
            </Tab.Panels>
          </Tab.Group>
        )}
      </div>
      <div className="flex sm:hidden flex-col gap-7">
        <Brief access={isCoordinatorAccess} />
        <Participants
          user={user}
          users={users}
          access={{ isCoordinatorAccess, isAdminAccess }}
        />
        <ResourceSettings />
      </div>
    </div>
  )
}

export default ProjectEdit
