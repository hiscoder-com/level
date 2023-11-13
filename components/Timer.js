import { useEffect, useState } from 'react'

import Time from 'public/time.svg'

function Timer({ time }) {
  const [timeLeft, setTimeLeft] = useState(parseInt(time) * 60)
  const [isCounting, setIsCounting] = useState(false)

  const getPadTime = (time) => time.toString().padStart(2, '0')
  const minutes = getPadTime(Math.floor(timeLeft / 60))
  const seconds = getPadTime(timeLeft - minutes * 60)

  useEffect(() => {
    setTimeLeft(parseInt(time) * 60)
  }, [time])

  useEffect(() => {
    const interval = setInterval(() => {
      isCounting && setTimeLeft((timeLeft) => (timeLeft >= 1 ? timeLeft - 1 : 0))
    }, 1000)
    if (timeLeft === 0) setIsCounting(false)
    return () => {
      clearInterval(interval)
    }
  }, [timeLeft, isCounting])

  const handleStart = () => {
    timeLeft != 0 ? setTimeLeft(timeLeft - 1) : setTimeLeft(parseInt(time) * 60)
    setIsCounting(true)
  }

  const handleStop = () => {
    setIsCounting(false)
  }

  const handleReset = () => {
    setIsCounting(false)
    setTimeLeft(parseInt(time) * 60)
  }

  return (
    <div className="flex items-center gap-1 cursor-default">
      <Time onClick={handleReset} className="w-5 stroke-th-text-primary" />
      <div onClick={isCounting ? handleStop : handleStart}>
        <span>{minutes}</span>
        <span className={isCounting ? 'separator' : ''}>:</span>
        <span>{seconds}</span>
      </div>
    </div>
  )
}

export default Timer
