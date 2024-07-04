import { useRecoilValue } from 'recoil'

import { indexImageCarousel } from 'components/state/atoms'
import Carousel from './Carousel'

import Close from 'public/close.svg'

function FullSizeImageCarousel({
  images,
  onClose,
  isShowLoadMoreButton,
  loadMore,
  isLoadingMore,
}) {
  const currentIndex = useRecoilValue(indexImageCarousel)

  return (
    <div className="w-full flex flex-col items-center justify-center">
      <div className="w-full">
        <div className="relative flex justify-center items-center">
          <h3 className="text-th-secondary-10">{images[currentIndex].name}</h3>
          <button
            onClick={onClose}
            className="absolute right-0 w-6 cursor-pointer bg-th-text-primary rounded-full p-1"
          >
            <Close className="stroke-th-secondary-10" />
          </button>
        </div>
      </div>
      <div className="max-w-full text-center flex flex-col justify-center items-center py-10">
        <img
          src={images[currentIndex].url}
          alt={`Slide ${currentIndex}`}
          className="mx-auto px-12 object-contain h-[60vh] w-auto"
        />
      </div>
      <div className="w-full">
        <Carousel
          images={images}
          isShowLoadMoreButton={isShowLoadMoreButton}
          loadMore={loadMore}
          isLoadingMore={isLoadingMore}
          cardSize={80}
          insideBigCarousel={true}
        />
      </div>
    </div>
  )
}
export default FullSizeImageCarousel
