import { OBS, Bible, TN, TQ } from './'

function Tool({ config }) {
  const { resource } = config
  let CurrentTool
  if (!resource) {
    return (
      <div>
        <h1>No_content</h1>
      </div>
    )
  }

  switch (resource?.subject) {
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

    case 'Bible':
    case 'Aligned Bible':
    case 'Hebrew Old Testament':
    case 'Greek New Testament':
      CurrentTool = Bible
      break

    default:
      return false
  }
  return <CurrentTool config={config} />
}

export default Tool
