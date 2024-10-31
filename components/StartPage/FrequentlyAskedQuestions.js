import { useState } from 'react'

import Close from 'public/icons/close.svg'

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
    <div className="relative flex w-full flex-col gap-6 md:gap-12">
      <p className="font-semibold md:font-bold">{t('FAQ')}</p>
      <Close
        className={`absolute right-0 top-0 h-6 w-6 cursor-pointer stroke-black md:hidden`}
      />
      <div
        className={`overflow-auto pr-5 text-sm transition-opacity duration-700 md:text-base ${
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
      className="mb-5 flex w-full flex-col justify-center gap-5 rounded-xl bg-th-secondary-100 p-5 font-normal"
      onClick={(e) => e.stopPropagation()}
    >
      <p
        onClick={toggleExpanded}
        className="cursor-pointer text-base font-bold md:text-xl"
      >
        {t(questionKey)}
      </p>
      {expanded && <p>{t(answerKey)}</p>}
    </div>
  )
}
