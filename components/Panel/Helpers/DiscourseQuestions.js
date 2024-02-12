function DiscourseQuestions() {
  const questions = ['Question1', 'Question2', 'Question3']
  return (
    <div className="space-y-2">
      {questions.map((question) => (
        <div key={question}>{question}</div>
      ))}
    </div>
  )
}

export default DiscourseQuestions
