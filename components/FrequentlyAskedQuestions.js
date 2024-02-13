import { useState } from 'react'

function FrequentlyAskedQuestions({ t, opacity }) {
  const faqData = [
    {
      questionKey: 'mainBlocks.FAQBlock.FirstQuestion.Question',
      answerKey: 'mainBlocks.FAQBlock.FirstQuestion.Answer',
      isFirst: true,
    },
    {
      questionKey: 'mainBlocks.FAQBlock.SecondQuestion.Question',
      answerKey: 'mainBlocks.FAQBlock.SecondQuestion.Answer',
    },
    {
      questionKey: 'mainBlocks.FAQBlock.ThirdQuestion.Question',
      answerKey: 'mainBlocks.FAQBlock.ThirdQuestion.Answer',
    },
    {
      questionKey: 'mainBlocks.FAQBlock.FourthQuestion.Question',
      answerKey: 'mainBlocks.FAQBlock.FourthQuestion.Answer',
    },
    {
      questionKey: 'mainBlocks.FAQBlock.FifthQuestion.Question',
      answerKey: 'mainBlocks.FAQBlock.FifthQuestion.Answer',
    },
    {
      questionKey: 'mainBlocks.FAQBlock.SixthQuestion.Question',
      answerKey: 'mainBlocks.FAQBlock.SixthQuestion.Answer',
    },
    {
      questionKey: 'mainBlocks.FAQBlock.SeventhQuestion.Question',
      answerKey: 'mainBlocks.FAQBlock.SeventhQuestion.Answer',
    },
    {
      questionKey: 'mainBlocks.FAQBlock.EighthQuestion.Question',
      answerKey: 'mainBlocks.FAQBlock.EighthQuestion.Answer',
    },
  ]

  return (
    <div className="flex flex-col w-full gap-6 md:gap-12">
      <p>{t('FAQ')}</p>
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
