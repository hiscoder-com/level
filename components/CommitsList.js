import { useCurrentUser } from 'lib/UserContext'
import React, { useEffect, useMemo, useState } from 'react'
import { useMethod } from 'utils/hooks'

function CommitsList({ methodId, setResourcesUrl, resourcesUrl }) {
  const { user } = useCurrentUser()

  const [customResources, setCustomResources] = useState('')
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
          <div
            className={`flex justify-between ${isPrimary ? 'bg-slate-400' : ''}`}
            key={resource}
          >
            {resource}:{' '}
            <input
              className="max-w-sm input"
              value={resourcesUrl?.[resource] ?? ''}
              onChange={(e) =>
                setResourcesUrl((prev) => ({ ...prev, [resource]: e.target.value }))
              }
            />
          </div>
        )
      }
    }
    return listOfResources
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [customResources, resourcesUrl])
  return <div className="max-w-xl">{setResources}</div>
}

export default CommitsList
