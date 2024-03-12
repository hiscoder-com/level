function ObservationQuestions() {
  const questions = [
    'a. Switch to the “First step” of V-CANA',
    'b. Each team member begins by reading the selected chapters silently to note the broad context Study the Text',
    '- Switch to OBSERVATION QUESTIONS to note the details of the text. One reader should read aloud through the “tQUESTIONS” tab of each verse. The other team members should answer from the Literal-text (ULT).',
    '- The reader should add questions as necessary to ensure that at least one question is asked for each verse and interesting details are not missed.',
    '- Discuss any unclear or confusing parts of the text.',
    '- Move to “TRANSLATION QUESTIONS” using the  “tQUESTIONS” tab and work through the chunks again. Consider each of the key terms/phrases listed for each chunk in the “tWORDS” tab. (Do not study the terms definitions at this point – that will be done prior to the oral practice translation).',
    '- Discuss unclear or confusing parts of the key terms/phrases.',
    '- Repeat this sequence until all chunks have been discussed through the selected chapters.',
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
