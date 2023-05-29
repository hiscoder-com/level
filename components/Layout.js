import { useState } from 'react'

import AppBar from 'components/AppBar'

function Layout({ backgroundColor, children }) {
  const [isOpenSideBar, setIsOpenSideBar] = useState(false)

  return (
    <div
      className={`mx-auto min-h-screen ${backgroundColor} ${
        isOpenSideBar
          ? 'backdrop-blur bg-gray-300 bg-opacity-25 overflow-y-hidden h-[100vh]'
          : ''
      } `}
    >
      <AppBar setIsOpenSideBar={setIsOpenSideBar} isOpenSideBar={isOpenSideBar} />
      <div
        className={
          isOpenSideBar
            ? 'absolute top-14 left-0 bottom-0 right-0 bg-gray-300 bg-opacity-25 backdrop-blur z-10 overflow-y-hidden'
            : ''
        }
        onClick={() => setIsOpenSideBar(false)}
      ></div>
      <main>
        <div className="pt-5 px-5 lg:px-8 mt-14 sm:mt-auto">{children}</div>
      </main>
    </div>
  )
}

export default Layout
