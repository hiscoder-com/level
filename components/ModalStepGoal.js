import { useState } from 'react'

import { useRouter } from 'next/router'

import { useTranslation } from 'next-i18next'

import { steps } from '../utils/steps'

function ModalStepGoal() {
  const [showModalStepGoal, setShowModalStepGoal] = useState(false)
  const router = useRouter()
  const { step } = router.query
  const { t } = useTranslation(['steps', 'common'])

  return (
    <>
      <button
        className="btn-cyan w-28"
        onClick={(e) => (setShowModalStepGoal(!showModalStepGoal), e.stopPropagation())}
      >
        {t('Goal', { ns: 'common' })}
      </button>

      {showModalStepGoal ? (
        <div className="modal-step-goal-bg" onClick={() => setShowModalStepGoal(false)}>
          <div className="modal-step-goal" onClick={(e) => e.stopPropagation()}>
            <h2 className="text-justify mt-2 mx-4 h4 font-semibold indent-4">
              {t(steps[step].stepGoal)}
            </h2>
            <button className="btn-cyan w-24" onClick={() => setShowModalStepGoal(false)}>
              {t('Close', { ns: 'common' })}
            </button>
          </div>
        </div>
      ) : null}
    </>
  )
}

export default ModalStepGoal
