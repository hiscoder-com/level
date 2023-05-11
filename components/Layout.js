import { useState } from 'react'

import AppBar from 'components/AppBar'

function Layout({ backgroundColor, children }) {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <div
      className={`mx-auto min-h-screen ${backgroundColor} ${
        isOpen ? 'backdrop-blur-xl overflow-y-hidden h-[100vh]' : ''
      } `}
    >
      <AppBar setIsOpen={setIsOpen} isOpen={isOpen} />
      <div
        className={
          isOpen ? 'absolute top-16 left-0 bottom-0 right-0 backdrop-blur-xl z-10' : ''
        }
        onClick={() => setIsOpen(false)}
      ></div>
      <main>
        <div className="pt-5 px-5 lg:px-8">{children}</div>
      </main>
    </div>
  )
}

export default Layout
