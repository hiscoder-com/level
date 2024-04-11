import { useEffect, useState } from 'react'

import { useTranslation } from 'next-i18next'

import { Tab } from '@headlessui/react'

import { useRecoilValue } from 'recoil'

import Tool from 'components/Panel/Tool'

import { inactiveState } from './state/atoms'

import Dict from 'public/dictionary.svg'
import TeamNote from 'public/team-note.svg'
import Notepad from 'public/notepad.svg'
import Retelling from 'public/audio.svg'
import Pencil from 'public/editor-pencil.svg'
import Info from 'public/info.svg'

const sizes = {
  '1': 'lg:w-1/6',
  '2': 'lg:w-2/6',
  '3': 'lg:w-3/6',
  '4': 'lg:w-4/6',
  '5': 'lg:w-5/6',
  '6': 'lg:w-full',
}

const translateIcon = <Pencil className="w-5 inline" />

const icons = {
  personalNotes: <Notepad className="w-5 inline" />,
  teamNotes: <TeamNote className="w-5 inline" />,
  dictionary: <Dict className="w-5 inline" />,
  retelling: <Retelling className="w-5 inline" />,
  info: <Info className="w-5 inline" />,
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
    <div className="f-screen-appbar flex flex-col gap-3 xl:gap-7 items-center mx-auto lg:max-w-7xl lg:items-stretch lg:flex-row">
      {stepConfig.config.map((el, index) => {
        return (
          <div
            key={index}
            className={`flex flex-col gap-1 lg:gap-5 w-full lg:px-2 xl:px-0 overflow-hidden ${
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
        className={`flex px-3 -mb-2 gap-2 mt-2 lg:-mb-7 overflow-auto ${
          sizeTabs[tools.length]
        } text-center font-bold text-xs`}
      >
        {tools?.map((tool) => (
          <Tab
            key={tool.name}
            className={({ selected }) =>
              classNames(
                'text-xs p-1 flex-1 lg:pb-3 md:p-2 md:text-sm lg:text-base text-ellipsis overflow-hidden whitespace-nowrap',
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
              <div className="flex flex-col bg-th-secondary-10 rounded-lg h-full">
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
