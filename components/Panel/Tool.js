import { useTranslation } from 'next-i18next'

import { Notes, Dictionary, OwnNotes, Editor, Bible, TNTWL, TQ } from './'

function Tool({ config }) {
  const { t } = useTranslation('common')

  const { resource } = config
  let CurrentTool
  let url
  if (!resource) {
    return (
      <div>
        <h1>{t('No_content')}</h1>
      </div>
    )
  }

  switch (resource?.subject) {
    case 'TSV OBS Translation Words Links':
      CurrentTool = TNTWL
      url = '/api/git/obs-twl'
      break

    case 'OBS Translation Questions':
    case 'TSV OBS Translation Questions':
      CurrentTool = TQ
      url = '/api/git/obs-tq'
      break

    case 'OBS Translation Notes':
    case 'TSV OBS Translation Notes':
      CurrentTool = TNTWL
      url = '/api/git/obs-tn'
      break

    case 'TSV Translation Words Links':
      CurrentTool = TNTWL
      url = '/api/git/twl'
      break

    case 'TSV Translation Notes':
      CurrentTool = TNTWL
      url = '/api/git/tn'
      break

    case 'TSV Translation Questions':
    case 'Translation Questions':
      CurrentTool = TQ
      url = '/api/git/tq'
      break

    case 'Open Bible Stories':
      CurrentTool = Bible
      url = '/api/git/obs'
      break
    case 'translate':
      CurrentTool = Editor
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
      url = '/api/git/bible'
      break

    default:
      return <div>{t('Wrong_resource')}</div>
  }
  return <CurrentTool config={config} url={url} />
}

export default Tool
