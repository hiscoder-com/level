import { useEffect, useState } from 'react'
import { getPadTime } from '../utils/hooks'
import Time from '../public/time.svg'


function Timer() {
	const [item, setItem] = useState('')
	const [timeLeft, setTimeLeft] = useState(item ? item : 60 * 60)
	const [isCounting, setIsCounting] = useState(false)

	const minutes = getPadTime(Math.floor(timeLeft / 60))

useEffect(() => {
	const interval = setInterval(() => {
		isCounting &&
		setTimeLeft((timeLeft) => (timeLeft >= 1 ? timeLeft - 1 : 0))}, 1000)
		if(timeLeft === 0) setIsCounting(false)
		return () => {
			clearInterval(interval)
		}
}, [timeLeft, isCounting])

useEffect(() => {
	localStorage.setItem('time left', timeLeft)
  setItem(localStorage.getItem('time left')) 
	console.log(item);
}, [timeLeft])

	const handleStart = () => {
		if(timeLeft === 0) setTimeLeft(60 * 60)
		setIsCounting(true)
	}

	const handleStop = () => {
		setIsCounting(false)
	}

	const handleReset = () => {
		setIsCounting(false)
		setTimeLeft(60 * 60)
	}


	return (
		<div className="flex row items-center gap-1 cursor-default">
			<Time onClick={handleReset} />
			<div onClick={handleStart}>
				<span>{minutes}</span>
				<span> мин</span>
			</div>
		</div>

	)
}

export default Timer
