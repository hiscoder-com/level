function DiscourseQuestions() {
  const questions = [
    '- Identify and discuss the major themes and ideas presented in the text',
    '- Make application and connections as appropriate to the church today',
    '- Review the brief summary of the book in the “GENERAL INFORMATION” tab',
  ]
  return (
    <div className="space-y-2">
      {questions.map((question) => (
        <div key={question}>{question}</div>
      ))}
    </div>
  )
}

export default DiscourseQuestions
