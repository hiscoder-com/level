import { useState } from 'react'

import AppBarStart from './AppBarStart'

function LayoutStart({ children }) {
  const [bgBlue, setBgBlue] = useState(false)
  return bgBlue ? (
    <div className="mx-auto min-h-screen">
      <AppBarStart />
      <main>
        <div className="py-6 sm:px-6 lg:px-8 bg-blue-150">{children}</div>
      </main>
    </div>
  ) : (
    <div className="mx-auto min-h-screen">
      <AppBarStart />
      <main>
        <div className="py-6 sm:px-6 lg:px-8">{children}</div>
      </main>
    </div>
  )
}

export default LayoutStart
