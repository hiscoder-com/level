import { Disclosure } from '@headlessui/react'
import Link from 'next/link'
import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useAccess } from 'utils/hooks'
import useSupabaseClient from 'utils/supabaseClient'
import Modal from './Modal'

function ProjectSupportCard({ project, user }) {
  const { t } = useTranslation(['books'])

  const supabase = useSupabaseClient()
  const [current, setCurrent] = useState(null)
  const [currentSteps, setCurrentSteps] = useState({})
  const [isOpenModal, setIsOpenModal] = useState(false)
  const [{ isSupporterAccess }, { isLoading }] = useAccess({
    user_id: user?.id,
    code: project?.code,
  })
  useEffect(() => {
    supabase.rpc('get_current', { projects_id: project?.id }).then((res) => {
      const transformedData = {}

      res.data.forEach((item) => {
        const {
          book,
          chapter,
          step,
          title,
          started_at,
          project_translator_id,
          user_login,
          users_id,
        } = item

        if (!transformedData[book]) {
          transformedData[book] = {}
        }

        if (!transformedData[book][chapter]) {
          transformedData[book][chapter] = {}
        }

        if (!transformedData[book][chapter][step]) {
          transformedData[book][chapter][step] = {
            title,
            started_at,
            translators: [],
          }
        }

        transformedData[book][chapter][step].translators.push({
          project_translator_id,
          user_login,
          users_id,
        })
      })
      setCurrent(transformedData)
    })
  }, [project?.id, supabase])

  return (
    <>
      <Modal isOpen={isOpenModal} closeHandle={() => setIsOpenModal(false)}>
        <div className="min-h-[20vh]">
          <h1 className="mb-5 text-xl text-center">Список шагов и переводчиков</h1>
          {currentSteps?.steps &&
            Object.keys(currentSteps.steps).map((step) => {
              return (
                <div key={step}>
                  <Link
                    href={`translate/${project.code}/${currentSteps.book}/${currentSteps.chapter}/${step}/${currentSteps.steps[step].translators[0].user_login}`}
                  >
                    {currentSteps.steps[step].translators[0].user_login} -{' '}
                    {currentSteps.steps[step].title}
                  </Link>
                </div>
              )
            })}
        </div>
      </Modal>
      {isSupporterAccess && (
        <div className="card space-y-1">
          <h1 className="font-bold text-2xl mb-10 ">{project.title}</h1>
          {current &&
            Object.keys(current)?.map((book) => {
              return (
                <div key={book}>
                  <Disclosure>
                    <Disclosure.Button className="border border-slate-300 px-5 w-52 py-2 text-start">
                      {t(book)}
                    </Disclosure.Button>
                    <Disclosure.Panel className="text-gray-500 flex space-x-1  mt-1">
                      {current[book] &&
                        Object.keys(current[book]).map((chapter) => {
                          return (
                            <div className="" key={chapter}>
                              <button
                                className="py-2 px-4 border border-slate-900"
                                onClick={() => {
                                  setCurrentSteps({
                                    steps: current[book][chapter],
                                    book,
                                    chapter,
                                  })
                                  setIsOpenModal(true)
                                }}
                              >
                                {chapter}
                              </button>
                            </div>
                          )
                        })}
                    </Disclosure.Panel>
                  </Disclosure>
                </div>
              )
            })}
        </div>
      )}
    </>
  )
}

export default ProjectSupportCard
