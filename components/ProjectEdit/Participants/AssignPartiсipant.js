import { useTranslation } from 'next-i18next'
import Modal from 'components/Modal'

function AssignParticipant({
  openModalAssign,
  setOpenModalAssign,
  setSelectedUser,
  selectedUser,
  listOfAssigned,
  assign,
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
    >
      <div className="flex flex-col gap-7 min-h-[15vh]">
        <select
          className="input"
          value={selectedUser}
          onChange={(e) => setSelectedUser(e.target.value)}
        >
          {listOfAssigned?.map((el) => (
            <option value={el.id} key={el.id}>
              {el.login}
            </option>
          ))}
        </select>
        <div className="flex flex-row justify-center gap-7">
          <button
            onClick={() => {
              assign(role)
              setSelectedUser(listOfAssigned?.[0]?.id)
            }}
            disabled={!selectedUser}
            className="btn-link-full"
          >
            {t('Added')}
          </button>

          <button
            className="btn-link-full"
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
