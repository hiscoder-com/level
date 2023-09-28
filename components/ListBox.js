import { Listbox } from '@headlessui/react'
import Down from 'public/arrow-down.svg'

function ListBox({ options, selectedOption, setSelectedOption }) {
  return (
    <Listbox value={selectedOption} onChange={(e) => setSelectedOption(e)}>
      {({ open }) => (
        <>
          <div className="relative text-th-primary-text">
            <Listbox.Button className="relative flex justify-between px-5 py-3 w-full bg-th-secondary-background rounded-lg">
              <span>
                {options?.find((option) => option.value === selectedOption)?.label}
              </span>
              <Down className="w-6 h-6 min-w-[1.5rem]" />
            </Listbox.Button>
            <div className={`-mt-2 pt-5 ${open ? 'bg-th-secondary-background' : ''}`}>
              <Listbox.Options className="absolute w-full max-h-[40vh] bg-th-secondary-background rounded-b-lg overflow-y-scroll z-10">
                {options.map((el) => (
                  <Listbox.Option
                    className="relative px-5 py-1 bg-th-secondary-background cursor-pointer last:pb-3 hover:bg-th-primary-background"
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
