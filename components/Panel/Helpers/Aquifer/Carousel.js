import { useEffect, useRef, useState } from 'react'

import Modal from 'components/Modal'
import { currentVerse, indexImageCarousel } from 'components/state/atoms'
import ArrowRight from 'public/folder-arrow-right.svg'
import Loading from 'public/progress.svg'
import Return from 'public/return.svg'
import { useTranslation } from 'react-i18next'
import { useRecoilState, useRecoilValue } from 'recoil'

import FullSizeImageCarousel from './FullSizeImageCarousel'
import ImageCard from './ImageCard'
import LoadMoreButton from './LoadMoreButton'

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
        <Loading className="progress-custom-colors right-2 m-auto w-6 animate-spin stroke-th-primary-100" />
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
                    className="rounded-full bg-th-text-primary p-3.5 font-bold text-th-secondary-10 disabled:cursor-not-allowed disabled:bg-th-secondary-100 disabled:text-th-secondary-300"
                    onClick={handlePrevClick}
                    disabled={currentIndex === 0 || images.length === 0}
                  >
                    <ArrowRight className="rotate-180 stroke-2" />
                  </button>
                  <button
                    className="rounded-full bg-th-text-primary p-3 font-bold text-th-secondary-10 disabled:cursor-not-allowed disabled:bg-th-secondary-100 disabled:text-th-secondary-300"
                    onClick={() => setCurrentIndex(0)}
                    disabled={currentIndex === 0 || images.length === 0}
                  >
                    <Return />
                  </button>
                  <button
                    className="rounded-full bg-th-text-primary p-3.5 font-bold text-th-secondary-10 disabled:cursor-not-allowed disabled:bg-th-secondary-100 disabled:text-th-secondary-300"
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
              main: 'relative z-50',
              dialogTitle: 'text-center text-2xl font-medium leading-6',
              dialogPanel:
                'text-th-text-primary-100 flex h-full w-full max-w-5xl transform overflow-y-auto rounded-3xl p-6 transition-all',
              transitionChild: 'fixed inset-0 bg-opacity-5 backdrop-brightness-50',
              content:
                'fixed inset-0 top-4 flex min-h-full items-center justify-center overflow-y-auto p-4',
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
