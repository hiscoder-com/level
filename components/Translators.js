import Link from 'next/link'

import { useCurrentUser } from '../lib/UserContext'
import { useProject, useTranslators } from '@/utils/hooks'

function Translators({ projectCode }) {
  const test = [
    { url: 'https://avatars.githubusercontent.com/u/60795829?v=4', status: true },
    { url: 'https://avatars.githubusercontent.com/u/74174349?v=4', status: false },
    { url: 'https://avatars.githubusercontent.com/u/30548361?v=4', status: true },
    { url: 'https://avatars.githubusercontent.com/u/68908261?v=4', status: false },
  ]

  const { user } = useCurrentUser()

  const [project] = useProject({ token: user?.access_token, projectCode })

  const [translators] = useTranslators({
    token: user?.access_token,
    code: project?.projectCode,
  })
  console.log('projectCode: ', projectCode)
  console.log('translators: ', translators)

  return (
    <div className="">
      {translators && Object.keys(translators).length > 0 && (
        <>
          {translators.map((el, key) => {
            return (
              <div
                className="font-bold"
                key={key}
              >{`${el.users.login} ${el.users.email}`}</div>
            )
          })}
        </>
      )}
    </div>

    // <div className="inline-flex">
    //   {test?.map((el, key) => {
    //     return (
    //       <div key={key}>
    //         <div
    //           style={{ backgroundImage: 'url(' + el.url + ')' }}
    //           className={
    //             'w-9 h-9 mx-1 rounded-full border-2 bg-contain bg-center bg-no-repeat'
    //           }
    //         >
    //           <div
    //             className={`w-2 h-2 ml-7 ${
    //               el.status ? 'bg-green-500' : 'bg-amber-500'
    //             }  rounded-full`}
    //           ></div>
    //         </div>
    //       </div>
    //     )
    //   })}
    // </div>
  )
}

export default Translators
