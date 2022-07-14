import { useState } from 'react'

import AppBar from './AppBar'
import SideBar from './SideBar'

function Layout({ backgroundColor, children }) {
  const [isOpen, setIsOpen] = useState(false)
  const [isIntroduction, setIsIntroduction] = useState(true)
  return (
    <div className={`mx-auto min-h-screen ${backgroundColor}`}>
      <AppBar
        isOpen={isOpen}
        setIsOpen={setIsOpen}
        isIntroduction={isIntroduction}
        setIsIntroduction={setIsIntroduction}
      />
      <SideBar isOpen={isOpen} setIsOpen={setIsOpen} />
      <main>
        <div className="pt-6 sm:p-6 lg:px-8">{children}</div>
      </main>
    </div>
  )
}

export default Layout
