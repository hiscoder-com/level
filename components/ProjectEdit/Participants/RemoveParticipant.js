import { useTranslation } from 'next-i18next'

import Modal from 'components/Modal'

function RemoveParticipant({ selected, setSelected, remove, label, role }) {
  const { t } = useTranslation()
  return (
    <Modal
      isOpen={selected ? Object.keys(selected).length > 0 : false}
      closeHandle={() => setSelected(false)}
    >
      <div className="flex flex-col justify-center gap-16 min-h-[15vh]">
        <div className="text-2xl text-center">{t(label)}</div>
        <div className="flex justify-center self-center gap-7 w-2/3">
          <button
            onClick={() => remove(selected.id, role)}
            disabled={!selected}
            className="btn-secondary flex-1"
          >
            {t('Remove')}
          </button>

          <button className="btn-secondary flex-1" onClick={() => setSelected(false)}>
            {t('Close')}
          </button>
        </div>
      </div>
    </Modal>
  )
}
export default RemoveParticipant
