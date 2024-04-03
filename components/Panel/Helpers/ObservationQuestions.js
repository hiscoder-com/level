function ObservationQuestions() {
  const questions = [
    '- Switch to OBSERVATION QUESTIONS to note the details of the text. One reader should read aloud through the “tQUESTIONS” tab of each verse. The other team members should answer from the Literal-text (ULT).',
    '- The reader should add questions as necessary to ensure that at least one question is asked for each verse and interesting details are not missed.',
    '- Discuss any unclear or confusing parts of the text.',
  ]
  return (
    <div className="space-y-2">
      {questions.map((question) => (
        <p key={question}>{question}</p>
      ))}
    </div>
  )
}

export default ObservationQuestions
