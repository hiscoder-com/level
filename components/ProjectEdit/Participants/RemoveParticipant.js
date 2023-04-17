import { useTranslation } from 'next-i18next'

import Modal from 'components/Modal'

function RemoveParticipant({ selected, setSelected, remove, label, role }) {
  console.log({ selected, setSelected, remove, label, role })
  const { t } = useTranslation()
  return (
    <Modal
      isOpen={selected ? Object.keys(selected).length > 0 : false}
      closeHandle={() => setSelected(false)}
    >
      <div className="text-center">
        <div className="mb-2">{t(label)}</div>
        <button
          onClick={() => remove(selected.id, role)}
          disabled={!selected}
          className="btn-cyan mx-2"
        >
          {t('Remove')}
        </button>
        <div className="mt-4">
          <button className="btn-cyan w-24" onClick={() => setSelected(false)}>
            {t('Close')}
          </button>
        </div>
      </div>
    </Modal>
  )
}
export default RemoveParticipant
