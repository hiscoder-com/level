import { useState } from 'react'
import { supabase } from 'utils/supabaseClient'

export default function Testing() {
  const [text, setText] = useState('')
  const handleClick = async () => {
    let { data: notes, error } = await supabase.from('notes').select('note')
    setText(notes[1].note)
    console.log(notes)
  }

  return (
    <div className="">
      <button onClick={handleClick}>Получить данные</button>
      <p>{text}</p>
    </div>
  )
}
