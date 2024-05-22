import { useEffect, useState } from 'react'

import { Switch } from '@headlessui/react'
import { useTranslation } from 'react-i18next'

import { checkLSVal } from 'utils/helper'

import { TNTWLContent } from 'components/Panel/UI'
import ListBoxMultiple from './ListBoxMultiple'
import Search from './Search'
import Images from './Images'
import Notes from './Notes'

function Aquifer({ config }) {
  const { t } = useTranslation(['aquifer', 'common'])
  const [search, setSearch] = useState('')
  const [selectedNote, setSelectedNote] = useState(null)
  const [isLoadingSearch, setIsLoadingSearch] = useState(false)
  const [isShowAllChapter, setIsShowAllChapter] = useState(false)

  function createTool(name, Component, resourceType) {
    const defaultLanguageCode = 'eng'

    return {
      name: t(name),
      node: (
        <Component
          resourceType={resourceType}
          reference={config.reference}
          languageCode={config.config.languageCode ?? defaultLanguageCode}
          query={search}
          setIsLoadingSearch={setIsLoadingSearch}
          setSelectedNote={setSelectedNote}
          isShowAllChapter={isShowAllChapter}
        />
      ),
    }
  }

  const tools = [
    createTool('common:Images', Images, 'images'),
    createTool('common:dictionary', Notes, 'dictionary'),
    createTool('common:StudyNotes', Notes, 'studyNotes'),
  ]

  const options = tools.map((item) => item.name)
  const [selectedOptions, setSelectedOptions] = useState(() => {
    const savedOptions = checkLSVal('selectedOptions', options, 'object')
    return savedOptions
  })

  useEffect(() => {
    localStorage.setItem('selectedOptions', JSON.stringify(selectedOptions))
  }, [selectedOptions])

  return (
    <>
      {selectedNote ? (
        <div className="relative h-full">
          <TNTWLContent
            setItem={setSelectedNote}
            item={{
              text: selectedNote.text,
              title: selectedNote.title,
            }}
          />
        </div>
      ) : (
        <>
          <div className="flex flex-col gap-3.5 border-b pb-5 mb-7 border-th-secondary-300">
            <div className="flex items-center gap-3.5">
              <ListBoxMultiple
                options={options}
                selectedOptions={selectedOptions}
                setSelectedOptions={setSelectedOptions}
                placeholderEmpty={t('ChooseResources')}
                placeholderFull={t('AllResources')}
              />
              <Search setSearch={setSearch} isLoading={isLoadingSearch} />
            </div>
            <div className="flex items-center justify-between">
              <span>{t('ShowAllChapter')}</span>
              <Switch
                checked={isShowAllChapter}
                onChange={() => setIsShowAllChapter((prev) => !prev)}
                className={`relative inline-flex items-center h-6 w-12 rounded-full ${
                  isShowAllChapter ? 'bg-th-primary-100' : 'bg-th-secondary-100'
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-th-secondary-10 transition ${
                    isShowAllChapter ? 'translate-x-7' : 'translate-x-1'
                  }`}
                />
              </Switch>
            </div>
          </div>
          {tools.map((tool) => {
            if (selectedOptions.includes(tool.name)) {
              return (
                <div key={tool.name}>
                  <h3 className="font-bold text-xl my-4">{tool.name}</h3>
                  {tool.node}
                </div>
              )
            }
            return null
          })}
        </>
      )}
    </>
  )
}

export default Aquifer
