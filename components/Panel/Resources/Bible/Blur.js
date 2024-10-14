import ReactMarkdown from 'react-markdown'

function Blur({ verse }) {
  return (
    <ReactMarkdown className="ml-2 bg-th-secondary-100 text-th-secondary-100 rounded-lg select-none">
      {verse}
    </ReactMarkdown>
  )
}

export default Blur
