import { useEffect, useState } from 'react'
import Loading from 'public/progress.svg'

const SwitchLoading = ({
  checked,
  onChange,
  id,
  backgroundColor = 'bg-th-secondary-100',
  disabled = false,
  withDelay = false,
  delayTime = 500,
}) => {
  const [switchState, setSwitchState] = useState('unchecked')

  useEffect(() => {
    if (checked) {
      setSwitchState('checked')
    } else {
      setSwitchState('unchecked')
    }
  }, [checked])

  const handleToggle = () => {
    if (!disabled) {
      if (switchState === 'unchecked') {
        setSwitchState('loading')
        if (withDelay) {
          setTimeout(() => {
            onChange(true)
          }, delayTime)
        } else {
          onChange(true)
            .then(() => {
              setSwitchState('checked')
            })
            .catch(() => {
              setSwitchState('unchecked')
            })
        }
      } else {
        setSwitchState('loading')
        if (withDelay) {
          setTimeout(() => {
            onChange(false)
          }, delayTime)
        } else {
          onChange(false)
            .then(() => {
              setSwitchState('unchecked')
            })
            .catch(() => {
              setSwitchState('checked')
            })
        }
      }
    }
  }

  const styles = {
    toggle: {
      bg: {
        unchecked: `${backgroundColor} w-12`,
        loading: `${backgroundColor} translate-x-2.5 w-7`,
        checked: 'bg-th-primary-100 w-12',
      },
      indicator: {
        unchecked: 'translate-x-1',
        loading: 'translate-x-1/2 right-1/2',
        checked: 'translate-x-6',
      },
    },
    loading: {
      unchecked: 'translate-x-0 opacity-0',
      loading: 'translate-x-2.5',
      checked: 'translate-x-5',
    },
  }

  return (
    <div className="flex items-center">
      <label
        htmlFor={id}
        className={`relative inline-flex items-center cursor-pointer ${
          disabled ? 'opacity-50 cursor-not-allowed' : ''
        }`}
      >
        <input
          type="checkbox"
          id={id}
          className="sr-only"
          checked={switchState === 'checked'}
          onClick={handleToggle}
          readOnly
          disabled={disabled}
        />
        <div className="relative inline-flex h-7 w-12 items-center">
          <div
            className={`h-7 rounded-full transition-all duration-300 ${styles.toggle.bg[switchState]}`}
          />
          <span
            className={`absolute h-5 w-5 rounded-full bg-th-secondary-10 transition-all duration-300 ${styles.toggle.indicator[switchState]}`}
          />
        </div>
        <div
          className={`absolute transition-all duration-300 ${styles.loading[switchState]}`}
        >
          <Loading
            className={`w-7 animate-spin stroke-th-primary-100 progress-custom-colors transition-all duration-300 ${
              switchState === 'loading' ? '' : 'opacity-0'
            }`}
          />
        </div>
      </label>
    </div>
  )
}

export default SwitchLoading
