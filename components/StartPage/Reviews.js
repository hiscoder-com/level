import Close from 'public/icons/close.svg'

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
    <div className="relative flex w-full flex-col gap-6 md:gap-12">
      <p className="font-semibold md:font-bold">{t('Reviews')}</p>
      <Close
        className={`absolute right-0 top-0 h-6 w-6 cursor-pointer stroke-black md:hidden`}
      />
      <div
        className={`overflow-auto pr-5 text-sm transition-opacity duration-700 md:text-base ${
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
      className="mb-5 flex w-full flex-col justify-center gap-2 rounded-xl bg-th-secondary-100 p-5 font-normal md:gap-5"
      onClick={(e) => e.stopPropagation()}
    >
      <div className="flex w-full justify-between">
        <p className="text-base font-semibold md:text-xl md:font-bold">{t(nameKey)}</p>
        <p>{t(countryKey)}</p>
      </div>
      <p>{t(textKey)}</p>
    </div>
  )
}
