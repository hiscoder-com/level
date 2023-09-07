import { useEffect, useState } from 'react'

import { Toaster } from 'react-hot-toast'

import AppBar from 'components/AppBar'
import Progress from 'public/progress.svg'
import { useRouter } from 'next/router'

function Layout({ backgroundColor, children }) {
  const [isOpenSideBar, setIsOpenSideBar] = useState(false)
  const [loadingPage, setLoadingPage] = useState(false)
  const router = useRouter()
  useEffect(() => {
    const handleStart = (url, { shallow }) => {
      if (!shallow) {
        setLoadingPage(true)
      }
    }

    router.events.on('routeChangeStart', handleStart)

    return () => {
      router.events.off('routeChangeStart', setLoadingPage(false))
    }
  }, [router])
  return (
    <>
      <div
        className={`mx-auto min-h-screen ${backgroundColor} ${
          isOpenSideBar || loadingPage ? 'overflow-y-hidden h-[100vh]' : ''
        } `}
      >
        <AppBar setIsOpenSideBar={setIsOpenSideBar} isOpenSideBar={isOpenSideBar} />
        <div
          className={
            isOpenSideBar || loadingPage
              ? 'absolute top-14 flex justify-center items-center left-0 bottom-0 right-0 bg-zinc-500 bg-opacity-10 backdrop-blur z-10 overflow-y-hidden transition-all duration-100'
              : ''
          }
          onClick={() => !loadingPage && setIsOpenSideBar(false)}
        >
          {loadingPage && <Progress className="w-14 animate-spin" />}
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
