import { Placeholder } from '../../UI'

import { useGetResource, useScroll } from 'utils/hooks'
import VersesExtended from './VersesExtended'
import Verses from './Verses'

function Bible({ config, url, toolName }) {
  const { isLoading, data } = useGetResource({
    config,
    url,
  })
  const { handleSaveScroll, currentScrollVerse } = useScroll({
    toolName,
    idPrefix: toolName,
    isLoading,
  })

  return (
    <>
      {isLoading ? (
        <Placeholder />
      ) : config?.config?.draft ? (
        <VersesExtended
          verseObjects={data?.verseObjects}
          handleSaveScroll={handleSaveScroll}
        />
      ) : (
        <Verses
          verseObjects={data?.verseObjects}
          handleSaveScroll={handleSaveScroll}
          currentScrollVerse={currentScrollVerse}
          toolName={toolName}
        />
      )}
    </>
  )
}

export default Bible
