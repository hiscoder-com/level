import ReactMarkdown from 'react-markdown'

function Blur({ verse }) {
  return (
    <ReactMarkdown className="ml-2 select-none rounded-lg bg-th-secondary-100 text-th-secondary-100">
      {verse}
    </ReactMarkdown>
  )
}

export default Blur
