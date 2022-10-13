import { useCurrentUser } from 'lib/UserContext'
import { supabase } from 'utils/supabaseClient'

export default function TestPage() {
  const { user } = useCurrentUser()
  const handleClick = async () => {
    // const res3 = await supabase.rpc('authorize', {
    //   user_id: 'f193af4d-ca5e-4847-90ef-38f969792dd5',
    //   project_id: '2',
    // })
    // const res2 = await supabase.rpc('block_user', {
    //   user_id: '83282f7a-c4b7-4387-97c9-4c356e56af5c',
    // })
    // const res = await supabase.from('users').select()
    const res4 = await supabase
      .from('personal_notes')
      .select('note, id')
      .eq('user_id', user.id)

    // сохранить заметку
    // const res5 = await supabase.from('notes').insert({ note: 'my new note' })
    // const res6 = await supabase.rpc('set_moderator', {
    //   user_id: 'f193af4d-ca5e-4847-90ef-38f969792dd5',
    //   project_id: '2',
    // })
    // const res7 = await supabase.rpc('create_chapters', { book_id: 3 })
    //   const res8 = await supabase.rpc('create_verses', { chapter_id: 20 })
    console.log(res4)
  }

  return (
    <div className="container">
      <div className="btn-cyan" onClick={handleClick}>
        Get Data
      </div>
      <div>{user ? JSON.stringify(user) : 'Нет такого юзера!!'}</div>
    </div>
  )
}
