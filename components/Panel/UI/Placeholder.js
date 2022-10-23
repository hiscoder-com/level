import { useTranslation } from 'next-i18next'

function Placeholder() {
  const { t } = useTranslation(['common'])

  return (
    <div role="status" className="w-full animate-pulse">
      <div className="h-2.5 bg-gray-200 rounded-full dark:bg-gray-700 w-48 mb-4"></div>
      <div className="h-2 bg-gray-200 rounded-full dark:bg-gray-700 max-w-[360px] mb-2.5"></div>
      <div className="h-2 bg-gray-200 rounded-full dark:bg-gray-700 mb-2.5"></div>
      <div className="h-2 bg-gray-200 rounded-full dark:bg-gray-700 max-w-[330px] mb-2.5"></div>
      <div className="h-2 bg-gray-200 rounded-full dark:bg-gray-700 max-w-[300px] mb-2.5"></div>
      <div className="h-2 bg-gray-200 rounded-full dark:bg-gray-700 max-w-[360px]"></div>
    </div>
  )
}

export default Placeholder
