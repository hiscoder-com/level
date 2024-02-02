import Checking from 'public/checking.svg'

function ChecksIcon({ levelCheck }) {
  const classes = {
    1: 'first-check',
    2: 'second-check',
    3: 'third-check',
  }
  const conditionalStyles = !levelCheck ? 'text-th-secondary-300' : 'text-th-primary-200'
  return (
    <div className={`${conditionalStyles} ${classes[levelCheck?.level]}`}>
      <Checking />
    </div>
  )
}

export default ChecksIcon
