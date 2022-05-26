import React, { useState } from 'react'
import AppBar from './AppBar'
import SideBar from './SideBar'
import Footer from './footer'

function LayoutBurgerFooter({ children }) {
  const [isOpen, setIsOpen] = useState(false)
  return isOpen ? (
    <div className="sm:ml-60 ml-0">
      <AppBar isOpen={isOpen} setIsOpen={setIsOpen} />
      <SideBar isOpen={isOpen} setIsOpen={setIsOpen} />
      <main>
        <div className="py-6 sm:px-6 lg:px-8">{children}</div>
      </main>
      <Footer />
    </div>
  ) : (
    <div className="mx-auto min-h-screen">
      <AppBar setIsOpen={setIsOpen} />
      <SideBar isOpen={isOpen} setIsOpen={setIsOpen} />
      <main>
        <div className="py-6 sm:px-6 lg:px-8">{children}</div>
      </main>
      <Footer />
    </div>
  )
}

export default LayoutBurgerFooter
