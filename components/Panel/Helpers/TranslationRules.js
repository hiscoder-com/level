function TranslationRules() {
  const questions = ['Rule 1', 'Rule 2', 'Rule 3', 'Rule 4', 'Rule 5']
  return (
    <div className="space-y-2">
      {questions.map((question) => (
        <div key={question}>{question}</div>
      ))}
    </div>
  )
}

export default TranslationRules
