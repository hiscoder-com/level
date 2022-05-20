import React from 'react'

export default function Footer() {
  return (
    <div className="border-t">
      <div className="max-w-7xl mx-auto px-2 flex justify-end items-center">
        <div className="relative flex items-center justify-between h-16 ">
          <div className="flex flex-row items-center space-x-6">
            <div>
              <input type="checkbox" id="scales" name="scales" />
              <label className="mx-1.5 ">Согласен</label>
            </div>
            <button className=" btn-filled w-28">Далее</button>
          </div>
        </div>
      </div>
    </div>
  )
}
