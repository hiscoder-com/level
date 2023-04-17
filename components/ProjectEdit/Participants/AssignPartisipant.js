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
      <div className="text-center">
        <select
          className="input m-2"
          value={selectedUser}
          onChange={(e) => setSelectedUser(e.target.value)}
        >
          {listOfAssigned?.map((el) => (
            <option value={el.id} key={el.id}>
              {el.login}
            </option>
          ))}
        </select>
        <button
          onClick={() => {
            assign(role)
            setSelectedUser(listOfAssigned?.[0]?.id)
          }}
          disabled={!selectedUser}
          className="btn-cyan mx-2"
        >
          {t('Added')}
        </button>
        <div className="mt-4">
          <button
            className="btn-cyan w-24"
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
