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
      className={`relative rounded-xl bg-th-secondary-10 p-5 ${
        isLogo ? 'flex justify-center' : 'text-center'
      }`}
      onClick={() => toggleSection(sectionKey)}
    >
      {showSection ? content : isLogo ? label : <p>{label}</p>}
      <Close
        className={`absolute right-5 top-5 h-6 w-6 cursor-pointer stroke-black ${
          showSection ? '' : 'hidden'
        }`}
      />
    </div>
  )
}

export default SectionBlock
