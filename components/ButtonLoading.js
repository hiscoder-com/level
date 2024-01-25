import Loading from 'public/progress.svg'

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
        <Loading className="progress-custom-colors absolute mx-auto my-auto inset-0 w-6 animate-spin stroke-th-primary-100" />
      )}
    </button>
  )
}

export default ButtonLoading
