import { downloadPdf, downloadTxt } from 'utils/helper'

import Pdf from 'public/pdf.svg'
import Usfm from 'public/usfm.svg'

function DownloadBlock({ actions, state }) {
  return (
    <div className="flex justify-center">
      <div
        className="p-2 mr-4 hover:bg-gray-200 rounded-md"
        onClick={async (e) => {
          e.stopPropagation()
          downloadPdf(
            await actions.compile(state?.pdf?.ref, 'html'),
            state?.pdf?.ref?.title,
            state?.pdf?.ref?.subtitle,
            state?.pdf?.projectLanguage
          )
        }}
      >
        <Pdf />
      </div>
      <div
        className="p-2 hover:bg-gray-200 rounded-md"
        onClick={async (e) => {
          e.stopPropagation()
          downloadTxt(await actions.compile(state?.txt?.ref, 'txt'), state?.txt?.fileName)
        }}
      >
        <Usfm />
      </div>
    </div>
  )
}
export default DownloadBlock
