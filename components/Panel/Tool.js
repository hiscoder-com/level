import { useTranslation } from 'next-i18next'
import {
  Notes,
  Dictionary,
  OwnNotes,
  Translate,
  TranslateExtended,
  OBS,
  Bible,
  TN,
  TQ,
  TWL,
  OBSTQ,
  OBSTN,
  OBSTWL,
} from './'

function Tool({ config }) {
  const { t } = useTranslation('common')

  const { resource } = config
  let CurrentTool
  if (!resource) {
    return (
      <div>
        <h1>{t('No_content')}</h1>
      </div>
    )
  }

  switch (resource?.subject) {
    case 'TSV OBS Translation Words Links':
      CurrentTool = OBSTWL
      break

    case 'OBS Translation Questions':
    case 'TSV OBS Translation Questions':
      CurrentTool = OBSTQ
      break

    case 'OBS Translation Notes':
    case 'TSV OBS Translation Notes':
      CurrentTool = OBSTN
      break

    case 'TSV Translation Words Links':
      CurrentTool = TWL
      break

    case 'TSV Translation Notes':
      CurrentTool = TN
      break

    case 'TSV Translation Questions':
    case 'Translation Questions':
      CurrentTool = TQ
      break

    case 'Open Bible Stories':
      CurrentTool = OBS
      break
    case 'translate':
      CurrentTool = Translate
      break
    case 'translate-extended':
      CurrentTool = TranslateExtended
      break
    case 'ownNotes':
      CurrentTool = OwnNotes
      break
    case 'notes':
      CurrentTool = Notes
      break
    case 'dictionary':
      CurrentTool = Dictionary
      break

    case 'Bible':
    case 'Aligned Bible':
    case 'Hebrew Old Testament':
    case 'Greek New Testament':
      CurrentTool = Bible
      break

    default:
      return <div>{t('Wrong_resource')}</div>
  }
  return <CurrentTool config={config} />
}

export default Tool
