import { useTranslation } from 'next-i18next'

import Modal from 'components/Modal'

function RemoveParticipant({ selected, setSelected, remove, label, role }) {
  const { t } = useTranslation()
  return (
    <Modal
      isOpen={selected ? Object.keys(selected).length > 0 : false}
      closeHandle={() => setSelected(false)}
    >
      <div className="flex flex-col gap-7 min-h-[15vh]">
        <div className="text-2xl text-center">{t(label)}</div>
        <div className="flex flex-row justify-center gap-7">
          <button
            onClick={() => remove(selected.id, role)}
            disabled={!selected}
            className="btn-secondary"
          >
            {t('Remove')}
          </button>

          <button className="btn-secondary" onClick={() => setSelected(false)}>
            {t('Close')}
          </button>
        </div>
      </div>
    </Modal>
  )
}
export default RemoveParticipant
