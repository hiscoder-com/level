import { Disclosure } from '@headlessui/react'
import { useTranslation } from 'react-i18next'

import UpdateField from './UpdateField'

import Down from 'public/arrow-down.svg'
import Minus from 'public/minus.svg'
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
              <>
                <div className="flex gap-7 w-full text-sm md:text-base">
                  <Disclosure.Button className="flex flex-col md:flex-row justify-between items-center gap-2 py-2 px-4 w-5/6 bg-blue-150 rounded-md">
                    <span>{el.title}</span>
                    <Down
                      className={`w-5 h-5 transition-transform duration-200 ${
                        open ? 'rotate-180' : 'rotate-0'
                      } `}
                    />
                  </Disclosure.Button>
                  <div className="flex items-center">
                    <button
                      type="button"
                      className="btn-red flex items-center gap-2 bg-blue-150"
                      onClick={() =>
                        removeBlockByIndex({ blocks: customBriefQuestions, index })
                      }
                    >
                      <div className="rounded-full border-red-500 border p-1">
                        <Minus className="w-5 h-5" />
                      </div>
                      <div className="hidden sm:block">{t('RemoveBlock')}</div>
                    </button>
                  </div>
                </div>

                <Disclosure.Panel className="flex flex-col gap-2 p-4 bg-blue-150 rounded-md">
                  <div className="flex flex-col md:flex-row items-center gap-2">
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
                          className="btn-red flex items-center gap-2 bg-white"
                          onClick={() =>
                            removeQuestionFromeBlock({
                              blocks: customBriefQuestions,
                              blockIndex: index,
                              questionIndex: idx,
                            })
                          }
                        >
                          <div className="p-1 rounded-full border-red-500 border">
                            <Minus className="w-5 h-5" />
                          </div>
                          <div className="hidden sm:block">{t('RemoveQuestion')}</div>
                        </button>
                      </div>
                    </div>
                  ))}
                  <button
                    type="button"
                    className="flex justify-center items-center py-2 px-4 rounded-md border border-slate-900 gap-2 hover:bg-white"
                    onClick={() =>
                      addQuestionIntoBlock({ blocks: customBriefQuestions, index: index })
                    }
                  >
                    <div className="p-2 border border-slate-900 rounded-full">
                      <Plus className="w-5 h-5" />
                    </div>
                    <div>{t('AddQuestion')}</div>
                  </button>
                </Disclosure.Panel>
              </>
            )
          }}
        </Disclosure>
      ))}
      <button
        type="button"
        className="flex justify-center items-center gap-2 py-2 px-4 bg-white border border-slate-900 rounded-md hover:bg-blue-150 hover:border hover:border-slate-900"
        onClick={() => addBlock(customBriefQuestions)}
      >
        <div className="flex p-2 border border-slate-900 rounded-full">
          <Plus className="w-5 h-5" />
        </div>
        <div>{t('AddBlock')}</div>
      </button>
    </>
  )
}

export default BriefEditQuestions
