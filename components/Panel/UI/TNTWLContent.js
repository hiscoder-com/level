import ReactMarkdown from 'react-markdown'

import MarkdownExtended from 'components/MarkdownExtended'

import Back from 'public/left.svg'

function TNTWLContent({ setItem, item }) {
  return (
    <div
      className={`absolute top-0 bottom-0 pr-2 bg-th-secondary-10 overflow-auto left-0 right-0 ${
        item ? '' : 'hidden'
      } z-10`}
    >
      <div className="sticky flex top-0 pb-4 bg-th-secondary-10">
        <div
          className="w-fit h-fit p-1 mr-2.5 cursor-pointer hover:opacity-70 rounded-full bg-th-secondary-100"
          onClick={() => setItem(null)}
        >
          <Back className="w-8 stroke-th-primary-200" />
        </div>
        {!['intro', 'front'].includes(item?.title) && (
          <div className="font-bold text-xl mt-1">
            <ReactMarkdown className="text-2xl bg-th-secondary-10">
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
