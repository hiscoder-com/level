import { useEffect, useState } from 'react'

import Link from 'next/link'
import { useRouter } from 'next/router'

import { useTranslation } from 'next-i18next'

import Modal from 'components/Modal'
import DownloadBlock from './DownloadBlock'

import { supabase } from 'utils/supabaseClient'
import { readableDate, compileChapter } from 'utils/helper'

function ChapterList({ selectedBook, project, highLevelAccess }) {
  const [openModal, setOpenModal] = useState(false)
  const {
    query: { book, code },
    push,
    locale,
  } = useRouter()
  const [selectedChapter, setSelectedChapter] = useState(null)
  const [chapters, setChapters] = useState([])
  const [createdChapters, setCreatedChapters] = useState([])
  const [currentSteps, setCurrentSteps] = useState(null)

  const { t } = useTranslation(['common', 'books'])

  const handleCreate = async (chapter_id, num) => {
    const res = await supabase.rpc('create_verses', { chapter_id })
    if (res.data) {
      push('/projects/' + code + '/books/' + selectedBook.code + '/' + num)
    }
  }
  useEffect(() => {
    const getCreatedChapters = async () => {
      const { data: createdChaptersRaw, error } = await supabase
        .from('verses')
        .select('chapter_id')
        .eq('project_id', project.id)
        .in(
          'chapter_id',
          chapters.map((el) => el.id)
        )
      const createdChapters = new Set(createdChaptersRaw.map((el) => el.chapter_id))
      setCreatedChapters([...createdChapters])
    }
    if (project?.id && chapters?.length) {
      getCreatedChapters()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [chapters?.length, project?.id])

  useEffect(() => {
    if (project?.id) {
      supabase
        .rpc('get_current_steps', { project_id: project.id })
        .then((res) => setCurrentSteps(res.data))
    }
  }, [project?.id])

  useEffect(() => {
    const getChapters = async () => {
      const { data: chapters, error } = await supabase
        .from('chapters')
        .select('id,num,verses,started_at,finished_at,text')
        .eq('project_id', project.id)
        .eq('book_id', selectedBook.id)
      setChapters(chapters)
    }
    if (project?.id && selectedBook?.id) {
      getChapters()
    }
  }, [selectedBook?.id, project?.id])

  const getCurrentStep = (chapter, index) => {
    const step = currentSteps
      ?.filter((step) => step.book === book)
      ?.find((step) => step.chapter === chapter.num)
    if (step) {
      return (
        <Link
          key={index}
          href={`/translate/${step.project}/${step.book}/${step.chapter}/${step.step}/intro`}
        >
          <a onClick={(e) => e.stopPropagation()} className="btn btn-white mt-2">
            {step.title}
          </a>
        </Link>
      )
    }
  }

  return (
    <div className="overflow-x-auto relative">
      <div className="my-4">
        <Link href={`/projects/${project.code}`}>
          <a onClick={(e) => e.stopPropagation()} className="text-blue-450 decoration-2">
            {project.code}
          </a>
        </Link>
        /{t(`books:${selectedBook.code}`)}
      </div>
      <table className="shadow-md mb-4 text-center w-fit text-sm table-auto text-gray-500">
        <thead className="text-xs text-gray-700 uppercase bg-gray-100">
          <tr>
            <th className="py-3 px-3">{t('Chapter')}</th>
            <th className="py-3 px-3">{t('chapters:StartedAt')}</th>
            <th className="py-3 px-3 ">{t('chapters:FinishedAt')}</th>
            <th className="py-3 px-6">{t('Download')}</th>
          </tr>
        </thead>
        <tbody>
          {chapters
            ?.sort((a, b) => a.num - b.num)
            .map((chapter, index) => {
              const { id, num, text, started_at, finished_at } = chapter
              return (
                <tr
                  key={index}
                  onClick={() => {
                    if (highLevelAccess) {
                      if (!createdChapters.includes(id)) {
                        setSelectedChapter(chapter)
                        setOpenModal(true)
                      } else {
                        push(
                          '/projects/' +
                            project?.code +
                            '/books/' +
                            selectedBook?.code +
                            '/' +
                            num
                        )
                      }
                    }
                  }}
                  className={`${
                    highLevelAccess ? 'cursor-pointer hover:bg-gray-50' : ''
                  } ${
                    !createdChapters.includes(id) ? 'bg-gray-100' : 'bg-white'
                  } border-b`}
                >
                  <th
                    scope="row"
                    className="py-4 px-6 font-medium text-gray-900 whitespace-nowrap"
                  >
                    {num}
                  </th>
                  <td className="py-4 px-6">
                    {started_at && readableDate(started_at, locale)}
                  </td>
                  <td className="py-4 px-6 ">
                    {finished_at && readableDate(finished_at, locale)}
                  </td>

                  <td className="py-4 px-6">
                    {finished_at ? (
                      <DownloadBlock
                        actions={{ compile: compileChapter }}
                        state={{
                          txt: {
                            ref: {
                              json: chapter?.text,
                              bookCode: selectedBook.code,
                              title: `${project.title} ${t(
                                `books:${selectedBook?.code}`
                              )} ${t('Chapter')} ${chapter.num} `,
                            },
                            fileName: `${selectedBook.code}_chapter${chapter.num}.md`,
                          },
                          pdf: {
                            ref: {
                              json: chapter?.text,
                              title: project.title,
                              subtitle: `${t(`books:${selectedBook?.code}`)} ${t(
                                'Chapter'
                              )} ${chapter.num}`,
                            },

                            projectLanguage: {
                              code: project.languages.code,
                              title: project.languages.title,
                            },
                          },
                          markdown: {
                            ref: {
                              json: chapter?.text,
                              title: project.title,
                              subtitle: `${t(`books:${selectedBook?.code}`)} ${t(
                                'Chapter'
                              )} ${chapter.num}`,
                              baseManifest: project?.base_manifest,
                              chapterNum: chapter?.num,
                            },
                          },
                        }}
                      />
                    ) : (
                      getCurrentStep(chapter, index)
                    )}
                  </td>
                </tr>
              )
            })}
        </tbody>
      </table>
      <Modal
        isOpen={openModal}
        closeHandle={() => {
          setOpenModal(false)
        }}
      >
        <div className="text-center mb-4">
          {t('WantCreateChapter')} {selectedChapter?.num}?
        </div>
        <div className="flex justify-center">
          <button
            onClick={() => {
              setOpenModal(false)
              handleCreate(selectedChapter.id, selectedChapter.num)
            }}
            className="btn-cyan"
          >
            {t('Create')}
          </button>
          <div className="ml-4">
            <button
              className="btn-cyan"
              onClick={() => {
                setOpenModal(false)
              }}
            >
              {t('common:Close')}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  )
}
export default ChapterList
