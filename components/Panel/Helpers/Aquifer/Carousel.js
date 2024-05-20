import { useEffect, useRef, useState } from 'react'

import { useTranslation } from 'react-i18next'
import { useRecoilState, useRecoilValue } from 'recoil'

import Modal from 'components/Modal'
import { currentVerse, indexImageCarousel } from 'components/state/atoms'
import FullSizeImageCarousel from './FullSizeImageCarousel'
import ImageCard from './ImageCard'
import LoadMoreButton from './LoadMoreButton'

import ArrowRight from 'public/folder-arrow-right.svg'
import Loading from 'public/progress.svg'
import Return from 'public/return.svg'

function Carousel({
  images,
  isShowLoadMoreButton,
  loadMore,
  isLoadingMore,
  isLoading,
  query,
  isShowAllChapter,
  insideBigCarousel = false,
  cardSize = 134,
}) {
  const { t } = useTranslation('common')
  const verse = useRecoilValue(currentVerse)
  const [currentIndex, setCurrentIndex] = useRecoilState(indexImageCarousel)
  const [maxVisibleIndex, setMaxVisibleIndex] = useState(0)
  const [isOpenModal, setIsOpenModal] = useState(false)
  const containerRef = useRef(null)
  const containerWidth = useRef(null)
  const lastIndex = images.length - 1
  const imagesGap = insideBigCarousel ? 8 : 10

  const handlePrevClick = () => {
    setCurrentIndex((prevIndex) => (prevIndex === 0 ? 0 : prevIndex - 1))
  }

  const handleNextClick = () => {
    setCurrentIndex((prevIndex) => {
      if (insideBigCarousel || prevIndex < maxVisibleIndex) {
        return prevIndex + 1
      } else {
        return prevIndex
      }
    })
  }

  useEffect(() => {
    !insideBigCarousel && setCurrentIndex(0)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [query, isShowAllChapter, verse])

  useEffect(() => {
    if (containerRef.current && containerWidth.current === null) {
      containerWidth.current = containerRef.current.offsetWidth
    }

    const calculatedVisibleCards = containerWidth.current
      ? Math.floor(containerWidth.current / (cardSize + imagesGap))
      : 0

    let calculatedMaxVisibleIndex = lastIndex

    if (calculatedVisibleCards < images.length) {
      calculatedMaxVisibleIndex =
        lastIndex - calculatedVisibleCards + (isShowLoadMoreButton ? 2 : 1)
    } else {
      calculatedMaxVisibleIndex = currentIndex
    }

    setMaxVisibleIndex(calculatedMaxVisibleIndex)
  }, [images, currentIndex, lastIndex, cardSize, imagesGap, isShowLoadMoreButton])

  useEffect(() => {
    if (containerRef.current) {
      const containerElement = containerRef.current

      containerElement.style.transform = `translateX(-${
        currentIndex * (cardSize + imagesGap)
      }px)`
      containerElement.style.transition = 'transform 0.3s ease-in-out'
    }
  }, [currentIndex, cardSize, imagesGap])

  return (
    <>
      {isLoading && !images?.length ? (
        <Loading className="progress-custom-colors m-auto w-6 animate-spin stroke-th-primary-100 right-2" />
      ) : (
        <>
          <div className="relative overflow-hidden">
            {images.length === 0 ? (
              <div className="text-center text-th-text-primary">{t('NoContent')}</div>
            ) : (
              <>
                <div
                  className={`flex ${insideBigCarousel ? 'pb-10' : 'pb-3.5'}`}
                  ref={containerRef}
                >
                  {images.map((image, index) => (
                    <ImageCard
                      key={image.id}
                      image={image}
                      isInsideBigCarousel={insideBigCarousel}
                      cardSize={cardSize}
                      onClick={() => {
                        setCurrentIndex(index)
                        if (!insideBigCarousel) {
                          setIsOpenModal(true)
                        }
                      }}
                    />
                  ))}

                  {images.length !== 0 && isShowLoadMoreButton && (
                    <LoadMoreButton
                      loadMore={loadMore}
                      isLoadingMore={isLoadingMore}
                      cardSize={insideBigCarousel ? 80 : 134}
                      insideBigCarousel={insideBigCarousel}
                      t={t}
                    />
                  )}
                </div>

                <div
                  className={`flex ${
                    insideBigCarousel ? 'justify-center gap-5' : 'justify-between'
                  }`}
                >
                  <button
                    className="bg-th-text-primary text-th-secondary-10 font-bold p-3.5 rounded-full disabled:bg-th-secondary-100 disabled:text-th-secondary-300 disabled:cursor-not-allowed"
                    onClick={handlePrevClick}
                    disabled={currentIndex === 0 || images.length === 0}
                  >
                    <ArrowRight className="stroke-2 rotate-180" />
                  </button>
                  <button
                    className="bg-th-text-primary text-th-secondary-10 font-bold p-3 rounded-full disabled:bg-th-secondary-100 disabled:text-th-secondary-300 disabled:cursor-not-allowed"
                    onClick={() => setCurrentIndex(0)}
                    disabled={currentIndex === 0 || images.length === 0}
                  >
                    <Return />
                  </button>
                  <button
                    className="bg-th-text-primary text-th-secondary-10 font-bold p-3.5 rounded-full disabled:bg-th-secondary-100 disabled:text-th-secondary-300 disabled:cursor-not-allowed"
                    onClick={handleNextClick}
                    disabled={
                      (!insideBigCarousel && currentIndex === maxVisibleIndex) ||
                      currentIndex === lastIndex ||
                      images.length === 0
                    }
                  >
                    <ArrowRight className="stroke-2" />
                  </button>
                </div>
              </>
            )}
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
                'w-full h-full flex max-w-5xl p-6 transform overflow-y-auto transition-all text-th-text-primary-100 rounded-3xl',
              transitionChild: 'fixed inset-0 bg-opacity-5 backdrop-brightness-50',
              content:
                'inset-0 top-4 fixed flex items-center justify-center p-4 min-h-full overflow-y-auto',
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
      )}
    </>
  )
}

export default Carousel
