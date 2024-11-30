import ReactMarkdown from 'react-markdown'
import rehypeRaw from 'rehype-raw'
import remarkGfm from 'remark-gfm'

import 'github-markdown-css/github-markdown-light.css'

import TaContentInfo from './Panel/Resources/TAContentInfo'

function MarkdownExtended({ children, className, onLinkClick, config, setItem }) {
  const convertRcLinksToMarkdownLinks = (text) => {
    if (!config?.resource?.repo) return text
    const locale = config.resource.repo.split('_')[0]
    return text
      .replace(/\*\//g, locale + '/')
      .replace(/\[\[(rc:\/\/\S+?)\]\]/g, (_, url) => `[${url}](${url})`)
      .replace(/\[(\d+:\d+)\]\(\.\.\/\d+\/\d+\.md\)/g, (_, time) => time)
  }

  const content = convertRcLinksToMarkdownLinks(
    (typeof children === 'string' ? children : '')
      .replace(/< *br *\/?>/gi, '\n')
      .replaceAll('\\n', '\n')
  )

  const handleLinkClick = (href) => {
    if (href.endsWith('.md')) {
      onLinkClick?.(href)
    } else if (href.startsWith('rc://')) {
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

    const href = props?.node?.properties?.href
    if (href?.includes('translate') && href.includes('ta')) {
      return (
        <TaContentInfo
          href={href}
          onClick={handleLinkClick}
          config={config}
          setItem={setItem}
        >
          {props.children}
        </TaContentInfo>
      )
    }

    if (href?.includes('translate')) {
      return (
        <a
          href={href}
          onClick={(e) => {
            e.preventDefault()
            handleLinkClick(href)
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
