function NoteColumn() {
  return (
    <div className="flex flex-col gap-6">
      <div className="space-x-3 self-start">
        <button>
          <a className="btn-cyan">Мои заметки</a>
        </button>
        <button>
          <a className="btn-white">Заметки</a>
        </button>
        <button>
          <a className="btn-white">Словарь</a>
        </button>
      </div>
      <div className="min-w-full f-screen-full bg-white rounded-lg">
        <div className="h4 pt-2.5 px-4 h-10 font-bold bg-blue-350 rounded-t-lg"></div>
        <div className="h4 p-4">Текст:</div>
      </div>
    </div>
  )
}

export default NoteColumn
