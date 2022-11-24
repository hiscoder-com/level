import MarkdownExtended from 'components/MarkdownExtended'
import ReactMarkdown from 'react-markdown'
import Close from 'public/close.svg'

function TNTWLContent({ setItem, item }) {
  return (
    <div
      className={`absolute top-0 bottom-0 bg-white overflow-auto left-0 right-0 px-2 ${
        item ? '' : 'hidden'
      }`}
    >
      <div
        className="absolute top-0 right-0 w-8 pt-3 pr-3 cursor-pointer"
        onClick={() => setItem(null)}
      >
        <Close />
      </div>
      {!['intro', 'front'].includes(item?.title) && (
        <div className=" font-bold text-xl mb-2">
          <ReactMarkdown className="text-2xl mb-4">{item?.title}</ReactMarkdown>
        </div>
      )}
      <MarkdownExtended>{item?.text}</MarkdownExtended>
    </div>
  )
}
export default TNTWLContent
