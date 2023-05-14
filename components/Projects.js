import { useState } from 'react'

import { useTranslation } from 'react-i18next'

import { Disclosure } from '@headlessui/react'

import ProjectCard from './ProjectCard'
import ProjectPersonalCard from './ProjectPersonalCard'

import { useLanguages, useProjects } from 'utils/hooks'
import { useCurrentUser } from 'lib/UserContext'

export default function Projects({ type }) {
  const { t } = useTranslation()
  const [languagesChecked, setLanguagesChecked] = useState({})
  const [isFiltered, setIsFiltered] = useState(false)
  const { user } = useCurrentUser()
  const [projects] = useProjects({
    token: user?.access_token,
  })
  const [languages] = useLanguages(user?.access_token)

  const handleCheck = (event) => {
    setLanguagesChecked((prev) => ({
      ...prev,
      [event.target.name]: event.target.checked,
    }))
  }

  let CurrentCard
  let className
  switch (type) {
    case 'projects':
      CurrentCard = ProjectCard
      className = 'grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-7 py-5 md:py-10'
      break
    case 'account':
      CurrentCard = ProjectPersonalCard
      className = 'flex flex-col gap-7 py-10'
      break
    default:
      break
  }
  return (
    <>
      {type === 'projects' && user?.is_admin && (
        <Disclosure>
          <Disclosure.Button className="w-full">
            <div className="card mt-10 w-full font-bold">{t('Filters')}</div>
          </Disclosure.Button>
          <Disclosure.Panel className="card flex flex-col items-center justify-center mt-10 gap-7 text-gray-500 ">
            <div className="flex flex-col gap-7 w-3/4">
              <div>{t('ByLanguages')}</div>
              <div className="flex flex-wrap gap-4">
                {languages?.map((language) => (
                  <div key={language.id} className="flex gap-2">
                    <div>{language.orig_name}</div>
                    <input
                      type={'checkbox'}
                      name={language.code}
                      checked={languagesChecked[language.orig]}
                      onChange={handleCheck}
                    />
                  </div>
                ))}
              </div>
            </div>
            <button className="btn-primary self-end" onClick={() => setIsFiltered(true)}>
              {t('ApplyFilters')}
            </button>
            <button className="btn-primary self-end" onClick={() => setIsFiltered(false)}>
              {t('DropFilters')}
            </button>
          </Disclosure.Panel>
        </Disclosure>
      )}

      <div className={className}>
        {projects &&
          projects
            .filter(
              (project) =>
                !isFiltered ||
                (isFiltered &&
                  languagesChecked &&
                  Object.keys(languagesChecked)
                    .filter((key) => languagesChecked[key])
                    .includes(project?.languages.code))
            )
            .map(
              (project) =>
                project && (
                  <CurrentCard
                    key={project.id}
                    project={project}
                    token={user?.access_token}
                    user={user}
                  />
                )
            )}
      </div>
    </>
  )
}
