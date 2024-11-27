import ReactMarkdown from 'react-markdown'

import MarkdownExtended from 'components/MarkdownExtended'

import Back from 'public/icons/left.svg'

function TAContent({ item, setHref, config, goBack }) {
  const handleBackClick = () => {
    if (goBack) {
      goBack()
    }
  }

  return (
    <div
      className={`absolute bottom-0 left-0 right-0 top-0 z-10 bg-th-secondary-10 pr-2 ${
        item ? '' : 'hidden'
      }`}
    >
      <div className="flex h-full flex-col">
        <div className="sticky top-0 z-10 flex items-center bg-th-secondary-10 pb-4">
          <div
            className="mr-2.5 h-fit w-fit cursor-pointer rounded-full bg-th-secondary-100 p-1 hover:opacity-70"
            onClick={handleBackClick}
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

        <div className="flex-1 pb-4">
          <MarkdownExtended
            className="markdown-body"
            onLinkClick={setHref}
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
