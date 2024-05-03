import Loading from 'public/progress.svg'

const LoadMoreButton = ({ loadMore, isShowLoadMoreButton, isLoadingMore = false }) => {
  return (
    <div className="flex-none w-[134px] h-[83px] mr-2.5 bg-gray-200 hover:bg-gray-300 rounded-[5px] flex items-center justify-center">
      <button
        className="text-gray-800 font-bold py-2 px-4 rounded"
        onClick={loadMore}
        disabled={!isShowLoadMoreButton}
      >
        {isLoadingMore ? (
          <Loading className="progress-custom-colors m-auto w-6 animate-spin stroke-th-primary-100 opacity-70" />
        ) : (
          <span>Подгрузить еще</span>
        )}
      </button>
      {/* TODO:добавить перевод*/}
    </div>
  )
}
export default LoadMoreButton
