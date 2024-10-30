import { Listbox } from '@headlessui/react'
import Down from 'public/arrow-down.svg'

function ListBox({ options, selectedOption, setSelectedOption }) {
  return (
    <Listbox value={selectedOption} onChange={(e) => setSelectedOption(e)}>
      {({ open }) => (
        <>
          <div className="relative text-th-text-primary">
            <Listbox.Button className="relative flex w-full justify-between rounded-lg bg-th-secondary-10 px-5 py-3">
              <span>
                {options?.find((option) => option.value === selectedOption)?.label}
              </span>
              <Down className="h-6 w-6 min-w-[1.5rem] stroke-th-text-primary" />
            </Listbox.Button>
            <div className={`-mt-2 pt-5 ${open ? 'bg-th-secondary-10' : ''}`}>
              <Listbox.Options className="absolute z-10 max-h-[40vh] w-full overflow-y-auto rounded-b-lg bg-th-secondary-10">
                {options.map((el) => (
                  <Listbox.Option
                    className="relative cursor-pointer bg-th-secondary-10 px-5 py-1 last:pb-3 hover:bg-th-secondary-100"
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
