import ReactMarkdown from 'react-markdown'

import rehypeRaw from 'rehype-raw'
import remarkGfm from 'remark-gfm'

import 'github-markdown-css/github-markdown-light.css'

function MarkdownExtended({ children, className }) {
  const content = (typeof children === 'string' ? children : '')
    .replace(/< *br *\/?>/gi, '\n')
    .replaceAll('\\n', '\n')

  const convertYoutube = (props) => {
    function getVideoID(userInput) {
      var res = userInput.match(
        /^.*(?:(?:youtu.be\/)|(?:v\/)|(?:\/u\/\w\/)|(?:embed\/)|(?:watch\?))\??v?=?([^#\&\?]*).*/
      )
      if (res) return res[1]
      return false
    }
    const youtubeId = getVideoID(props?.href)
    return youtubeId ? (
      <iframe
        src={`https://youtube.com/embed/${youtubeId}`}
        frameBorder="0"
        allow="accelerometer;autoplay;clipboard-write;encrypted-media;gyroscope;picture-in-picture"
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
        a: convertYoutube,
      }}
      remarkPlugins={[remarkGfm]}
    >
      {content}
    </ReactMarkdown>
  )
}

export default MarkdownExtended
