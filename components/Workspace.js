import { useEffect, useState } from 'react'

import { Tab } from '@headlessui/react'
import Tool from 'components/Panel/Tool'
import { useTranslation } from 'next-i18next'
import Retelling from 'public/audio.svg'
import Dict from 'public/dictionary.svg'
import Pencil from 'public/editor-pencil.svg'
import Info from 'public/info.svg'
import Notepad from 'public/notes.svg'
import TeamNote from 'public/team-note.svg'
import { useRecoilValue } from 'recoil'

import { inactiveState } from './state/atoms'

const sizes = {
  '1': 'lg:w-1/6',
  '2': 'lg:w-2/6',
  '3': 'lg:w-3/6',
  '4': 'lg:w-4/6',
  '5': 'lg:w-5/6',
  '6': 'lg:w-full',
}

const translateIcon = <Pencil className="inline w-5" />

const icons = {
  personalNotes: <Notepad className="inline w-[14px]" />,
  teamNotes: <TeamNote className="inline w-5" />,
  dictionary: <Dict className="inline w-5" />,
  retelling: <Retelling className="inline w-5" />,
  info: <Info className="inline w-5" />,
  commandTranslate: translateIcon,
  draftTranslate: translateIcon,
  translate: translateIcon,
}

function Workspace({ stepConfig, reference, editable = false }) {
  const inactive = useRecoilValue(inactiveState)
  const [tnLink, setTnLink] = useState('')
  useEffect(() => {
    for (const resourceName in stepConfig.resources) {
      if (Object.hasOwnProperty.call(stepConfig.resources, resourceName)) {
        const res = stepConfig.resources[resourceName]
        if (res.manifest.dublin_core.identifier === 'tn') {
          const repo = `${res.owner}/${res.repo}/raw/commit/${res.commit}`
          const bookPath = res.manifest.projects.find(
            (el) => el.identifier === reference.book
          )?.path

          let url = ''
          if (bookPath.slice(0, 2) === './') {
            url = `${
              process.env.NEXT_PUBLIC_NODE_HOST ?? 'https://git.door43.org'
            }/${repo}${bookPath.slice(1)}`
          } else {
            url = `${
              process.env.NEXT_PUBLIC_NODE_HOST ?? 'https://git.door43.org'
            }/${repo}/${bookPath}`
          }
          setTnLink(url)
        }
      }
    }
  }, [reference?.book, stepConfig])
  return (
    <div className="f-screen-appbar mx-auto flex flex-col items-center gap-3 lg:max-w-7xl lg:flex-row lg:items-stretch xl:gap-7">
      {stepConfig.config.map((el, index) => {
        return (
          <div
            key={index}
            className={`flex w-full flex-col gap-1 overflow-hidden lg:gap-5 lg:px-2 xl:px-0 ${
              index === 0 && inactive ? 'inactive' : ''
            } ${sizes[el.size]}`}
          >
            <Panel
              tools={el.tools}
              resources={stepConfig.resources}
              reference={reference}
              mainResource={stepConfig.resources[stepConfig.base_manifest]}
              tnLink={tnLink}
              wholeChapter={stepConfig.whole_chapter}
              editable={editable}
              isRtl={stepConfig.is_rtl}
            />
          </div>
        )
      })}
    </div>
  )
}

export default Workspace

function classNames(...classes) {
  return classes.filter(Boolean).join(' ')
}
const sizeTabs = {
  1: 'w-1/4',
  2: 'w-full md:w-2/3 ',
  3: 'w-full lg:w-full ',
  4: 'w-full',
  5: 'w-full',
  6: 'w-full',
}

function Panel({
  tools,
  resources,
  reference,
  mainResource,
  tnLink,
  wholeChapter,
  isRtl = false,
  editable = false,
}) {
  const { t } = useTranslation('common')
  return (
    <Tab.Group>
      <Tab.List
        className={`-mb-2 mt-2 flex gap-2 overflow-auto px-3 lg:-mb-7 ${
          sizeTabs[tools.length]
        } text-center text-xs font-bold`}
      >
        {tools?.map((tool) => (
          <Tab
            key={tool.name}
            className={({ selected }) =>
              classNames(
                'flex-1 overflow-hidden text-ellipsis whitespace-nowrap p-1 text-xs md:p-2 md:text-sm lg:pb-3 lg:text-base',
                selected ? 'tab-active' : 'tab-inactive'
              )
            }
          >
            {[
              'translate',
              'commandTranslate',
              'draftTranslate',
              'teamNotes',
              'personalNotes',
              'retelling',
              'dictionary',
              'info',
              'tnotes',
              'tquestions',
              'twords',
            ].includes(tool.name) ? (
              <span title={t(tool.name)}>
                {icons[tool.name]}
                <span
                  className={`${
                    tool.name && icons[tool.name] ? 'hidden' : ''
                  } ml-2 sm:inline`}
                >
                  {t(tool.name)}
                </span>
              </span>
            ) : (
              tool.name
            )}
          </Tab>
        ))}
      </Tab.List>
      <Tab.Panels>
        {tools.map((tool, index) => {
          return (
            <Tab.Panel key={index}>
              <div className="flex h-full flex-col rounded-lg bg-th-secondary-10">
                <Tool
                  editable={editable}
                  tnLink={tnLink}
                  config={{
                    reference,
                    wholeChapter,
                    mainResource,
                    config: tool.config,
                    resource: resources[tool.name]
                      ? resources[tool.name]
                      : { manifest: { dublin_core: { subject: tool.name } } },
                    isRtl,
                  }}
                  toolName={tool.name}
                />
              </div>
            </Tab.Panel>
          )
        })}
      </Tab.Panels>
    </Tab.Group>
  )
}
