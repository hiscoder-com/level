import { useEffect, useRef, useState } from 'react'

import { Disclosure } from '@headlessui/react'

import Down from 'public/arrow-down.svg'

function Steps({ customSteps = [], updateStep, t }) {
  return (
    <>
      {customSteps?.map((el, index) => (
        <Disclosure key={index}>
          <>
            <Disclosure.Button className="flex justify-center gap-2 bg-gray-300 py-2 rounded-md">
              <span>{el.title}</span>
              <Down className="w-5 h-5" />
            </Disclosure.Button>

            <Disclosure.Panel className="flex-col gap-2">
              <div className="flex items-center gap-2">
                <span className="w-1/6">Название</span>
                <StepTitle stepTitle={el.title} updateStep={updateStep} index={index} />
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
        </Disclosure>
      ))}
    </>
  )
}

export default Steps

// function UpdateField({ value, update, index,key }) {
//   const [valueField, setValueField] = useState(value)
//   useEffect(() => {
//     if (value) {
//       setValueField(value)
//     }
//   }, [value])

//   return (
//     <input
//       className="input-primary"
//       value={valueField}
//       onChange={(e) => setValueField(e.target.value)}
//       onBlur={() => {
//         updateStep({ ref: { [key]: valueField.trim() }, index })
//       }}
//     />
//   )
// }

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
