import { Fragment, useEffect, useState } from 'react'

import { useRouter } from 'next/router'

import { Transition } from '@headlessui/react'
import { Toaster } from 'react-hot-toast'

import AppBar from 'components/AppBar'

import Progress from 'public/icons/progress.svg'

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
          isOpenSideBar || loadingPage ? 'h-[100vh] overflow-y-hidden' : ''
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
            <div className="absolute bottom-0 left-0 right-0 top-14 z-20 flex items-center justify-center overflow-y-hidden bg-black bg-opacity-70 sm:top-16">
              {loadingPage && (
                <Progress className="progress-custom-colors w-14 animate-spin stroke-th-primary-100" />
              )}
            </div>
          </Transition>
        </div>
        <main>
          <div className="mt-14 px-5 pt-5 sm:mt-auto lg:ms-10 lg:px-8 2xl:ms-0">
            {children}
          </div>
        </main>
      </div>
      <Toaster />
    </>
  )
}

export default Layout
