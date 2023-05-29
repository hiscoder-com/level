import { useMemo } from 'react'

import { useRouter } from 'next/router'

import { useTranslation } from 'next-i18next'

import { Tab } from '@headlessui/react'

import Brief from './Brief/BriefBlock'
import ResourceSettings from './ResourceSettings'
import Participants from './Participants/Participants'
import Breadcrumbs from '../Breadcrumbs'

import { useAccess, useProject, useUsers } from 'utils/hooks'
import { useCurrentUser } from 'lib/UserContext'

function ProjectEdit() {
  const {
    replace,
    query,
    query: { code, setting },
  } = useRouter()
  const { t } = useTranslation()

  const { user } = useCurrentUser()

  const [users] = useUsers(user?.access_token)

  const [project] = useProject({ token: user?.access_token, code })
  const [{ isCoordinatorAccess, isModeratorAccess, isAdminAccess }] = useAccess({
    token: user?.access_token,
    user_id: user?.id,
    code: project?.code,
  })

  const tabs = useMemo(
    () =>
      [
        { id: 'brief', access: true, label: 'project-edit:Brief' },

        { id: 'participants', access: isModeratorAccess, label: 'Participants' },
        {
          id: 'resources',
          access: isAdminAccess,
          label: 'Resources',
        },
      ].filter((el) => el.access),
    [isAdminAccess, isModeratorAccess]
  )
  const idTabs = tabs.map((tab) => tab.id)

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
