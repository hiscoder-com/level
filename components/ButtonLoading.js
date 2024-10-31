import Loading from 'public/icons/progress.svg'

function ButtonLoading({
  isLoading,
  disabled,
  className = 'relative btn-primary w-fit',
  ...props
}) {
  return (
    <button className={className} disabled={isLoading || disabled} {...props}>
      <span className={isLoading ? 'opacity-0' : 'opacity-100'}>{props.children}</span>
      {isLoading && (
        <Loading className="progress-custom-colors absolute inset-0 mx-auto my-auto w-6 animate-spin stroke-th-primary-100" />
      )}
    </button>
  )
}

export default ButtonLoading
