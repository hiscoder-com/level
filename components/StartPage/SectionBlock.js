import Link from 'next/link'
import Close from 'public/close.svg'

function SectionBlock({
  sectionKey,
  label,
  content,
  showSection,
  toggleSection,
  isLogo = false,
}) {
  const handleSectionToggle = () => {
    if (showSection) {
      toggleSection(sectionKey)
    } else {
      toggleSection(sectionKey)
    }
  }

  return (
    <div
      className={`relative p-5 bg-th-secondary-10 rounded-xl ${
        isLogo ? 'flex justify-center' : 'text-center'
      }`}
      onClick={handleSectionToggle}
    >
      {showSection ? content : isLogo ? label : <p>{label}</p>}
      <Close
        className={`absolute w-6 h-6 right-5 top-5 stroke-black cursor-pointer ${
          showSection ? '' : 'hidden'
        }`}
      />
      {showSection && (
        <Link
          href="/"
          className="absolute inset-0 z-10 cursor-pointer"
          onClick={(e) => e.stopPropagation()}
        ></Link>
      )}
    </div>
  )
}

export default SectionBlock
