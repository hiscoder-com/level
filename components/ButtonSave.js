import Loading from 'public/progress.svg'

function ButtonSave({ children, onClick, isSaving }) {
  return (
    <button className="relative btn-primary w-fit" onClick={onClick} disabled={isSaving}>
      <span className={isSaving ? 'opacity-0' : 'opacity-100'}>{children}</span>
      {isSaving && (
        <Loading className="absolute mx-auto my-auto inset-0 w-6 animate-spin" />
      )}
    </button>
  )
}

export default ButtonSave
