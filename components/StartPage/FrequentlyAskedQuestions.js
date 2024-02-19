import { useState } from 'react'

import Close from 'public/close.svg'

function FrequentlyAskedQuestions({ t, opacity }) {
  const faqData = [
    {
      questionKey: 'MainBlocks.FAQBlock.FirstQuestion.Question',
      answerKey: 'MainBlocks.FAQBlock.FirstQuestion.Answer',
      isFirst: true,
    },
    {
      questionKey: 'MainBlocks.FAQBlock.SecondQuestion.Question',
      answerKey: 'MainBlocks.FAQBlock.SecondQuestion.Answer',
    },
    {
      questionKey: 'MainBlocks.FAQBlock.ThirdQuestion.Question',
      answerKey: 'MainBlocks.FAQBlock.ThirdQuestion.Answer',
    },
    {
      questionKey: 'MainBlocks.FAQBlock.FourthQuestion.Question',
      answerKey: 'MainBlocks.FAQBlock.FourthQuestion.Answer',
    },
    {
      questionKey: 'MainBlocks.FAQBlock.FifthQuestion.Question',
      answerKey: 'MainBlocks.FAQBlock.FifthQuestion.Answer',
    },
    {
      questionKey: 'MainBlocks.FAQBlock.SixthQuestion.Question',
      answerKey: 'MainBlocks.FAQBlock.SixthQuestion.Answer',
    },
    {
      questionKey: 'MainBlocks.FAQBlock.SeventhQuestion.Question',
      answerKey: 'MainBlocks.FAQBlock.SeventhQuestion.Answer',
    },
    {
      questionKey: 'MainBlocks.FAQBlock.EighthQuestion.Question',
      answerKey: 'MainBlocks.FAQBlock.EighthQuestion.Answer',
    },
  ]

  return (
    <div className="relative flex flex-col w-full gap-6 md:gap-12">
      <p className="font-semibold md:font-bold">{t('FAQ')}</p>
      <Close
        className={`absolute md:hidden w-6 h-6 right-0 top-0 stroke-black cursor-pointer`}
      />
      <div
        className={`text-sm md:text-base transition-opacity duration-700 overflow-auto pr-5 ${
          opacity || ''
        }`}
      >
        {faqData.map((faq, index) => (
          <FAQ key={index} t={t} {...faq} />
        ))}
      </div>
    </div>
  )
}

export default FrequentlyAskedQuestions

function FAQ({ t, questionKey, answerKey, isFirst }) {
  const [expanded, setExpanded] = useState(isFirst)

  const toggleExpanded = () => {
    setExpanded(!expanded)
  }

  return (
    <div
      className="flex flex-col gap-5 justify-center w-full p-5 mb-5 font-normal rounded-xl bg-th-secondary-100"
      onClick={(e) => e.stopPropagation()}
    >
      <p
        onClick={toggleExpanded}
        className="font-bold text-base md:text-xl cursor-pointer"
      >
        {t(questionKey)}
      </p>
      {expanded && <p>{t(answerKey)}</p>}
    </div>
  )
}
