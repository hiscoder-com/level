import { Disclosure } from '@headlessui/react'
import { useTranslation } from 'react-i18next'

import UpdateField from './UpdateField'

import Down from 'public/arrow-down.svg'
import Trash from 'public/trash-rounded.svg'
import Plus from 'public/plus.svg'

function BriefEditQuestions({
  setCustomBriefQuestions,
  customBriefQuestions = [],
  saveFunction = () => {},
  autoSave = false,
}) {
  const { t } = useTranslation(['projects', 'project-edit', 'common'])
  const removeBlockByIndex = ({ index, blocks }) => {
    if (blocks.length > 1) {
      const briefs = blocks.filter((_, idx) => index !== idx)
      setCustomBriefQuestions(briefs)
      if (autoSave) {
        saveFunction(briefs)
      }
    }
  }
  const addBlock = (blocks) => {
    const newBlock = {
      block: [
        {
          answer: '',
          question: 'question',
        },
      ],
      id: 'id' + Math.random().toString(16).slice(2),
      resume: '',
      title: 'block',
    }
    const _blocks = [...blocks]
    _blocks.push(newBlock)
    setCustomBriefQuestions(_blocks)
    if (autoSave) {
      saveFunction(_blocks)
    }
  }
  const removeQuestionFromeBlock = ({ blockIndex, questionIndex, blocks }) => {
    if (blocks[blockIndex].block.length > 1) {
      const _blocks = [...blocks]
      _blocks[blockIndex] = {
        ...blocks[blockIndex],
        block: blocks[blockIndex].block.filter((_, index) => index !== questionIndex),
      }
      setCustomBriefQuestions(_blocks)
      if (autoSave) {
        saveFunction(_blocks)
      }
    }
  }
  const addQuestionIntoBlock = ({ index, blocks }) => {
    const question = {
      answer: '',
      question: 'question',
    }
    const _blocks = [...blocks]
    _blocks[index].block.push(question)
    setCustomBriefQuestions(_blocks)

    if (autoSave) {
      saveFunction(_blocks)
    }
  }
  const updateQuestion = ({ value, index, subIndex, fieldName }) => {
    if (value && index != null && subIndex != null && fieldName) {
      const brief = [...customBriefQuestions]
      brief[index].block[subIndex] = {
        ...brief[index].block[subIndex],
        [fieldName]: value,
      }
      setCustomBriefQuestions(brief)
      if (autoSave) {
        saveFunction(brief)
      }
    }
  }
  const updateTitleBlock = ({ value, index, fieldName }) => {
    if (value && index != null && fieldName) {
      let _blocks = [...customBriefQuestions]
      _blocks[index][fieldName] = value
      setCustomBriefQuestions(_blocks)
      if (autoSave) {
        saveFunction(_blocks)
      }
    }
  }
  return (
    <>
      {customBriefQuestions?.map((blockQuestion, index) => (
        <Disclosure key={index}>
          {({ open }) => {
            return (
              <div className="flex items-start gap-5">
                <div className="w-full">
                  <Disclosure.Button
                    className={`flex flex-row justify-between items-center gap-2 py-2 px-4 w-full text-start text-sm md:text-base bg-th-secondary-10 border-x border-t border-th-secondary-300 ${
                      open ? 'rounded-t-md' : 'rounded-md border-b'
                    }`}
                  >
                    <span>{blockQuestion.title}</span>
                    <div className="flex gap-7 items-center">
                      <Down
                        className={`w-5 h-5 transition-transform duration-200 stroke-th-text-primary ${
                          open ? 'rotate-180' : 'rotate-0'
                        } `}
                      />
                    </div>
                  </Disclosure.Button>
                  <Disclosure.Panel className="flex flex-col gap-7 p-4 bg-th-secondary-10 border-x border-b border-th-secondary-300 rounded-b-md text-sm md:text-base">
                    <div className="flex flex-col md:flex-row items-start md:items-center gap-2">
                      <div className="font-bold">{t('common:Title')}</div>
                      <UpdateField
                        value={blockQuestion.title}
                        index={index}
                        updateValue={updateTitleBlock}
                        fieldName={'title'}
                        className="input-primary bg-th-secondary-10"
                      />
                    </div>
                    <div className="font-bold">{t('common:Questions')}</div>
                    <div className="space-y-4">
                      {blockQuestion.block.map(({ question }, idx) => (
                        <div className="flex gap-5" key={idx}>
                          <UpdateField
                            value={question}
                            index={index}
                            subIndex={idx}
                            updateValue={updateQuestion}
                            fieldName={'question'}
                            className="input-primary bg-th-secondary-10"
                          />
                          <button
                            type="button"
                            onClick={() =>
                              removeQuestionFromeBlock({
                                blocks: customBriefQuestions,
                                blockIndex: index,
                                questionIndex: idx,
                              })
                            }
                          >
                            <Trash className="w-10 h-10 text-th-text-primary rounded-full" />
                          </button>
                        </div>
                      ))}
                    </div>
                    <button
                      type="button"
                      className="flex justify-center items-center py-2 px-4 rounded-md border border-th-text-primary gap-2"
                      onClick={() =>
                        addQuestionIntoBlock({
                          blocks: customBriefQuestions,
                          index: index,
                        })
                      }
                    >
                      <Plus className="w-6 h-6 stroke-2 border-2 border-th-text-primary stroke-th-text-primary rounded-full" />
                      <div>{t('project-edit:AddQuestion')}</div>
                    </button>
                  </Disclosure.Panel>
                </div>
                <button
                  className={open ? 'hidden sm:block' : 'block'}
                  onClick={() =>
                    removeBlockByIndex({ blocks: customBriefQuestions, index })
                  }
                >
                  <Trash className="w-10 h-10 text-th-text-primary rounded-full" />
                </button>
              </div>
            )
          }}
        </Disclosure>
      ))}
      <button
        type="button"
        className="flex justify-center items-center gap-2 py-2 px-4 text-sm md:text-base bg-th-secondary-10 border border-th-text-primary rounded-md"
        onClick={() => addBlock(customBriefQuestions)}
      >
        <Plus className="w-6 h-6 stroke-2 border-2 border-th-text-primary stroke-th-text-primary rounded-full" />
        <div>{t('project-edit:AddBlock')}</div>
      </button>
    </>
  )
}

export default BriefEditQuestions
