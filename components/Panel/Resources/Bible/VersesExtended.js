import { useRecoilValue } from 'recoil'

import MarkdownExtended from 'components/MarkdownExtended'
import Blur from './Blur'

import { obsCheckAdditionalVerses } from 'utils/helper'
import { checkedVersesBibleState, isHideAllVersesState } from '../../../state/atoms'

function VersesExtended({
  verseObjects,
  handleSaveScroll,
  currentScrollVerse,
  toolName,
}) {
  const checkedVersesBible = useRecoilValue(checkedVersesBibleState)
  const isHideAllVerses = useRecoilValue(isHideAllVersesState)

  const isVerseChecked = (verse) => {
    const verseRange = String(verse).split('-').map(Number)
    const [start, end] = verseRange.length === 1 ? [verseRange[0], verseRange[0]] : verseRange

    return Array.from({ length: end - start + 1 }, (_, i) => start + i).some((v) =>
      checkedVersesBible.includes(String(v))
    )
  }

  return (
    <div className={isHideAllVerses ? 'bg-th-secondary-100 text-th-secondary-100' : ''}>
      {verseObjects?.map((verseObject) => {
        const checkedCurrent = isVerseChecked(verseObject.verse)
        return (
          <div
            key={verseObject.verse}
            onClick={() => handleSaveScroll(verseObject.verse)}
            className={`flex items-start my-3 select-none rounded-lg ${
              toolName + currentScrollVerse === toolName + verseObject.verse
                ? 'bg-th-secondary-100'
                : ''
            }`}
          >
            <div id={toolName + verseObject.verse} className={`ml-2`}>
              {obsCheckAdditionalVerses(verseObject.verse)}
            </div>
            {checkedCurrent ? (
              <Blur verse={verseObject.text} />
            ) : (
              <MarkdownExtended className="ml-2">{verseObject.text}</MarkdownExtended>
            )}
          </div>
        )
      })}
    </div>
  )
}

export default VersesExtended
