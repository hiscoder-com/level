import { Listbox } from '@headlessui/react'

import Check from 'public/icons/check.svg'
import ArrowRight from 'public/icons/folder-arrow-right.svg'

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
        <div className="relative flex w-full items-center text-th-text-primary">
          <Listbox.Button className="relative flex w-full items-center">
            <input
              className={`input-primary w-full truncate bg-th-secondary-50 !pr-8 !text-th-secondary-300 ${
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

            <ArrowRight className="absolute right-2 min-w-[1.5rem] rotate-90 stroke-th-secondary-300 stroke-2" />
          </Listbox.Button>
          <div className="mt-8">
            <Listbox.Options className="absolute left-0 z-10 max-h-[40vh] w-full overflow-y-auto rounded-b-lg border-b border-l border-r border-th-secondary-300 bg-th-secondary-10">
              {options.map((el) => (
                <Listbox.Option
                  as="div"
                  className="relative flex cursor-pointer items-center justify-between bg-th-secondary-50 px-5 py-1 last:pb-3 hover:bg-th-secondary-100"
                  key={el}
                  value={el}
                  onClick={() => handleOptionClicked(el)}
                >
                  <span className="truncate">{el}</span>
                  {selectedOptions.includes(el) && (
                    <div>
                      <Check className="h-6 w-6" />
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
