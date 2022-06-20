import { useState } from 'react'

import AppBar from './AppBar'
import SideBar from './SideBar'

function Layout({ backgroundColor, children }) {
  const [isOpen, setIsOpen] = useState(false)
  return (
    <div className={`mx-auto min-h-screen ${backgroundColor}`}>
      <AppBar isOpen={isOpen} setIsOpen={setIsOpen} />
      <SideBar isOpen={isOpen} setIsOpen={setIsOpen} />
      <main>
        <div className="py-6 sm:px-6 lg:px-8">{children}</div>
      </main>
    </div>
  )
}

export default Layout
