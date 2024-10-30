import Link from 'next/link'

import { useTranslation } from 'next-i18next'
import { useUsers } from 'utils/hooks'

function UsersList() {
  const { t } = useTranslation(['users'])
  const [users, { error, isLoading }] = useUsers()
  return (
    <table className="mb-4 bg-th-secondary-10">
      <thead>
        <tr className="bg-th-secondary-100 text-left">
          <th className="border-b border-th-secondary-300 p-2">{t('Login')}</th>
          <th className="border-b border-th-secondary-300 p-2">{t('Email')}</th>
          <th className="border-b border-th-secondary-300 p-2">{t('IsAdmin')}</th>
          <th className="border-b border-th-secondary-300 p-2">{t('Agreement')}</th>
          <th className="border-b border-th-secondary-300 p-2">{t('Confession')}</th>
          <th className="border-b border-th-secondary-300 p-2">{t('Blocked')}</th>
        </tr>
      </thead>
      <tbody>
        {isLoading ? (
          <tr>
            <td colSpan={6} className="p-3 text-center">
              {t('Loading')}
            </td>
          </tr>
        ) : error ? (
          <tr>
            <td colSpan={6} className="p-3 text-center">
              {error.message}
            </td>
          </tr>
        ) : users ? (
          users.map((user) => {
            return (
              <tr key={user.login}>
                <td className="border-b border-th-secondary-300 p-2">
                  <Link href={'/users/' + user.id}>{user.login}</Link>
                </td>
                <td className="border-b border-th-secondary-300 p-2">{user.email}</td>
                <td
                  className={
                    'border-b border-th-secondary-300 p-2 ' +
                    (user.is_admin ? 'bg-th-primary-100' : 'bg-th-secondary')
                  }
                >
                  {user.is_admin ? '+' : '-'}
                </td>
                <td
                  className={
                    'border-b border-th-secondary-300 p-2 ' +
                    (user.agreement ? 'bg-th-primary-100' : 'bg-th-secondary')
                  }
                >
                  {user.agreement ? '+' : '-'}
                </td>
                <td
                  className={
                    'border-b border-th-secondary-300 p-2 ' +
                    (user.confession ? 'bg-th-primary-100' : 'bg-th-secondary')
                  }
                >
                  {user.confession ? '+' : '-'}
                </td>
                <td
                  className={
                    'border-b border-th-secondary-300 p-2 ' +
                    (user.blocked ? 'bg-th-primary-100' : 'bg-th-secondary')
                  }
                >
                  {user.blocked ? '+' : '-'}
                </td>
              </tr>
            )
          })
        ) : (
          <tr>
            <td colSpan={6} className="p-3 text-center">
              {t('NoUsers')}
            </td>
          </tr>
        )}
      </tbody>
    </table>
  )
}

export default UsersList
