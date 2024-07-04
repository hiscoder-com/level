import { useEffect, useRef, useState } from 'react'

import { useRouter } from 'next/router'

import useSupabaseClient from 'utils/supabaseClient'

import { useAccess } from 'utils/hooks'
import { useCurrentUser } from 'lib/UserContext'

import Time from 'public/time.svg'
import Check from 'public/check.svg'

function Timer({ time }) {
  const supabase = useSupabaseClient()
  const { user } = useCurrentUser()
  const timer = useRef(null)
  const inputRef = useRef(null)
  const {
    query: { project, step },
  } = useRouter()
  const [{ isModeratorAccess }] = useAccess({
    user_id: user?.id,
    code: project,
  })
  const [currentTime, setCurrentTime] = useState(time)
  const [timeLeft, setTimeLeft] = useState(currentTime ? parseInt(currentTime) * 60 : 0)
  const [isChanging, setIsChanging] = useState(false)
  const [isCounting, setIsCounting] = useState(false)

  const getPadTime = (time) => time.toString().padStart(2, '0')
  const minutes = getPadTime(Math.floor(timeLeft / 60))
  const seconds = getPadTime(timeLeft - minutes * 60)

  useEffect(() => {
    setTimeLeft(currentTime ? parseInt(currentTime) * 60 : 0)
  }, [currentTime])

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
    setTimeLeft(currentTime ? parseInt(currentTime) * 60 : 0)
  }
  const handleChange = () => {
    setIsChanging((prev) => !prev)
  }
  const handleSave = async () => {
    setIsChanging((prev) => !prev)
    const res = await supabase.rpc('change_time_step', {
      project_code: project,
      step_num: step,
      time_count: currentTime ? parseInt(currentTime) : 0,
    })
    if (res.data) {
      setTimeLeft(currentTime ? parseInt(currentTime) * 60 : 0)
    }
  }
  const handleKeyDown = (event) => {
    if (event.key === 'Enter') {
      handleSave()
    }
  }
  useEffect(() => {
    if (time) {
      setCurrentTime(parseInt(time))
    }
  }, [time])

  const toggleTimer = () => {
    isCounting ? handleStop() : handleStart()
  }

  const onClickHandler = (event) => {
    clearTimeout(timer.current)
    if (event.detail === 1) {
      timer.current = setTimeout(toggleTimer, 200)
    } else if (event.detail === 2) {
      if (isModeratorAccess) {
        handleChange()
      }
    }
  }

  return (
    <div className="flex items-center gap-1 cursor-default">
      {isChanging ? (
        <>
          <Check onClick={handleSave} className="w-5" />
          <input
            className="max-w-[2.5em]"
            value={currentTime}
            onChange={(e) => {
              const value = e.target.value.replace(/\D/g, '')
              setCurrentTime(value)
            }}
            onKeyDown={handleKeyDown}
            ref={inputRef}
          />
        </>
      ) : (
        <>
          <Time onClick={handleReset} className="w-5 stroke-th-text-primary" />
          <div onClick={onClickHandler}>
            <span>{minutes}</span>
            <span className={isCounting ? 'separator' : ''}>:</span>
            <span>{seconds}</span>
          </div>
        </>
      )}
    </div>
  )
}

export default Timer
