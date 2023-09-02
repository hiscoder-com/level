import Loading from 'public/progress.svg'

function ButtonSave({ children, onClick, isSaving }) {
  return (
    <button className="btn-primary w-fit" onClick={onClick} disabled={isSaving}>
      {isSaving ? <Loading className="w-6 animate-spin" /> : children}
    </button>
  )
}

export default ButtonSave
