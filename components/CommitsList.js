import { useEffect, useMemo, useState } from 'react'

import { useCurrentUser } from 'lib/UserContext'
import { useMethod } from 'utils/hooks'

function CommitsList({ methodId, setResourcesUrl, resourcesUrl }) {
  const [customResources, setCustomResources] = useState('')

  const { user } = useCurrentUser()
  const [methods] = useMethod(user?.access_token)

  useEffect(() => {
    if (methods && methodId) {
      const selectedMethod = methods.find(
        (el) => el.id.toString() === methodId.toString()
      )

      if (selectedMethod) {
        setCustomResources(selectedMethod.resources)
      }
    }
  }, [methodId, methods])

  const setResources = useMemo(() => {
    const listOfResources = []
    for (const resource in customResources) {
      if (Object.hasOwnProperty.call(customResources, resource)) {
        const isPrimary = customResources[resource]
        listOfResources.push(
          <div className="flex gap-7 items-center" key={resource}>
            <div className={`w-1/2 sm:w-1/6 ${isPrimary ? 'font-bold' : ''}`}>
              {resource}:
            </div>
            <input
              className={`w-5/6 p-2 rounded-lg bg-white text-slate-900 border ${
                resourcesUrl?.[resource] ? 'border-slate-900' : 'border-blue-200'
              } placeholder-blue-200 focus:border-slate-900 focus:outline-none`}
              value={resourcesUrl?.[resource] ?? ''}
              onChange={(e) =>
                setResourcesUrl((prev) => ({ ...prev, [resource]: e.target.value }))
              }
            />
          </div>
        )
      }
    }
    return listOfResources.sort((a, b) => a.key.localeCompare(b.key))
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [customResources, resourcesUrl])

  return <div className="flex flex-col gap-2 text-lg">{setResources}</div>
}

export default CommitsList
