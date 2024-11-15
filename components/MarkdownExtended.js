import ReactMarkdown from 'react-markdown'
import rehypeRaw from 'rehype-raw'
import remarkGfm from 'remark-gfm'

import 'github-markdown-css/github-markdown-light.css'

function MarkdownExtended({ children, className, onLinkClick }) {
  const content = (typeof children === 'string' ? children : '')
    .replace(/< *br *\/?>/gi, '\n')
    .replaceAll('\\n', '\n')

  const handleLinkClick = (href) => {
    if (href.endsWith('.md')) {
      onLinkClick?.(href)
    }
  }

  const parsingRef = (props) => {
    function getVideoID(userInput) {
      const res = userInput.match(
        /^.*(?:(?:youtu.be\/)|(?:v\/)|(?:\/u\/\w\/)|(?:embed\/)|(?:watch\?))\??v?=?([^#\&\?]*).*/
      )
      return res ? res[1] : false
    }

    if (props?.node?.properties?.href?.includes('translate')) {
      return (
        <a
          href={props.href}
          onClick={(e) => {
            e.preventDefault()
            handleLinkClick(props?.node?.properties?.href)
          }}
        >
          {props.children}
        </a>
      )
    }

    if (props.href.endsWith('.md')) {
      return (
        <a
          href={props.href}
          onClick={(e) => {
            e.preventDefault()
            handleLinkClick(props.href)
          }}
        >
          {props.children}
        </a>
      )
    }

    const youtubeId = getVideoID(props?.href)
    return youtubeId ? (
      <iframe
        src={`https://youtube.com/embed/${youtubeId}`}
        frameBorder="0"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        allowFullScreen
        style={{ width: '100%', aspectRatio: '16/9', outline: 'none' }}
      ></iframe>
    ) : (
      <span>{props.children}</span>
    )
  }

  return (
    <ReactMarkdown
      rehypePlugins={[rehypeRaw]}
      className={className}
      components={{
        a: parsingRef,
      }}
      remarkPlugins={[remarkGfm]}
    >
      {content}
    </ReactMarkdown>
  )
}

export default MarkdownExtended
