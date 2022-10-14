import { useTranslation } from 'next-i18next'

import { Notes, Dictionary, OwnNotes, Audio, Editor, Bible, TNTWL, TQ } from './'

function Tool({ config }) {
  const { t } = useTranslation('common')
  const {
    resource: {
      manifest: { dublin_core: resource },
    },
  } = config
  let CurrentTool
  let url
  let bookPath
  if (!resource) {
    return (
      <div>
        <h1>{t('No_content')}</h1>
      </div>
    )
  }
  // TODO возможно прям тут добавить проверку, надо ли передавать стихи или нет. Или же прокинуть это в каждый компонент. Может ли быть такое что к примеру ты делаешь перевод 5 стихов, показывать текст с Библии с 5 стихов, а вот заметки ко всем стихам?
  switch (resource?.subject) {
    case 'TSV OBS Translation Words Links':
      CurrentTool = TNTWL

      bookPath = config.resource.manifest.projects[0]?.path

      config.reference.verses = config.reference.verses.map((v) => (v?.num ? v.num : v))
      config.resource.bookPath = bookPath
      url = '/api/git/obs-twl'
      break

    case 'OBS Translation Questions':
    case 'TSV OBS Translation Questions':
      CurrentTool = TQ

      bookPath = config.resource.manifest.projects[0]?.path

      config.reference.verses = config.reference.verses.map((v) => (v?.num ? v.num : v))
      config.resource.bookPath = bookPath
      url = '/api/git/obs-tq'
      break

    case 'OBS Translation Notes':
    case 'TSV OBS Translation Notes':
      CurrentTool = TNTWL

      bookPath = config.resource.manifest.projects[0]?.path

      config.reference.verses = config.reference.verses.map((v) => (v?.num ? v.num : v))
      config.resource.bookPath = bookPath
      url = '/api/git/obs-tn'
      break

    case 'TSV Translation Words Links':
      CurrentTool = TNTWL

      bookPath = config.resource.manifest.projects[0]?.path

      config.reference.verses = config.reference.verses.map((v) => (v?.num ? v.num : v))
      config.resource.bookPath = bookPath
      url = '/api/git/twl'
      break

    case 'TSV Translation Notes':
      CurrentTool = TNTWL

      bookPath = config.resource.manifest.projects.find(
        (el) => el.identifier === config.reference.book
      )?.path

      config.reference.verses = config.reference.verses.map((v) => (v?.num ? v.num : v))
      config.resource.bookPath = bookPath

      url = '/api/git/tn'
      break

    case 'TSV Translation Questions':
    case 'Translation Questions':
      CurrentTool = TQ

      bookPath = config.resource.manifest.projects.find(
        (el) => el.identifier === config.reference.book
      )?.path

      config.reference.verses = config.reference.verses.map((v) => (v?.num ? v.num : v))
      config.resource.bookPath = bookPath

      url = '/api/git/tq'
      break

    case 'Open Bible Stories':
      CurrentTool = Bible

      bookPath = config.resource.manifest.projects[0]?.path

      config.reference.verses = config.reference.verses.map((v) => (v?.num ? v.num : v))
      config.resource.bookPath = bookPath

      url = '/api/git/obs'
      break

    case 'Bible':
    case 'Aligned Bible':
    case 'Hebrew Old Testament':
    case 'Greek New Testament':
      CurrentTool = Bible
      config.reference.verses = config.reference.verses.map((v) => (v?.num ? v.num : v))
      bookPath = config.resource.manifest.projects.find(
        (el) => el.identifier === config.reference.book
      )?.path

      config.resource.bookPath = bookPath

      url = '/api/git/bible'
      break

    case 'translate':
      CurrentTool = Editor
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
