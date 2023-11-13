import { Fragment, useEffect, useState } from 'react'

import Link from 'next/link'

import LeftArrow from 'public/left.svg'

function Breadcrumbs({ links = [], full }) {
  const [arrowLink, setArrowLink] = useState('')
  const [isLoading, setIsLoading] = useState(true)
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
    <div className={full ? 'card bg-th-secondary-10' : ''}>
      <div className="flex flex-row items-center gap-2 overflow-x-auto whitespace-nowrap text-lg font-bold">
        {isLoading ? (
          <div role="status" className="w-full animate-pulse">
            <div className="flex flex-row">
              <div className="h-7 w-1/12 mr-4 bg-th-secondary-100 rounded-full"></div>
              <div className="h-7 w-5/12 mr-4 bg-th-secondary-100 rounded-full"></div>
              <div className="h-7 w-3/12 mr-4 bg-th-secondary-100 rounded-full"></div>
            </div>
          </div>
        ) : (
          <>
            <Link href={arrowLink}>
              <LeftArrow className="h-5 w-5 min-w-[1.25rem] text-th-primary-200 hover:opacity-70" />
            </Link>
            {links?.map((link, index) => (
              <Fragment key={index}>
                {index === links.length - 1 ? (
                  <h3 className="cursor-default">{link.title}</h3>
                ) : (
                  <Link href={link.href} className="text-th-primary-200 hover:opacity-70">
                    {link.title}
                  </Link>
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
