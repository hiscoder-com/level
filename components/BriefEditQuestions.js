import { Disclosure } from '@headlessui/react'
import { useTranslation } from 'react-i18next'

import UpdateField from './UpdateField'

import Down from 'public/icons/arrow-down.svg'
import Plus from 'public/icons/plus.svg'
import Trash from 'public/icons/trash-rounded.svg'

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
                    className={`flex w-full flex-row items-center justify-between gap-2 border-x border-t border-th-secondary-300 bg-th-secondary-10 px-4 py-2 text-start text-sm md:text-base ${
                      open ? 'rounded-t-md' : 'rounded-md border-b'
                    }`}
                  >
                    <span>{blockQuestion.title}</span>
                    <div className="flex items-center gap-7">
                      <Down
                        className={`h-5 w-5 stroke-th-text-primary transition-transform duration-200 ${
                          open ? 'rotate-180' : 'rotate-0'
                        } `}
                      />
                    </div>
                  </Disclosure.Button>
                  <Disclosure.Panel className="flex flex-col gap-7 rounded-b-md border-x border-b border-th-secondary-300 bg-th-secondary-10 p-4 text-sm md:text-base">
                    <div className="flex flex-col items-start gap-2 md:flex-row md:items-center">
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
                            <Trash className="h-10 w-10 rounded-full text-th-text-primary" />
                          </button>
                        </div>
                      ))}
                    </div>
                    <button
                      type="button"
                      className="flex items-center justify-center gap-2 rounded-md border border-th-text-primary px-4 py-2"
                      onClick={() =>
                        addQuestionIntoBlock({
                          blocks: customBriefQuestions,
                          index: index,
                        })
                      }
                    >
                      <Plus className="h-6 w-6 rounded-full border-2 border-th-text-primary stroke-th-text-primary stroke-2" />
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
                  <Trash className="h-10 w-10 rounded-full text-th-text-primary" />
                </button>
              </div>
            )
          }}
        </Disclosure>
      ))}
      <button
        type="button"
        className="flex items-center justify-center gap-2 rounded-md border border-th-text-primary bg-th-secondary-10 px-4 py-2 text-sm md:text-base"
        onClick={() => addBlock(customBriefQuestions)}
      >
        <Plus className="h-6 w-6 rounded-full border-2 border-th-text-primary stroke-th-text-primary stroke-2" />
        <div>{t('project-edit:AddBlock')}</div>
      </button>
    </>
  )
}

export default BriefEditQuestions
