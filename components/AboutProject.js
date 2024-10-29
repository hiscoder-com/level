import { useTranslation } from 'next-i18next'

import Feedback from './StartPage/Feedback'

const paragraphs = [
  {
    p: 'P1',
  },
  {
    p: 'P2',
  },
  {
    p: 'P3',
  },
  {
    p: 'P4',
  },
  {
    p: 'P5',
  },
  {
    p: 'Ul1',
    ul: ['Li1', 'Li2', 'Li3'],
  },
  {
    p: 'P6',
  },
  {
    p: 'Ul2',
    ul: ['Li1', 'Li2'],
  },
  {
    p: 'P7',
  },
  {
    p: 'P8',
  },
]

function AboutProject() {
  const { t } = useTranslation(['start-page', 'about', 'common'])

  return (
    <>
      <div>
        <h2 className="text-th-primary-100 uppercase font-medium">{t('common:About')}</h2>
        <div className="space-y-2 my-4">
          {paragraphs.map((item) => {
            if (!item.ul) {
              return <p key={item.p}>{t(`about:${item.p}`)}</p>
            }

            return (
              <ul key={item.p} className="list-disc ms-4">
                {item.ul.map((listItem) => (
                  <li key={listItem}>{t(`about:${item.p}:${listItem}`)}</li>
                ))}
              </ul>
            )
          })}
        </div>
      </div>
    </>
  )
}

export default AboutProject
