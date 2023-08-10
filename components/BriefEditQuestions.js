import { Disclosure } from '@headlessui/react'
import { useTranslation } from 'react-i18next'

import UpdateField from './UpdateField'

import Down from 'public/arrow-down.svg'
import Trash from 'public/trash.svg'
import Plus from 'public/plus.svg'

function BriefEditQuestions({
  customBriefQuestions = [],
  setCustomBriefQuestions,
  saveFunction = (blocks) => {
    console.log('Save this ' + blocks + 'to anywere')
  },
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
  const updateArray = ({ array, index, fieldName, value }) => {
    const _array = array.map((obj, idx) => {
      if (index === idx) {
        return { ...obj, [fieldName]: value }
      }
      return obj
    })
    return _array
  }
  const updateTitleBlock = ({ value, index, fieldName }) => {
    if (value && index != null && fieldName) {
      const _blocks = updateArray({
        array: customBriefQuestions,
        index,
        fieldName,
        value,
      })
      setCustomBriefQuestions(_blocks)
      if (autoSave) {
        saveFunction(_blocks)
      }
    }
  }
  return (
    <>
      {customBriefQuestions?.map((el, index) => (
        <Disclosure key={index}>
          {({ open }) => {
            return (
              <div>
                <div className="flex w-full text-sm md:text-base">
                  <Disclosure.Button
                    className={`flex flex-row justify-between items-center gap-2 py-2 px-4 w-full text-start bg-blue-150 ${
                      open ? 'rounded-t-md' : 'rounded-md'
                    }`}
                  >
                    <span>{el.title}</span>
                    <div className="flex gap-7 items-center">
                      <Down
                        className={`w-5 h-5 transition-transform duration-200 ${
                          open ? 'rotate-180' : 'rotate-0'
                        } `}
                      />
                      <div
                        className="btn-red"
                        onClick={() =>
                          removeBlockByIndex({ blocks: customBriefQuestions, index })
                        }
                      >
                        <Trash className="w-4 h-4" />
                      </div>
                    </div>
                  </Disclosure.Button>
                </div>

                <Disclosure.Panel className="flex flex-col gap-7 p-4 bg-blue-150 rounded-b-md text-sm md:text-base">
                  <div className="flex flex-col md:flex-row items-start md:items-center gap-2">
                    <div className="font-bold">{t('common:Title')}</div>
                    <UpdateField
                      value={el.title}
                      index={index}
                      updateValue={updateTitleBlock}
                      fieldName={'title'}
                      specificClassName={'!bg-blue-150'}
                    />
                  </div>
                  <div className="font-bold">{t('common:Questions')}</div>
                  <div className="space-y-4">
                    {el.block.map((item, idx) => (
                      <div className="flex gap-7" key={idx}>
                        <UpdateField
                          value={item.question}
                          index={index}
                          subIndex={idx}
                          updateValue={updateQuestion}
                          fieldName={'question'}
                        />
                        <div>
                          <button
                            type="button"
                            className="btn-red bg-white"
                            onClick={() =>
                              removeQuestionFromeBlock({
                                blocks: customBriefQuestions,
                                blockIndex: index,
                                questionIndex: idx,
                              })
                            }
                          >
                            <Trash className="w-5 h-5" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                  <button
                    type="button"
                    className="flex justify-center items-center py-2 px-4 rounded-md border border-slate-900 gap-2 hover:bg-white"
                    onClick={() =>
                      addQuestionIntoBlock({ blocks: customBriefQuestions, index: index })
                    }
                  >
                    <div className="border border-slate-900 rounded-full">
                      <Plus className="w-4 h-4" />
                    </div>
                    <div>{t('project-edit:AddQuestion')}</div>
                  </button>
                </Disclosure.Panel>
              </div>
            )
          }}
        </Disclosure>
      ))}
      <button
        type="button"
        className="flex justify-center items-center gap-2 py-2 px-4 text-sm md:text-base bg-white border border-slate-900 rounded-md hover:bg-blue-150 hover:border hover:border-slate-900"
        onClick={() => addBlock(customBriefQuestions)}
      >
        <div className="flex border border-slate-900 rounded-full">
          <Plus className="w-4 h-4" />
        </div>
        <div>{t('project-edit:AddBlock')}</div>
      </button>
    </>
  )
}

export default BriefEditQuestions
