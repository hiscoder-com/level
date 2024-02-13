function Reviews({ t, opacity }) {
  const reviewData = [
    {
      nameKey: 'mainBlocks.ReviewsBlock.FirstReview.Name',
      countryKey: 'mainBlocks.ReviewsBlock.FirstReview.Country',
      textKey: 'mainBlocks.ReviewsBlock.FirstReview.Text',
    },
    {
      nameKey: 'mainBlocks.ReviewsBlock.SecondReview.Name',
      countryKey: 'mainBlocks.ReviewsBlock.SecondReview.Country',
      textKey: 'mainBlocks.ReviewsBlock.SecondReview.Text',
    },
    {
      nameKey: 'mainBlocks.ReviewsBlock.ThirdReview.Name',
      countryKey: 'mainBlocks.ReviewsBlock.ThirdReview.Country',
      textKey: 'mainBlocks.ReviewsBlock.ThirdReview.Text',
    },
  ]

  return (
    <div className="flex flex-col w-full gap-6 md:gap-12">
      <p>{t('Reviews')}</p>
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
      className="flex flex-col gap-5 justify-center w-full p-5 mb-5 font-normal rounded-xl bg-th-secondary-100"
      onClick={(e) => e.stopPropagation()}
    >
      <div className="flex w-full justify-between">
        <p className="font-bold text-base md:text-xl">{t(nameKey)}</p>
        <p>{t(countryKey)}</p>
      </div>
      <p>{t(textKey)}</p>
    </div>
  )
}
