function Questions({
  config: {
    config: { questions },
  },
}) {
  return (
    <ul className="space-y-2">
      {questions.map((question) => (
        <li key={question}>{question}</li>
      ))}
    </ul>
  )
}

export default Questions
