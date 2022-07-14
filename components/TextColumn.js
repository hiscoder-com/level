function TextColumn({ step }) {
  const condition = `${step > 3 ? 'btn-white' : 'hidden'}`

  return (
    <div className="flex flex-col gap-6">
      <div className="space-x-3 self-start">
        <button>
          <a className="btn-cyan">Глава</a>
        </button>
        <button>
          <a className="btn-white">Комментарии</a>
        </button>
        <button>
          <a className="btn-white">Слова</a>
        </button>
        <button>
          <a className={condition}>Вопросы</a>
        </button>
      </div>
      <div className="min-w-full f-screen-full bg-white rounded-lg">
        <div className="h4 pt-2.5 px-4 h-10 font-bold bg-blue-350 rounded-t-lg">
          Глава 1
        </div>
        <div className="h4 p-4">Текст:</div>
      </div>
    </div>
  )
}

export default TextColumn
