import Close from 'public/close.svg'

function Reviews({ t, opacity }) {
  const reviewData = [
    {
      nameKey: 'MainBlocks.ReviewsBlock.FirstReview.Name',
      countryKey: 'MainBlocks.ReviewsBlock.FirstReview.Country',
      textKey: 'MainBlocks.ReviewsBlock.FirstReview.Text',
    },
    {
      nameKey: 'MainBlocks.ReviewsBlock.SecondReview.Name',
      countryKey: 'MainBlocks.ReviewsBlock.SecondReview.Country',
      textKey: 'MainBlocks.ReviewsBlock.SecondReview.Text',
    },
    {
      nameKey: 'MainBlocks.ReviewsBlock.ThirdReview.Name',
      countryKey: 'MainBlocks.ReviewsBlock.ThirdReview.Country',
      textKey: 'MainBlocks.ReviewsBlock.ThirdReview.Text',
    },
  ]

  return (
    <div className="relative flex flex-col w-full gap-6 md:gap-12">
      <p className="font-semibold md:font-bold">{t('Reviews')}</p>
      <Close
        className={`absolute md:hidden w-6 h-6 right-0 top-0 stroke-black cursor-pointer`}
      />
      <div
        className={`text-sm md:text-base transition-opacity duration-700 overflow-auto pr-5 ${
          opacity || ''
        }`}
      >
        {reviewData.map((review, index) => (
          <Review key={index} t={t} {...review} />
        ))}
      </div>
    </div>
  )
}
export default Reviews

function Review({ t, nameKey, countryKey, textKey }) {
  return (
    <div
      className="flex flex-col gap-2 md:gap-5 justify-center w-full p-5 mb-5 font-normal rounded-xl bg-th-secondary-100"
      onClick={(e) => e.stopPropagation()}
    >
      <div className="flex w-full justify-between">
        <p className="font-semibold md:font-bold text-base md:text-xl">{t(nameKey)}</p>
        <p>{t(countryKey)}</p>
      </div>
      <p>{t(textKey)}</p>
    </div>
  )
}
