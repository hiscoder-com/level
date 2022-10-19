function BlindDraftTextarea({
  disabled = false,
  updateVerse,
  index,
  verseObject,
  defaultValue = '_'.repeat(50),
  onBlur,
}) {
  console.log(verseObject)

  return (
    <div
      key={index}
      contentEditable={!disabled}
      defaultValue={defaultValue}
      onInput={(el) => {
        console.log('onInput')
        updateVerse(index, el.target.innerText)
      }}
      onBlur={onBlur}
      value={verseObject.verse}
      className={`block w-full mx-3 focus:outline-none focus:inline-none focus:bg-white  ${
        verseObject.verse || disabled ? '' : 'bg-gray-300'
      }`}
    ></div>
  )
}

export default BlindDraftTextarea
