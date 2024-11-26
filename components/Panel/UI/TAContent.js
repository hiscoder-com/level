import ReactMarkdown from 'react-markdown'

import MarkdownExtended from 'components/MarkdownExtended'

function TAContent({ item, setHref, config }) {
  const handleMdLinkClick = (href) => {
    if (setHref) {
      setHref(href)
    }
  }

  return (
    <div
      className={`absolute bottom-0 left-0 right-0 top-0 z-10 bg-th-secondary-10 pr-2 ${
        item ? '' : 'hidden'
      }`}
    >
      <div className="flex h-full flex-col">
        <div className="sticky top-0 flex bg-th-secondary-10 pb-4">
          {!['intro', 'front'].includes(item?.title) && (
            <div className="mt-1 text-xl font-bold">
              <ReactMarkdown className="bg-th-secondary-10 text-2xl">
                {item?.title}
              </ReactMarkdown>
            </div>
          )}
        </div>

        <div className="flex-1 pb-4">
          <MarkdownExtended
            className="markdown-body"
            onLinkClick={handleMdLinkClick}
            config={config}
            type={'topic_ta'}
          >
            {item?.text}
          </MarkdownExtended>
        </div>
      </div>
    </div>
  )
}

export default TAContent
