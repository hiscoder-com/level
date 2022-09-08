import { useState } from 'react'
import AutoSizeTextArea from './AutoSizeTextArea'

function Editor({ bd }) {
  const [value, setValue] = useState()

  return (
    <div className="divider-y-2 div  divide-yellow-600">
      {bd.map((el) => (
        <div key={el.id} className="flex my-3">
          <div>{el.verse}</div>
          <AutoSizeTextArea
            value={value}
            defaultValue={el.text}
            setValue={setValue}
            type="text"
            rows={'5'}
            className=" 
         resize-none
        block
        w-full
        px-3
        
        text-base
        font-normal
        text-gray-700
        bg-white bg-clip-padding
        rounded
        transition
        ease-in-out
        m-0
         focus:bg-white focus:border-blue-60 focus:outline-none
        focus:inline-none
         focus:bg-none
      "
            placeholder={'_'.repeat(50)}
          ></AutoSizeTextArea>
        </div>
      ))}
    </div>
  )
}

export default Editor
