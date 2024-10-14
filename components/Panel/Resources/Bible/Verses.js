import { obsCheckAdditionalVerses } from 'utils/helper'
import MarkdownExtended from 'components/MarkdownExtended'

function Verses({ verseObjects, handleSaveScroll, currentScrollVerse, toolName }) {
  const idTool = `${toolName}_${currentScrollVerse}`
  const isCurrentVerse = (idTool, verse, idVerse) => {
    if (verse.includes('-')) {
      if (verse === currentScrollVerse) return true
      const [start, end] = verse.split('-').map(Number)
      return currentScrollVerse >= start && currentScrollVerse <= end
    } else {
      return idTool === idVerse
    }
  }
  return (
    <>
      {verseObjects?.map((verseObject) => {
        const idVerse = `${toolName}_${verseObject.verse}`
        return (
          <div
            key={verseObject.verse}
            id={idVerse}
            className={`p-2 rounded-lg ${
              isCurrentVerse(idTool, verseObject.verse, idVerse)
                ? 'bg-th-secondary-100'
                : ''
            }`}
            onClick={() => handleSaveScroll(String(verseObject.verse))}
          >
            <MarkdownExtended>
              {obsCheckAdditionalVerses(verseObject.verse) + ' ' + verseObject.text}
            </MarkdownExtended>
          </div>
        )
      })}
    </>
  )
}

export default Verses
