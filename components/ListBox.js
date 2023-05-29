import { Listbox } from '@headlessui/react'
import Down from 'public/arrow-down.svg'

function ListBox({ options, selectedOption, setSelectedOption }) {
  return (
    <Listbox value={selectedOption} onChange={(e) => setSelectedOption(e)}>
      {({ open }) => (
        <>
          <div className="relative text-slate-900">
            <Listbox.Button className="relative flex justify-between px-5 py-3 w-full bg-white rounded-lg">
              <span>
                {options?.find((option) => option.value === selectedOption)?.label}
              </span>
              <Down className="w-6 h-6 min-w-[1.5rem]" />
            </Listbox.Button>
            <div className={`-mt-2 pt-5 ${open ? 'bg-white' : ''}`}>
              <Listbox.Options className="absolute w-full max-h-[40vh] bg-white rounded-b-lg overflow-y-scroll z-10">
                {options.map((el) => (
                  <Listbox.Option
                    className="relative px-5 py-1 bg-white cursor-pointer last:pb-3 hover:bg-gray-200"
                    key={el.value}
                    value={el.value}
                  >
                    {el.label}
                  </Listbox.Option>
                ))}
              </Listbox.Options>
            </div>
          </div>
        </>
      )}
    </Listbox>
  )
}

export default ListBox
