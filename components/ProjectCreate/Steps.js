import { useEffect, useRef, useState } from 'react'

import { Disclosure } from '@headlessui/react'

import Down from 'public/arrow-down.svg'

function Steps({ customSteps = [], updateStep, t, method }) {
  const refs = useRef([])
  const [defaultOpen, setDefaultOpen] = useState(false)

  const handleClose = (index) => {
    refs.current.map((closeFunction, refIndex) => {
      console.log(refIndex, index)
      if (refIndex !== index) {
        closeFunction(refIndex)
      }
    })
  }
  useEffect(() => {
    setDefaultOpen(false)
    // handleClose()
  }, [method])

  console.log(defaultOpen)
  return (
    <>
      {customSteps?.map((el, index) => (
        <Disclosure defaultOpen={defaultOpen} key={el.title}>
          {({ open, close }) => {
            return (
              <>
                <Disclosure.Button
                  className="flex justify-center gap-2 bg-gray-300 py-2 rounded-md"
                  ref={() => (refs.current[index] = close)}
                  onClick={() => {
                    setDefaultOpen(true)
                    handleClose(index)
                  }}
                >
                  <span>{el.title}</span>
                  <Down className="w-5 h-5" />
                </Disclosure.Button>

                <Disclosure.Panel
                  static
                  className={`${open ? 'flex' : 'hidden'} flex-col gap-2`}
                >
                  <div className="flex items-center gap-2">
                    <span className="w-1/6">Название</span>
                    <StepTitle
                      stepTitle={el.title}
                      updateStep={updateStep}
                      index={index}
                    />
                  </div>
                  <div className="flex items-center gap-2 w-full">
                    <span className="w-1/6">Описание</span>
                    <Description
                      stepDescription={el.description}
                      updateStep={updateStep}
                      index={index}
                    />
                  </div>
                  <div className="flex items-center gap-2 w-full">
                    <span className="w-1/6">Интро</span>
                    <Intro stepIntro={el.intro} updateStep={updateStep} index={index} />
                  </div>
                  <div className="flex items-center gap-2 w-full">
                    <span className="w-1/6">Инструменты</span>
                    <div className="flex flex-wrap items-center gap-2">
                      {el.config[0].tools.map((item) => (
                        <div
                          key={item.name}
                          className="btn-primary hover:bg-transparent hover:border-slate-600 p-2 rounded-md !cursor-auto"
                        >
                          {t('common:' + item.name)}
                        </div>
                      ))}
                      |
                      {el.config[1].tools.map((item) => (
                        <div
                          key={item.name}
                          className="btn-primary hover:bg-transparent hover:border-slate-600 p-2 rounded-md !cursor-auto"
                        >
                          {t('common:' + item.name)}
                        </div>
                      ))}
                      |
                      {el.config[2]?.tools?.map((item) => (
                        <div
                          key={item.name}
                          className="btn-primary hover:bg-transparent hover:border-slate-600 p-2 rounded-md !cursor-auto"
                        >
                          {t('common:' + item.name)}
                        </div>
                      ))}
                    </div>
                  </div>
                  <div className="flex items-center gap-2 w-full">
                    <span className="w-1/6">Количество переводчиков</span>
                    <div className="btn-primary hover:bg-transparent hover:border-slate-600 p-2 rounded-md !cursor-auto">
                      {el.count_of_users}
                    </div>
                  </div>
                  <div className="flex items-center gap-2 w-full">
                    <span className="w-1/6">Время выполнения</span>
                    <div className="btn-primary hover:bg-transparent hover:border-slate-600 p-2 rounded-md !cursor-auto">
                      {el.time}
                    </div>
                  </div>
                </Disclosure.Panel>
              </>
            )
          }}
        </Disclosure>
      ))}
    </>
  )
}

export default Steps

function StepTitle({ stepTitle, updateStep, index }) {
  const [title, setTitle] = useState(stepTitle)
  useEffect(() => {
    if (stepTitle) {
      setTitle(stepTitle)
    }
  }, [stepTitle])

  return (
    <input
      className="input-primary"
      value={title}
      onChange={(e) => setTitle(e.target.value)}
      onBlur={() => {
        updateStep({ ref: { title: title.trim() }, index })
      }}
    />
  )
}

function Description({ stepDescription, updateStep, index }) {
  const [description, setDescription] = useState('')
  useEffect(() => {
    if (stepDescription) {
      setDescription(stepDescription)
    }
  }, [stepDescription])
  return (
    <textarea
      className="input-primary"
      value={description}
      onChange={(e) => setDescription(e.target.value)}
      onBlur={() => {
        updateStep({ ref: { description: description.trim() }, index })
      }}
    />
  )
}

function Intro({ stepIntro, updateStep, index }) {
  const [intro, setIntro] = useState('')
  useEffect(() => {
    if (stepIntro) {
      setIntro(stepIntro)
    }
  }, [stepIntro])
  return (
    <textarea
      className="input-primary"
      value={intro}
      onChange={(e) => setIntro(e.target.value)}
      onBlur={() => {
        updateStep({ ref: { intro: intro.trim() }, index })
      }}
    />
  )
}
