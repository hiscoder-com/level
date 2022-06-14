import React from 'react'
import AppBarStart from './AppBarStart'
import Footer from './footer'

function LayoutStartFooter({ children }) {
  return (
    <div className="mx-auto min-h-screen">
      <AppBarStart />
      <main>
        <div className="py-6 bg-blue-150 sm:px-6 lg:px-8">{children}</div>
      </main>
      <Footer />
    </div>
  )
}

export default LayoutStartFooter
