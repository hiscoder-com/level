import React from 'react'

export default function Footer() {
  return (
    <div className="flex w-11/12 h-20 justify-end items-center border-t">
      <div className=" flex  items-center  ">
        <input type="checkbox" id="scales" name="scales" />
        <label className="ml-2 ">Согласен</label>
      </div>
      <button className=" ml-5 w-1/12 btn-filled">Далее</button>
    </div>
  )
}
