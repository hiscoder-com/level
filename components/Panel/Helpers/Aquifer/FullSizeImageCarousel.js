import { useRecoilValue } from 'recoil'
import Carousel from './Carousel'
import Close from 'public/close.svg'
import { indexImageCarousel } from 'components/state/atoms'

function FullSizeImageCarousel({
  images,
  onClose,
  isShowLoadMoreButton,
  loadMore,
  isLoadingMore,
}) {
  const currentIndex = useRecoilValue(indexImageCarousel)
  return (
    <div className="relative w-full flex items-center justify-center">
      <div className="mb-4 absolute top-0 w-full">
        <div className="relative flex justify-center items-center">
          <h3 className="text-th-secondary-10">{images[currentIndex].name}</h3>
          <button
            onClick={onClose}
            className="absolute right-14 w-5  cursor-pointer bg-th-text-primary rounded-full p-1"
          >
            <Close className="stroke-th-secondary-10" />
          </button>
        </div>
      </div>
      <div className="max-w-full h-[70vh] text-center flex flex-col justify-center items-center py-10">
        <img
          src={images[currentIndex].url}
          alt={`Slide ${currentIndex}`}
          className="mx-auto px-12 object-contain h-full w-auto"
        />
      </div>
      <div className="absolute bottom-0 flex w-full justify-around">
        <Carousel
          images={images}
          isShowLoadMoreButton={isShowLoadMoreButton}
          loadMore={loadMore}
          isLoadingMore={isLoadingMore}
          insideBigCarousel
        />
      </div>
    </div>
  )
}
export default FullSizeImageCarousel
