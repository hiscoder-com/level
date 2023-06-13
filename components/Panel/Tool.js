import { useTranslation } from 'next-i18next'

import {
  PersonalNotes,
  CommandEditor,
  BlindEditor,
  Dictionary,
  TeamNotes,
  Editor,
  Reader,
  Audio,
  Bible,
  OBSTN,
  Info,
  TWL,
  TN,
  TQ,
} from './'

function Tool({ config, toolName, targetResourceLink, tnLink, editable = false }) {
  const { t } = useTranslation(['common', 'books'])
  const {
    resource: {
      manifest: { dublin_core: resource },
    },
  } = config
  let CurrentTool
  let url
  let title = config?.resource?.manifest?.dublin_core?.title

  if (!resource) {
    return (
      <div>
        <h1>{t('NoContent')}</h1>
      </div>
    )
  }

  config.verses = config.wholeChapter
    ? []
    : config.reference.verses.map((v) => (v?.num || v?.num === 0 ? v.num : v))
  switch (resource?.subject) {
    case 'TSV OBS Translation Words Links':
      CurrentTool = TWL

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
      CurrentTool = OBSTN

      config.resource.bookPath = config.resource.manifest.projects[0]?.path

      url = '/api/git/obs-tn'
      break

    case 'TSV Translation Words Links':
      CurrentTool = TWL

      config.resource.bookPath = config.resource.manifest.projects.find(
        (el) => el.identifier === config.reference.book
      )?.path

      url = '/api/git/twl'
      break

    case 'TSV Translation Notes':
      CurrentTool = TN

      config.resource.bookPath = config.resource.manifest.projects.find(
        (el) => el.identifier === config.reference.book
      )?.path

      config.targetResourceLink = targetResourceLink
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
      CurrentTool = editable ? Editor : Reader
      title = t('translate')
      break

    case 'commandTranslate':
      CurrentTool = editable ? CommandEditor : Reader
      title = t('commandTranslate')
      break

    case 'draftTranslate':
      CurrentTool = editable ? BlindEditor : Reader
      title = t('draftTranslate')
      break

    case 'teamNotes':
      CurrentTool = TeamNotes
      title = t('teamNotes')
      break

    case 'personalNotes':
      CurrentTool = PersonalNotes
      title = t('personalNotes')
      break

    case 'audio':
      CurrentTool = Audio
      title = t('audio')
      break

    case 'dictionary':
      CurrentTool = Dictionary
      title = t('dictionary')
      break

    case 'info':
      CurrentTool = Info
      title = t('info')
      config.tnLink = tnLink

      url = '/api/git/info'
      break

    default:
      return <div>{t('WrongResource')}</div>
  }
  return (
    <>
      <div className="pt-2.5 px-4 h-10 font-bold bg-blue-350 rounded-t-lg truncate">
        {![
          'translate',
          'commandTranslate',
          'draftTranslate',
          'teamNotes',
          'personalNotes',
          'audio',
          'dictionary',
        ].includes(toolName) &&
          `${t(`books:${config?.reference?.book}`)} ${config?.reference?.chapter}, `}
        {title}
      </div>
      <div className="adaptive-card">
        <div className="h-full p-4 overflow-x-hidden overflow-y-auto">
          <CurrentTool config={config} url={url} toolName={toolName} />
        </div>
      </div>
    </>
  )
}

export default Tool
