function ReflectionQuestions() {
  const questions = [
    'How does our increased understanding help change our thinking about God?',
    'What does God want me to do with this new understanding?',
    'Is there something He has shown me of which I need to repent?',
    'What area of my life must I submit to His Lordship?',
    'For what am I grateful to the Lord? In what can my heart rejoice? Express this to Him',
  ]
  return (
    <div className="space-y-2">
      {questions.map((question) => (
        <div key={question}>{question}</div>
      ))}
    </div>
  )
}

export default ReflectionQuestions
