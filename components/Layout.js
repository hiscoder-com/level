import { Fragment, useEffect, useState } from 'react'

import { useRouter } from 'next/router'

import { Toaster } from 'react-hot-toast'

import { Transition } from '@headlessui/react'

import AppBar from 'components/AppBar'
import Progress from 'public/progress.svg'

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
        <div onClick={() => setIsOpenSideBar(false)}>
          <Transition
            as={Fragment}
            appear={true}
            show={isOpenSideBar || loadingPage}
            enter="transition-opacity duration-200"
            leave="transition-opacity duration-200"
          >
            <div className="absolute flex justify-center items-center top-14 sm:top-16 left-0 bottom-0 right-0 backdrop-brightness-90 backdrop-blur z-20 overflow-y-hidden">
              {loadingPage && (
                <Progress className="progress-custom-colors w-14 animate-spin stroke-th-primary-100" />
              )}
            </div>
          </Transition>
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
