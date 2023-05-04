import { useTranslation } from 'next-i18next'

import Modal from 'components/Modal'

import ListBox from 'components/ListBox'

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
        <ListBox
          options={listOfAssigned.map((el) => ({ label: el.login, value: el.id }))}
          selectedOption={selectedUser}
          setSelectedOption={setSelectedUser}
        />

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
