import { useState } from 'react'

import AppBar from 'components/AppBar'
import { Toaster } from 'react-hot-toast'

function Layout({ backgroundColor, children, hideAppbar }) {
  const [isOpenSideBar, setIsOpenSideBar] = useState(false)

  return (
    <>
      <div
        className={`mx-auto min-h-screen ${backgroundColor} ${
          isOpenSideBar
            ? 'backdrop-blur bg-gray-300 bg-opacity-25 overflow-y-hidden h-[100vh]'
            : ''
        } `}
      >
        <AppBar
          hideAppbar={hideAppbar}
          setIsOpenSideBar={setIsOpenSideBar}
          isOpenSideBar={isOpenSideBar}
        />
        <div
          className={
            isOpenSideBar
              ? 'absolute top-14 left-0 bottom-0 right-0 bg-gray-300 bg-opacity-25 backdrop-blur z-10 overflow-y-hidden'
              : ''
          }
          onClick={() => setIsOpenSideBar(false)}
        ></div>
        <main>
          <div className={`pt-5 px-5 lg:px-8 ${hideAppbar ? 'mt-0 ' : 'mt-14'} md:mt-14`}>
            {children}
          </div>
        </main>
      </div>
      <Toaster />
    </>
  )
}

export default Layout
