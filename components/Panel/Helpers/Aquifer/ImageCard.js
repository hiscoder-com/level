import { getImageUrl } from 'utils/helper'

function ImageCard({ image, isInsideBigCarousel, cardSize, onClick }) {
  return (
    <div
      className={`flex-none rounded-md cursor-pointer ${
        isInsideBigCarousel
          ? 'mr-2'
          : 'relative mr-2.5 overflow-hidden bg-cover bg-center'
      }`}
      style={{
        width: `${cardSize}px`,
        height: `${cardSize * 0.62}px`,
        ...(isInsideBigCarousel
          ? {}
          : { backgroundImage: `url(${getImageUrl(image.url)})` }),
      }}
      onClick={onClick}
    >
      {isInsideBigCarousel ? (
        <>
          <div
            className="bg-cover bg-center rounded-md"
            style={{
              backgroundImage: `url(${getImageUrl(image.url)})`,
              paddingBottom: `${cardSize * 0.62}px`,
            }}
          />
          <div className="text-left text-sm mt-2 truncate text-th-secondary-10">
            {image.name}
          </div>
        </>
      ) : (
        <div className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-50 p-2">
          <div className="text-left text-sm truncate text-th-secondary-10">
            {image.name}
          </div>
        </div>
      )}
    </div>
  )
}

export default ImageCard
