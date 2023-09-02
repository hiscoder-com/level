import { Fragment, useEffect, useState } from 'react'

import { useRouter } from 'next/router'

import { useSetRecoilState } from 'recoil'

import LeftArrow from 'public/left.svg'
import { isSwitchingPageState } from 'components/state/atoms'

function Breadcrumbs({ links = [], full }) {
  const { push } = useRouter()
  const [arrowLink, setArrowLink] = useState('')
  const [isLoading, setIsLoading] = useState(true)
  const setSwitchingPage = useSetRecoilState(isSwitchingPageState)

  useEffect(() => {
    if (links.length > 0) {
      const _arrowLink = links.length > 1 ? links[links.length - 2]?.href : links[0]?.href
      setArrowLink(_arrowLink)
    }
  }, [links])
  useEffect(() => {
    if (links.length > 0) {
      const _isLoading = links.filter((el) => el.title === undefined).length > 0
      setIsLoading(_isLoading)
    }
  }, [links])
  return (
    <div className={full ? 'card' : ''}>
      <div className="flex flex-row items-center gap-2 overflow-x-auto whitespace-nowrap text-lg font-bold">
        {isLoading ? (
          <div role="status" className="w-full animate-pulse">
            <div className="flex flex-row">
              <div className="h-7 w-1/12 mr-4 bg-gray-200 rounded-full"></div>
              <div className="h-7 w-5/12 mr-4 bg-gray-200 rounded-full"></div>
              <div className="h-7 w-3/12 mr-4 bg-gray-200 rounded-full"></div>
            </div>
          </div>
        ) : (
          <>
            <button
              onClick={() => {
                setSwitchingPage(true)
                setTimeout(() => {
                  push(arrowLink)
                }, 500)
              }}
            >
              <LeftArrow className="h-5 w-5 min-w-[1.25rem] hover:text-gray-500" />
            </button>
            {links?.map((link, index) => (
              <Fragment key={index}>
                {index === links.length - 1 ? (
                  <h3 className="cursor-default">{link.title}</h3>
                ) : (
                  <button
                    onClick={() => {
                      setSwitchingPage(true)
                      setTimeout(() => {
                        push(link.href)
                      }, 500)
                    }}
                    className="hover:text-gray-500"
                  >
                    {link.title}
                  </button>
                )}
                {index !== links.length - 1 && <span>/</span>}
              </Fragment>
            ))}
          </>
        )}
      </div>
    </div>
  )
}

export default Breadcrumbs
