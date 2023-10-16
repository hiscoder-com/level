import Link from 'next/link'

import { useTranslation } from 'next-i18next'

import { useUsers } from 'utils/hooks'

function UsersList() {
  const { t } = useTranslation(['users'])
  const [users, { error, isLoading }] = useUsers()
  return (
    <table className="table-auto bg-th-secondary-background">
      <thead>
        <tr className="text-left bg-th-primary-background">
          <th className="border-b p-2 border-th-primary-border">{t('Login')}</th>
          <th className="border-b p-2 border-th-primary-border">{t('Email')}</th>
          <th className="border-b p-2 border-th-primary-border">{t('IsAdmin')}</th>
          <th className="border-b p-2 border-th-primary-border">{t('Agreement')}</th>
          <th className="border-b p-2 border-th-primary-border">{t('Confession')}</th>
          <th className="border-b p-2 border-th-primary-border">{t('Blocked')}</th>
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
                <td className="border-b p-2 border-th-primary-border">
                  <Link href={'/users/' + user.id}>{user.login}</Link>
                </td>
                <td className="border-b p-2 border-th-primary-border">{user.email}</td>
                <td
                  className={
                    'border-b p-2 border-th-primary-border ' +
                    (user.is_admin ? 'bg-th-primary-switch' : 'bg-th-secondary')
                  }
                >
                  {user.is_admin ? '+' : '-'}
                </td>
                <td
                  className={
                    'border-b p-2 border-th-primary-border ' +
                    (user.agreement ? 'bg-th-primary-switch' : 'bg-th-secondary')
                  }
                >
                  {user.agreement ? '+' : '-'}
                </td>
                <td
                  className={
                    'border-b p-2 border-th-primary-border ' +
                    (user.confession ? 'bg-th-primary-switch' : 'bg-th-secondary')
                  }
                >
                  {user.confession ? '+' : '-'}
                </td>
                <td
                  className={
                    'border-b p-2 border-th-primary-border ' +
                    (user.blocked ? 'bg-th-primary-switch' : 'bg-th-secondary')
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
