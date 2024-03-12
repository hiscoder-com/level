import Close from 'public/close.svg'

function SectionBlock({
  sectionKey,
  label,
  content,
  showSection,
  toggleSection,
  isLogo = false,
}) {
  return (
    <div
      className={`relative p-5 bg-th-secondary-10 rounded-xl ${
        isLogo ? 'flex justify-center' : 'text-center'
      }`}
      onClick={() => toggleSection(sectionKey)}
    >
      {showSection ? content : isLogo ? label : <p>{label}</p>}
      <Close
        className={`absolute w-6 h-6 right-5 top-5 stroke-black cursor-pointer ${
          showSection ? '' : 'hidden'
        }`}
      />
    </div>
  )
}

export default SectionBlock
