import React from 'react'
import Resources from 'components/Resources'
import { useTranslation } from 'next-i18next'

function Workspace({ config, reference }) {
  const { t } = useTranslation()
  return (
    <div className="layout-step">
      {config.map((el, index) => {
        return (
          <div key={index} className={`layout-step-col lg:w-${el.size}/6`}>
            <div className="space-x-3 text-xs"></div>
            <Resources tools={el.tools} reference={reference} />
          </div>
        )
      })}
    </div>
  )
}

export default Workspace
