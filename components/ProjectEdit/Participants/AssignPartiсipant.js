import { useTranslation } from 'next-i18next'

import ComboboxAutocomplete from 'components/ComboboxAutocomplete'
import Modal from 'components/Modal'

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
          'w-full max-w-md overflow-y-visible rounded-3xl bg-th-primary-100 p-6 align-middle text-th-text-secondary-100',
      }}
    >
      <div className="flex min-h-[15vh] flex-col gap-7">
        <div className="text-center text-base sm:text-xl">{t(label)}</div>
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

        <div className="flex w-2/3 justify-center gap-7 self-center">
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
