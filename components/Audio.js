import { useState } from 'react'
import Recorder from './Recorder'
import { useTranslation } from 'next-i18next'
export default function Audio() {
  const [item, setItem] = useState(true)

  return (
    <>{item ? <AudioList setItem={setItem} /> : <AudioRecorder setItem={setItem} />}</>
  )
}
function AudioList({ setItem }) {
  const { t } = useTranslation(['common', 'steps'])
  return (
    <>
      <div className="layout-step-col-card-body-audio">
        <p>{t('AudioTitle')}</p>

        <button
          onClick={() => {
            setItem(false)
          }}
          className="btn-cyan"
        >
          {t('AudioButton')}
        </button>
      </div>
    </>
  )
}
function AudioRecorder({}) {
  const [microphoneAccess, setMicrophoneAccess] = useState(false)
  const [clear, setClear] = useState(false)
  const [recording, setRecording] = useState(false)
  return (
    <div className="flex justify-center flex-wrap mt-8  ">
      <p className={`text-center font-bold mb-4 ${microphoneAccess ? '' : 'hidden'}`}>
        Приложению V-Cana нужен доступ к микрофону. Нажмите на значок заблокированной
        камеры(микрофона) в адресной строке. Разрешите доступ и перезагрузите страницу.
      </p>
      <div className="pb-4 mb-4 border-b-4">
        <p className="mb-4">Пересказ на исходном языке:</p>
        <Recorder
          recording={recording}
          setRecording={setRecording}
          clear={clear}
          setClear={setClear}
          setMicrophoneAccess={setMicrophoneAccess}
        />
      </div>
      <div className="pb-4 mb-4 border-b-4">
        <p className="mb-4">Пересказ на целевом языке:</p>
        <Recorder
          clear={clear}
          setClear={setClear}
          setMicrophoneAccess={setMicrophoneAccess}
        />
      </div>
      <button
        className="btn-cyan"
        onClick={() => {
          setClear(true)
        }}
      >
        Очистить
      </button>
    </div>
  )
}
