import Checking from '../../public/checking.svg'

function ChecksIcon({ checktype }) {
  const checks = ['first-check', 'second-check', 'third-check'].filter((el) => {
    switch (checktype) {
      case 'first-check':
        return ['first-check'].includes(el)
      case 'second-check':
        return ['first-check', 'second-check'].includes(el)
      case 'third-check':
        return ['first-check', 'second-check', 'third-check'].includes(el)
      default:
        break
    }
  })
  return (
    <div className={`text-gray-400 ${checks.join(' ')}`}>
      <Checking />
    </div>
  )
}

export default ChecksIcon
