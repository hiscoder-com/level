import React from 'react'

export default function Footer() {
  return (
    <div className="border-t">
      <div className="max-w-7xl mx-auto flex justify-end items-center px-4">
        <div className="relative flex items-center h-16 ">
          {/* the confirmation & button "Next" */}
          <div className="flex flex-row items-center space-x-6">
            {/* the confirmation button */}
            <div className="">
              <input type="checkbox" id="scales" name="scales" />
              <label className="h4 mx-1.5">Согласен</label>
            </div>
            <button className="btn-filled w-28">Далее</button>
          </div>
        </div>
      </div>
    </div>
  )
}
