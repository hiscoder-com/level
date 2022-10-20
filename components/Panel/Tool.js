import { useTranslation } from 'next-i18next'

import {
  Notes,
  Dictionary,
  OwnNotes,
  Audio,
  Editor,
  Bible,
  TNTWL,
  TQ,
  BlindEditor,
} from './'

function Tool({ config }) {
  const { t } = useTranslation('common')
  const {
    resource: {
      manifest: { dublin_core: resource },
    },
  } = config
  let CurrentTool
  let url
  if (!resource) {
    return (
      <div>
        <h1>{t('No_content')}</h1>
      </div>
    )
  }
  config.verses = config.wholeChapter
    ? []
    : config.reference.verses.map((v) => (v?.num ? v.num : v))

  switch (resource?.subject) {
    case 'TSV OBS Translation Words Links':
      CurrentTool = TNTWL

      config.resource.bookPath = config.resource.manifest.projects[0]?.path

      url = '/api/git/obs-twl'
      break

    case 'OBS Translation Questions':
    case 'TSV OBS Translation Questions':
      CurrentTool = TQ

      config.resource.bookPath = config.resource.manifest.projects[0]?.path

      url = '/api/git/obs-tq'
      break

    case 'OBS Translation Notes':
    case 'TSV OBS Translation Notes':
      CurrentTool = TNTWL

      config.resource.bookPath = config.resource.manifest.projects[0]?.path

      url = '/api/git/obs-tn'
      break

    case 'TSV Translation Words Links':
      CurrentTool = TNTWL

      config.resource.bookPath = config.resource.manifest.projects.find(
        (el) => el.identifier === config.reference.book
      )?.path

      url = '/api/git/twl'
      break

    case 'TSV Translation Notes':
      CurrentTool = TNTWL

      config.resource.bookPath = config.resource.manifest.projects.find(
        (el) => el.identifier === config.reference.book
      )?.path

      url = '/api/git/tn'
      break

    case 'TSV Translation Questions':
    case 'Translation Questions':
      CurrentTool = TQ

      config.resource.bookPath = config.resource.manifest.projects.find(
        (el) => el.identifier === config.reference.book
      )?.path

      url = '/api/git/tq'
      break

    case 'Open Bible Stories':
      CurrentTool = Bible

      config.resource.bookPath = config.resource.manifest.projects[0]?.path

      url = '/api/git/obs'
      break

    case 'Bible':
    case 'Aligned Bible':
    case 'Hebrew Old Testament':
    case 'Greek New Testament':
      CurrentTool = Bible

      config.resource.bookPath = config.resource.manifest.projects.find(
        (el) => el.identifier === config.reference.book
      )?.path

      url = '/api/git/bible'
      break

    case 'translate':
      CurrentTool = Editor
      break

    case 'draftTranslate':
      CurrentTool = BlindEditor
      break

    case 'ownNotes':
      CurrentTool = OwnNotes
      break

    case 'teamNotes':
      CurrentTool = Notes
      break

    case 'audio':
      CurrentTool = Audio
      break

    case 'dictionary':
      CurrentTool = Dictionary
      break

    default:
      return <div>{t('Wrong_resource')}</div>
  }
  return <CurrentTool config={config} url={url} />
}

export default Tool
