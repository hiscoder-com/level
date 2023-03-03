import { useEffect, useState } from 'react'

import Link from 'next/link'
import { useRouter } from 'next/router'

import { useTranslation } from 'next-i18next'

import Modal from 'components/Modal'

import { supabase } from 'utils/supabaseClient'
import { readableDate, compileChapter, downloadPdf, downloadFile } from 'utils/helper'

function ChapterList({ selectedBook, project, highLevelAccess }) {
  const [openCreatingChapter, setOpenCreatingChapter] = useState(false)
  const [openDownloading, setOpenDownloading] = useState(false)

  const {
    query: { book, code },
    push,
    locale,
  } = useRouter()
  const [selectedChapter, setSelectedChapter] = useState(null)
  const [chapters, setChapters] = useState([])
  const [createdChapters, setCreatedChapters] = useState([])
  const [currentChapter, setCurrentChapter] = useState([])

  const [currentSteps, setCurrentSteps] = useState(null)
  const [downloadSettings, setDownloadSettings] = useState({
    WithImages: true,
    WithFront: true,
  })

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
            <th className="py-3 px-6">{`${t('Download')} / ${t('Open')}`}</th>
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
                        setOpenCreatingChapter(true)
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
                      <button
                        className="text-blue-600 hover:text-gray-400 p-2"
                        onClick={(e) => {
                          e.stopPropagation()
                          setCurrentChapter(chapter)
                          setOpenDownloading(true)
                        }}
                      >
                        {t('Download')}
                      </button>
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
        isOpen={openCreatingChapter}
        closeHandle={() => {
          setOpenCreatingChapter(false)
        }}
      >
        <div className="text-center mb-4">
          {t('WantCreateChapter')} {selectedChapter?.num}?
        </div>
        <div className="flex justify-center">
          <button
            onClick={() => {
              setOpenCreatingChapter(false)
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
                setOpenCreatingChapter(false)
              }}
            >
              {t('common:Close')}
            </button>
          </div>
        </div>
      </Modal>
      <Modal
        isOpen={openDownloading}
        closeHandle={() => {
          setOpenDownloading(false)
        }}
      >
        <div className="text-center mb-4">{t('Download')}</div>
        <div
          className="p-2 hover:bg-gray-200  border-y-2 cursor-pointer"
          onClick={async (e) => {
            e.stopPropagation()
            downloadPdf({
              htmlContent: await compileChapter(
                {
                  json: currentChapter?.text,
                  chapterNum: currentChapter?.num,
                  project: {
                    baseManifest: project?.base_manifest,
                    method: project?.type,
                    title: project.title,
                  },
                  book: selectedBook,
                },
                project?.type === 'obs' ? 'pdf-obs' : 'pdf',
                downloadSettings
              ),
              projectLanguage: {
                code: project.languages.code,
                title: project.languages.orig_name,
              },
              fileName: `${project.title}_${
                project?.type !== 'obs'
                  ? selectedBook?.properties?.scripture?.toc1 ?? 'Book'
                  : selectedBook?.properties?.obs?.title ?? 'Open bible stories'
              }`,
            })
          }}
        >
          {t('ExportToPdf')}
        </div>
        <div
          className="p-2 hover:bg-gray-200  border-b-2 cursor-pointer"
          onClick={async (e) => {
            e.stopPropagation()
            project?.type === 'obs'
              ? downloadFile({
                  text: await compileChapter(
                    {
                      json: currentChapter?.text,
                      chapterNum: currentChapter?.num,
                      project: {
                        baseManifest: project?.base_manifest,
                      },
                    },
                    'markdown'
                  ),
                  title: `${String(currentChapter?.num).padStart(2, '0')}.md`,
                  type: 'markdown/plain',
                })
              : downloadFile({
                  text: await compileChapter(
                    {
                      json: currentChapter?.text,
                      title: `${project.title}\n${selectedBook.properties.scripture.toc1}\n${selectedBook.properties.scripture.chapter_label} ${currentChapter?.num}`,
                      subtitle: `${t(`books:${selectedBook?.code}`)} ${t('Chapter')} ${
                        currentChapter.num
                      }`,
                      chapterNum: currentChapter?.num,
                    },
                    'txt'
                  ),
                  title: `${project.title}_${selectedBook.properties.scripture.toc1}_chapter_${currentChapter?.num}.txt`,
                })
          }}
        >
          {project?.type === 'obs' ? t('ExportToMd') : 'ExportToTxt'}
        </div>
        {Object.entries(downloadSettings)
          .filter((el) => project?.type === 'obs' || el[0] === 'WithFront')
          .map((el, index) => {
            const [label, value] = el
            return (
              <div key={index}>
                <input
                  className="mt-4 h-[17px] w-[17px] cursor-pointer accent-cyan-600"
                  type="checkbox"
                  checked={value}
                  onChange={() =>
                    setDownloadSettings((prev) => {
                      return { ...prev, [el[0]]: !value }
                    })
                  }
                />
                <span className="ml-2">{t(label)}</span>
              </div>
            )
          })}
        <div className="flex justify-end">
          <button
            className="btn-cyan mt-2"
            onClick={() => {
              setOpenDownloading(false)
            }}
          >
            {t('common:Close')}
          </button>
        </div>
      </Modal>
    </div>
  )
}
export default ChapterList
