import { useState } from 'react'

import AppBar from 'components/AppBar'
import SideBar from 'components/SideBar'

function Layout({ backgroundColor, children }) {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <div className={`mx-auto min-h-screen ${backgroundColor}`}>
      <AppBar setIsOpen={setIsOpen} />
      <SideBar isOpen={isOpen} setIsOpen={setIsOpen} />
      <main>
        <div className="pt-3 lg:pt-5 px-5 lg:px-8">{children}</div>
      </main>
    </div>
  )
}

export default Layout
