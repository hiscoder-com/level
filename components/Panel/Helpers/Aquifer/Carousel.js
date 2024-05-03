import { useEffect, useRef, useState } from 'react'
import { useRecoilState } from 'recoil'
import Modal from 'components/Modal'
import FullSizeImageCarousel from './FullSizeImageCarousel'
import LoadMoreButton from './LoadMoreButton'
import { indexImageCarousel } from 'components/state/atoms'
import ArrowRight from 'public/folder-arrow-right.svg'

function Carousel({
  images,
  isShowLoadMoreButton,
  loadMore,
  isLoadingMore,
  insideBigCarousel = false,
}) {
  const [currentIndex, setCurrentIndex] = useRecoilState(indexImageCarousel)
  const [isOpenModal, setIsOpenModal] = useState(false)
  const containerRef = useRef(null)
  const containerWidth = useRef(null)
  const cardWidth = 144
  const lastIndex = images.length - 1
  const visibleCards = containerWidth.current
    ? Math.floor(containerWidth.current / cardWidth)
    : 0
  const maxVisibleIndex = lastIndex - visibleCards + 2

  const handlePrevClick = () => {
    setCurrentIndex((prevIndex) => (prevIndex === 0 ? 0 : prevIndex - 1))
  }

  const handleNextClick = () => {
    setCurrentIndex((prevIndex) => {
      if (prevIndex === maxVisibleIndex) {
        return prevIndex
      } else {
        return prevIndex + 1
      }
    })
  }

  useEffect(() => {
    if (containerRef.current && containerWidth.current === null) {
      containerWidth.current = containerRef.current.offsetWidth
    }
  }, [])

  useEffect(() => {
    if (containerRef.current) {
      const containerElement = containerRef.current

      containerElement.style.transform = `translateX(-${currentIndex * cardWidth}px)`
      containerElement.style.transition = 'transform 0.3s ease-in-out'
    }
  }, [currentIndex])

  return (
    <>
      <div className="relative overflow-hidden">
        <div className="flex pb-10" ref={containerRef}>
          {images.map((image, index) => (
            <div
              key={image.id}
              className="flex-none w-[134px] h-[83px] mr-2.5"
              onClick={() => {
                setCurrentIndex(index)
                if (!insideBigCarousel) {
                  setIsOpenModal(true)
                }
              }}
            >
              <img
                src={image.url}
                alt={image.name}
                className="w-[134px] h-[83px] rounded-[5px]"
              />
              <div
                className={`text-left text-sm mt-2.5 truncate ${
                  insideBigCarousel ? 'text-th-secondary-10' : 'text-th-text-primary'
                }`}
              >
                {image.name}
              </div>
            </div>
          ))}
          <LoadMoreButton
            isShowLoadMoreButton={isShowLoadMoreButton}
            loadMore={loadMore}
            isLoadingMore={isLoadingMore}
          />
        </div>

        <div className="flex justify-between">
          <button
            className="bg-th-text-primary text-th-secondary-10 font-bold p-3.5 rounded-full disabled:bg-th-secondary-100 disabled:text-gray-400 disabled:cursor-not-allowed"
            onClick={handlePrevClick}
            disabled={currentIndex === 0}
          >
            <ArrowRight className="stroke-2 rotate-180" />
          </button>
          <button
            className="bg-th-text-primary text-th-secondary-10 font-bold p-3.5 rounded-full disabled:bg-th-secondary-100 disabled:text-gray-400 disabled:cursor-not-allowed"
            onClick={handleNextClick}
            disabled={currentIndex === maxVisibleIndex || currentIndex === lastIndex}
          >
            <ArrowRight className="stroke-2" />
          </button>
        </div>
      </div>
      <Modal
        isOpen={isOpenModal}
        closeHandle={() => {
          setIsOpenModal(false)
        }}
        className={{
          main: 'z-50 relative',
          dialogTitle: 'text-center text-2xl font-medium leading-6',
          dialogPanel:
            'w-full max-w-5xl p-6 align-middle transform overflow-y-auto transition-all text-th-text-primary-100 rounded-3xl',
          transitionChild: 'fixed inset-0 bg-[#424242] bg-opacity-90',
          content:
            'inset-0 fixed flex items-center justify-center p-4 min-h-full  overflow-y-auto',
        }}
      >
        <FullSizeImageCarousel
          loadMore={loadMore}
          images={images}
          onClose={() => setIsOpenModal(false)}
          isShowLoadMoreButton={isShowLoadMoreButton}
          isLoadingMore={isLoadingMore}
        />
      </Modal>
    </>
  )
}

export default Carousel
