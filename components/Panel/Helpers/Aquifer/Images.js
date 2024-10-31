import { useRecoilValue } from 'recoil'

import { currentVerse } from '../../../state/atoms'
import Carousel from './Carousel'

import { useGetAquiferResources } from 'utils/hooks'

function Images({ resourceType, reference, languageCode, query, isShowAllChapter }) {
  const verse = useRecoilValue(currentVerse)

  const { resources, loadMore, isShowLoadMoreButton, isLoadingMore, isLoading } =
    useGetAquiferResources({
      book_code: reference.book,
      chapter_num: isShowAllChapter ? 0 : reference.chapter,
      verse_num: isShowAllChapter ? 0 : verse,
      query,
      language_code: languageCode,
      resource_type: resourceType,
    })

  return (
    <>
      <Carousel
        images={resources}
        isShowLoadMoreButton={isShowLoadMoreButton}
        loadMore={loadMore}
        isLoadingMore={isLoadingMore}
        isLoading={isLoading}
        query={query}
        isShowAllChapter={isShowAllChapter}
      />
    </>
  )
}
export default Images
