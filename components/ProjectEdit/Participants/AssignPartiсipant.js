import { useTranslation } from 'next-i18next'
import { Listbox } from '@headlessui/react'

import Modal from 'components/Modal'

import Down from 'public/arrow-down.svg'

function AssignParticipant({
  openModalAssign,
  setOpenModalAssign,
  setSelectedUser,
  selectedUser,
  listOfAssigned,
  assign,
  label,
  role,
}) {
  const { t } = useTranslation()
  return (
    <Modal
      isOpen={openModalAssign}
      closeHandle={() => {
        setOpenModalAssign(false)
        setSelectedUser('')
      }}
      additionalClasses="overflow-y-visible"
    >
      <div className="flex flex-col min-h-[15vh] gap-7">
        <div className="text-2xl text-center">{t(label)}</div>
        <Listbox value={selectedUser} onChange={(e) => setSelectedUser(e)}>
          {({ open }) => (
            <>
              <div className="relative text-slate-900">
                <Listbox.Button className="relative flex justify-between px-5 py-3 w-full bg-white rounded-lg">
                  <span>
                    {listOfAssigned?.length > 0 &&
                      listOfAssigned?.find((el) => el.id === selectedUser)?.login}
                  </span>
                  <Down className="w-6 h-6 min-w-[1.5rem]" />
                </Listbox.Button>
                <div className={`-mt-2 pt-5 ${open ? 'bg-white' : ''}`}>
                  <Listbox.Options className="absolute w-full max-h-[40vh] bg-white rounded-b-lg overflow-y-scroll ">
                    {listOfAssigned.map((el) => (
                      <Listbox.Option
                        className="relative px-5 py-1 bg-white cursor-pointer hover:bg-teal-200 last:rounded-b-lg last:pb-3"
                        key={el.id}
                        value={el.id}
                      >
                        {el.login}
                      </Listbox.Option>
                    ))}
                  </Listbox.Options>
                </div>
              </div>
            </>
          )}
        </Listbox>

        <div className="grid grid-cols-2 auto-cols-fr justify-center self-center w-1/2 gap-7">
          <button
            onClick={() => {
              assign(role)
              setSelectedUser(listOfAssigned?.[0]?.id)
            }}
            disabled={!selectedUser}
            className="btn-link-full justify-center"
          >
            {t('Added')}
          </button>

          <button
            className="btn-link-full justify-center"
            onClick={() => {
              setOpenModalAssign(false)
              setSelectedUser('')
            }}
          >
            {t('Close')}
          </button>
        </div>
      </div>
    </Modal>
  )
}
export default AssignParticipant
