function TheologicalQuestions() {
  const questions = [
    'What do we learn about God’s character, nature and heart and His interaction with man?',
    'What do we learn about man’s character, nature and heart and his interaction with God?',
    'What do we learn about man’s sin problem, its effects, and the ultimate solution?',
  ]
  return (
    <div className="space-y-2">
      {questions.map((question) => (
        <div key={question}>{question}</div>
      ))}
    </div>
  )
}

export default TheologicalQuestions
