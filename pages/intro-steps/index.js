import { useRouter } from 'next/router'
import React from 'react'

function StartIntroPage() {
  const router = useRouter()
  return (
    <>
      <button
        onClick={() => {
          router.push('/intro-steps/1')
        }}
      >
        StartIntroPage
      </button>
    </>
  )
}

export default StartIntroPage
