import { useTranslation } from 'next-i18next'

import Modal from 'components/Modal'
import ComboboxAutocomplete from 'components/ComboboxAutocomplete'

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
      className={{
        dialogPanel:
          'w-full max-w-md align-middle p-6 bg-th-primary-100 text-th-text-secondary-100 overflow-y-visible rounded-3xl',
      }}
    >
      <div className="flex flex-col min-h-[15vh] gap-7">
        <div className="text-base sm:text-xl text-center">{t(label)}</div>
        <ComboboxAutocomplete
          options={listOfAssigned?.map((user) => ({
            label: user.login,
            value: user.id,
            email: user.email,
          }))}
          setSelectedOption={setSelectedUser}
          selectedOption={selectedUser}
          t={t}
        />

        <div className="flex justify-center self-center w-2/3 gap-7">
          <button
            onClick={() => {
              assign(role)
              setSelectedUser(listOfAssigned?.[0]?.id)
            }}
            disabled={!selectedUser}
            className="btn-secondary flex-1"
          >
            {t('Added')}
          </button>

          <button
            className="btn-secondary flex-1"
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
