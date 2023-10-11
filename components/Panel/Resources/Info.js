import { Placeholder } from '../UI'

import { useGetInfo } from 'utils/hooks'
import MarkdownExtended from 'components/MarkdownExtended'

function Info({ config, url }) {
  const { isLoading, data: intro } = useGetInfo({ config, url })

  return (
    <>
      {isLoading ? (
        <Placeholder />
      ) : (
        <div>
          <MarkdownExtended>{intro?.bookIntro}</MarkdownExtended>
          <hr className="my-10" />
          <MarkdownExtended>{intro?.chapterIntro}</MarkdownExtended>
        </div>
      )}
    </>
  )
}

export default Info
