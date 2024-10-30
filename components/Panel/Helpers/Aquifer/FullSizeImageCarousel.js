import { indexImageCarousel } from 'components/state/atoms'
import Close from 'public/close.svg'
import { useRecoilValue } from 'recoil'

import Carousel from './Carousel'

function FullSizeImageCarousel({
  images,
  onClose,
  isShowLoadMoreButton,
  loadMore,
  isLoadingMore,
}) {
  const currentIndex = useRecoilValue(indexImageCarousel)

  return (
    <div className="flex w-full flex-col items-center justify-center">
      <div className="w-full">
        <div className="relative flex items-center justify-center">
          <h3 className="text-th-secondary-10">{images[currentIndex].name}</h3>
          <button
            onClick={onClose}
            className="absolute right-0 w-6 cursor-pointer rounded-full bg-th-text-primary p-1"
          >
            <Close className="stroke-th-secondary-10" />
          </button>
        </div>
      </div>
      <div className="flex max-w-full flex-col items-center justify-center py-10 text-center">
        <img
          src={images[currentIndex].url}
          alt={`Slide ${currentIndex}`}
          className="mx-auto h-[60vh] w-auto object-contain px-12"
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
