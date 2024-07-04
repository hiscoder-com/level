import { Listbox } from '@headlessui/react'

import Check from 'public/check.svg'
import ArrowRight from 'public/folder-arrow-right.svg'

function ListBoxMultiple({
  options,
  selectedOptions,
  setSelectedOptions,
  placeholderFull = '',
  placeholderEmpty = '',
}) {
  const isSelected = (value) => selectedOptions.includes(value)

  const handleOptionClicked = (value) => {
    if (isSelected(value)) {
      setSelectedOptions(selectedOptions.filter((option) => option !== value))
    } else {
      setSelectedOptions([...selectedOptions, value])
    }
  }

  return (
    <Listbox value={selectedOptions} multiple>
      {({ open }) => (
        <div className="relative flex items-center w-full text-th-text-primary">
          <Listbox.Button className="relative flex items-center w-full">
            <input
              className={`input-primary w-full !pr-8 !text-th-secondary-300 truncate bg-th-secondary-50 ${
                open ? '!rounded-b-none' : ''
              }`}
              value={
                options.length === selectedOptions.length
                  ? placeholderFull
                  : selectedOptions.length > 0
                  ? selectedOptions.join(', ')
                  : placeholderEmpty
              }
              readOnly
            />

            <ArrowRight className="absolute min-w-[1.5rem] stroke-th-secondary-300 right-2 stroke-2 rotate-90" />
          </Listbox.Button>
          <div className="mt-8">
            <Listbox.Options className="absolute w-full left-0 max-h-[40vh] rounded-b-lg overflow-y-auto z-10 border-r border-l border-b bg-th-secondary-10 border-th-secondary-300">
              {options.map((el) => (
                <Listbox.Option
                  as="div"
                  className="relative flex justify-between items-center px-5 py-1 bg-th-secondary-50 cursor-pointer last:pb-3 hover:bg-th-secondary-100"
                  key={el}
                  value={el}
                  onClick={() => handleOptionClicked(el)}
                >
                  <span className="truncate">{el}</span>
                  {selectedOptions.includes(el) && (
                    <div>
                      <Check className="w-6 h-6" />
                    </div>
                  )}
                </Listbox.Option>
              ))}
            </Listbox.Options>
          </div>
        </div>
      )}
    </Listbox>
  )
}
export default ListBoxMultiple
