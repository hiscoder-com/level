import ReactMarkdown from 'react-markdown'

import MarkdownExtended from 'components/MarkdownExtended'

import Back from 'public/left.svg'

function TNTWLContent({ setItem, item }) {
  return (
    <div
      className={`absolute top-0 bottom-0 bg-th-secondary-10 overflow-auto left-0 right-0 px-2 pt-8 ${
        item ? '' : 'hidden'
      } z-10`}
    >
      <div
        className="absolute flex top-0 right-0 w-12 pr-4 cursor-pointer"
        onClick={() => setItem(null)}
      >
        <Back className="stroke-th-text-primary" />
      </div>
      {!['intro', 'front'].includes(item?.title) && (
        <div className=" font-bold text-xl mb-2">
          <ReactMarkdown className="text-2xl mb-4 bg-th-secondary-10">
            {item?.title}
          </ReactMarkdown>
        </div>
      )}
      <MarkdownExtended className="markdown-body">{item?.text}</MarkdownExtended>
    </div>
  )
}
export default TNTWLContent
