import Pdf from 'public/pdf.svg'
import Download from 'public/download.svg'
import { downloadPdf, downloadTxt } from 'utils/helper'

function DownloadBlock({ actions, state }) {
  return (
    <div className="flex justify-center ">
      <div
        className="p-2 mr-4 hover:bg-cyan-100 rounded-md"
        onClick={async (e) => {
          e.stopPropagation()
          downloadPdf(
            await actions.compile(state?.pdf?.ref?.text, 'html'),
            state?.pdf?.title,
            state?.pdf?.projectLanguage
          )
        }}
      >
        <Pdf />
      </div>
      <div
        className="p-2 w-10 h-10 hover:bg-cyan-100 rounded-md"
        onClick={async (e) => {
          e.stopPropagation()
          downloadTxt(
            await actions.compile(
              state?.txt?.ref?.text,
              'txt',
              state?.txt?.ref?.bookCode
            ),
            state?.txt?.title
          )
        }}
      >
        <Download />
      </div>
    </div>
  )
}
export default DownloadBlock
