import Loading from 'public/progress.svg'

function LoadMoreButton({
  loadMore,
  insideBigCarousel,
  t,
  cardSize,
  isLoadingMore = false,
}) {
  return (
    <button
      className={`flex-none ${
        insideBigCarousel ? 'py-1 px-2 text-xs' : 'py-2 px-4'
      } font-bold rounded-md cursor-pointer text-th-text-primary bg-th-secondary-200 hover:opacity-70`}
      onClick={loadMore}
      style={{
        width: `${cardSize}px`,
        height: `${cardSize * 0.62}px`,
      }}
    >
      {isLoadingMore ? (
        <Loading className="progress-custom-colors m-auto w-6 animate-spin stroke-th-primary-100 opacity-70" />
      ) : (
        <span>{t('LoadMore')}</span>
      )}
    </button>
  )
}
export default LoadMoreButton
