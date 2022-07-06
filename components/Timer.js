import { useEffect, useState } from 'react'
import { getPadTime } from '../utils/hooks'
import Time from '../public/time.svg'

function Timer({ time }) {
  const [timeLeft, setTimeLeft] = useState(time)
  const [isCounting, setIsCounting] = useState(false)

  const minutes = getPadTime(Math.floor(timeLeft / 60))
  const seconds = getPadTime(timeLeft - minutes * 60)

  useEffect(() => {
    const interval = setInterval(() => {
      isCounting && setTimeLeft((timeLeft) => (timeLeft >= 1 ? timeLeft - 1 : 0))
		    }, 1000)
    if (timeLeft === 0) setIsCounting(false)
    return () => {
      clearInterval(interval)
    }
  }, [timeLeft, isCounting])

  useEffect(() => {
    localStorage.setItem('time left', timeLeft)
  }, [timeLeft])

  const handleStart = () => {
    if (timeLeft === 0) setTimeLeft(time)
    setIsCounting(true)
  }

  const handleStop = () => {
    setIsCounting(false)
  }

  const handleReset = () => {
    setIsCounting(false)
    setTimeLeft(time)
  }

  return (
    <div className="flex row items-center gap-1 cursor-default">
      <Time onClick={handleReset} />
      <div onClick={isCounting ? handleStop : handleStart}>
        <span>{minutes}</span>
        <span>:</span>
        <span>{seconds}</span>
      </div>
    </div>
  )
}

export default Timer
