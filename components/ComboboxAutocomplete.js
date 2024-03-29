import { Fragment, useState } from 'react'
import { Combobox, Transition } from '@headlessui/react'
import Down from 'public/arrow-down.svg'

function ComboboxAutocomplete({ options, selectedOption, setSelectedOption, t }) {
  const [query, setQuery] = useState('')

  const filteredPeople =
    query === ''
      ? options
      : options.filter((user) => {
          const userString = `${user.label}${
            user.email ? ` ${user.email}` : ''
          }`.toLowerCase()

          return userString.includes(query.toLowerCase())
        })

  return (
    <Combobox
      value={selectedOption}
      onChange={(e) => {
        setSelectedOption(e.value)
      }}
    >
      {({ open }) => (
        <div className="relative mt-1 text-th-text-primary">
          <div
            className={`relative w-full bg-th-secondary-10 cursor-default overflow-hidden transition-all duration-100 ease-in-out ${
              open ? 'rounded-t-lg' : 'rounded-lg'
            }`}
          >
            <Combobox.Input
              className="w-full py-3 pl-5 pr-12 outline-none"
              displayValue={(value) =>
                options?.find((option) => option.value === value)?.label
              }
              onChange={(event) => setQuery(event.target.value)}
            />
            <Combobox.Button className="absolute inset-y-0 right-0 pr-5">
              <Down className="w-6 h-6 min-w-[1.5rem] stroke-th-text-primary" />
            </Combobox.Button>
          </div>
          <Transition
            as={Fragment}
            leave="transition ease-in-out duration-100"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
            afterLeave={() => setQuery('')}
          >
            <Combobox.Options className="absolute w-full max-h-[40vh] overflow-y-auto rounded-b-lg bg-th-secondary-10 z-10">
              {filteredPeople.length === 0 && query !== '' ? (
                <div className="relative select-none px-5 py-2">{t('NothingFound')}</div>
              ) : (
                filteredPeople.map((person) => (
                  <Combobox.Option
                    key={person.value}
                    className={({ active }) =>
                      `relative cursor-pointer select-none py-2 px-5 ${
                        active ? 'bg-th-secondary-100' : ''
                      }`
                    }
                    value={person}
                  >
                    <span className="block truncate">
                      {`${person.label}${person.email ? ` (${person.email})` : ''}`}
                    </span>
                  </Combobox.Option>
                ))
              )}
            </Combobox.Options>
          </Transition>
        </div>
      )}
    </Combobox>
  )
}

export default ComboboxAutocomplete
