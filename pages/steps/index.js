import { useRouter } from 'next/router'

function StartStepPage() {
  const router = useRouter()
  return (
    <button
      onClick={() => {
        router.push('/steps/1')
      }}
    ></button>
  )
}

export default StartStepPage
