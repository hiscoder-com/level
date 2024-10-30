import MarkdownExtended from 'components/MarkdownExtended'
import Back from 'public/left.svg'
import ReactMarkdown from 'react-markdown'

function TNTWLContent({ setItem, item }) {
  return (
    <div
      className={`absolute bottom-0 left-0 right-0 top-0 overflow-auto bg-th-secondary-10 pr-2 ${
        item ? '' : 'hidden'
      } z-10`}
    >
      <div className="sticky top-0 flex bg-th-secondary-10 pb-4">
        <div
          className="mr-2.5 h-fit w-fit cursor-pointer rounded-full bg-th-secondary-100 p-1 hover:opacity-70"
          onClick={() => setItem(null)}
        >
          <Back className="w-8 stroke-th-primary-200" />
        </div>
        {!['intro', 'front'].includes(item?.title) && (
          <div className="mt-1 text-xl font-bold">
            <ReactMarkdown className="bg-th-secondary-10 text-2xl">
              {item?.title}
            </ReactMarkdown>
          </div>
        )}
      </div>

      <MarkdownExtended className="markdown-body">{item?.text}</MarkdownExtended>
    </div>
  )
}
export default TNTWLContent
