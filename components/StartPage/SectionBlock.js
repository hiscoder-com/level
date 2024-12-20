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
      className={`relative rounded-xl bg-th-secondary-10 p-5 ${
        isLogo ? 'flex justify-center' : 'text-center'
      }`}
      onClick={handleSectionToggle}
    >
      {showSection ? content : isLogo ? label : <p>{label}</p>}
      <Close
        onClick={handleCloseClick}
        className={`absolute right-5 top-5 h-6 w-6 cursor-pointer stroke-black ${
          showSection ? '' : 'hidden'
        }`}
      />
    </div>
  )
}

export default SectionBlock
