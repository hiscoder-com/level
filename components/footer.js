import React from 'react'

export default function Footer() {
  return (
    <div className="flex justify-end items-center border-t">
      <div className="mt-5 flex  items-center  ">
        <input type="checkbox" id="scales" name="scales" />
        <label className="ml-2 ">Согласен</label>
      </div>
      <button className=" ml-5 w-44 btn-filled">Далее</button>
    </div>
  )
}
