import { Disclosure } from '@headlessui/react'
import { Placeholder } from '../UI'

import { useGetResource } from 'utils/hooks'
import Down from 'public/arrow-down.svg'

function BibleWholeBook({ config, url }) {
  const { isLoading, data } = useGetResource({
    config: {
      resource: { ...config.mainResource, bookPath: config.resource.bookPath },
      reference: config.reference,
    },
    url,
  })
  return (
    <>
      {isLoading ? (
        <Placeholder />
      ) : (
        <div>
          <Accordion chapters={data?.data} />
        </div>
      )}
    </>
  )
}
export default BibleWholeBook

function Accordion({ chapters }) {
  return (
    <>
      {chapters?.length ? (
        chapters?.map((chapter) => (
          <div key={chapter.num}>
            <Disclosure>
              {({ open }) => (
                <>
                  <Disclosure.Button className={`flex gap-2`}>
                    <div>Chapter</div>
                    <div>{chapter.num}</div>
                  </Disclosure.Button>
                  <Disclosure.Panel>
                    <div className={open ? '' : ''}>
                      {chapter.verses
                        ?.filter((verse) => verse.num !== '0')
                        .map((verse) => (
                          // eslint-disable-next-line react/jsx-key
                          <div>
                            <Disclosure>
                              {({ open }) => (
                                <>
                                  <Disclosure.Button
                                    className={`flex gap-1 text-start ${open ? '' : ''}`}
                                  >
                                    <div>{verse.num}</div> <div>{verse.text}</div>
                                    <Down className="w-4 h-4 min-w-[1.5rem]" />
                                  </Disclosure.Button>
                                  <Disclosure.Panel className="border border-th-primary-100">
                                    <div className="flex bg-th-secondary-400 h-10 items-center justify-center ">
                                      <div className="w-1/4 text-center">TN</div>
                                      <div className="w-1/4 text-center">TQ</div>
                                      <div className="w-1/4 bg-th-primary-100 h-full text-th-secondary-10 text-center flex items-center justify-center">
                                        <div>TW</div>
                                      </div>
                                      <div className="w-1/4 text-center">UST</div>
                                    </div>

                                    <ul className=" p-1">
                                      <li>Sarah</li>
                                      <li>Sarah</li> <li>year</li> <li>year</li>{' '}
                                      <li>year</li>
                                      <li>year</li> <li>Sarah</li> <li>Sarah</li>
                                    </ul>
                                  </Disclosure.Panel>
                                </>
                              )}
                            </Disclosure>
                          </div>
                        ))}
                    </div>
                  </Disclosure.Panel>
                </>
              )}
            </Disclosure>
          </div>
        ))
      ) : (
        <div>loading</div>
      )}
    </>
  )
}
