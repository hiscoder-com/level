import React, { useState } from 'react'
import AppBar from './AppBar'
import Footer from './footer'
import SideBar from './SideBar'

function Layout({ children }) {
  const [isOpen, setIsOpen] = useState(false)

  return (
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

export default Layout
