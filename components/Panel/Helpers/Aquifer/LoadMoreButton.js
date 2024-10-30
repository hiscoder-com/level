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
        insideBigCarousel ? 'px-2 py-1 text-xs' : 'px-4 py-2'
      } cursor-pointer rounded-md bg-th-secondary-200 font-bold text-th-text-primary hover:opacity-70`}
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
