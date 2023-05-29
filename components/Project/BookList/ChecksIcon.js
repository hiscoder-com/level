import Checking from '/public/checking.svg'

function ChecksIcon({ levelCheck }) {
  const classes = {
    1: ['first-check'],
    2: ['first-check', 'second-check'],
    3: ['first-check', 'second-check', 'third-check'],
  }

  return (
    <div className={`text-gray-400 ${classes[levelCheck?.level]?.join(' ')}`}>
      <Checking />
    </div>
  )
}

export default ChecksIcon
