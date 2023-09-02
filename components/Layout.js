import { useState } from 'react'

import { Toaster } from 'react-hot-toast'

import { useRecoilValue } from 'recoil'

import AppBar from 'components/AppBar'
import { isSwitchingPageState } from './state/atoms'
import Progress from 'public/progress.svg'

function Layout({ backgroundColor, children }) {
  const [isOpenSideBar, setIsOpenSideBar] = useState(false)
  const isSwitchingPage = useRecoilValue(isSwitchingPageState)
  return (
    <>
      <div
        className={`mx-auto min-h-screen ${backgroundColor} ${
          isOpenSideBar || isSwitchingPage
            ? 'backdrop-blur bg-gray-300 bg-opacity-25 overflow-y-hidden h-[100vh]'
            : ''
        } `}
      >
        <AppBar setIsOpenSideBar={setIsOpenSideBar} isOpenSideBar={isOpenSideBar} />
        <div
          className={
            isOpenSideBar || isSwitchingPage
              ? 'absolute top-14 flex justify-center items-center left-0 bottom-0 right-0 bg-gray-300 bg-opacity-25 backdrop-blur z-10 overflow-y-hidden'
              : ''
          }
          onClick={() => !isSwitchingPage && setIsOpenSideBar(false)}
        >
          {isSwitchingPage && <Progress className="w-14 animate-spin" />}
        </div>
        <main>
          <div className="pt-5 px-5 lg:px-8 mt-14 sm:mt-auto">{children}</div>
        </main>
      </div>
      <Toaster />
    </>
  )
}

export default Layout
