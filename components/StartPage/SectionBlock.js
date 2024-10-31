import Link from 'next/link'
import { useRouter } from 'next/router'
import Close from 'public/icons/close.svg'

function SectionBlock({
  sectionKey,
  label,
  content,
  showSection,
  toggleSection,
  isLogo = false,
}) {
  const router = useRouter()

  const updateRoute = async () => {
    await router.replace('/', undefined, { shallow: true, scroll: false })
  }

  const handleSectionToggle = async () => {
    await updateRoute()
    toggleSection(sectionKey)
  }

  const handleCloseClick = async (e) => {
    e.stopPropagation()
    await updateRoute()
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
        onClick={handleCloseClick}
        className={`absolute w-6 h-6 right-5 top-5 stroke-black cursor-pointer ${
          showSection ? '' : 'hidden'
        }`}
      />
      {showSection && (
        <Link
          href="/"
          className="absolute z-10 cursor-pointer"
          onClick={(e) => e.stopPropagation()}
          scroll={false}
        ></Link>
      )}
    </div>
  )
}

export default SectionBlock
