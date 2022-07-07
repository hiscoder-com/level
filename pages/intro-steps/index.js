import { useRouter } from 'next/router'
import React from 'react'
import IntroStep from '../../components/IntroStep'

function StartIntroPage() {
  const router = useRouter()
  return (
    <>
      <button
        onClick={() => {
          router.push('/intro/1')
        }}
      >
        StartIntroPage
      </button>
    </>
  )
}

export default StartIntroPage
