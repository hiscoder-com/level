import Link from 'next/link'

import { useTranslation } from 'next-i18next'

import { useUsers } from 'utils/hooks'

function UsersList({ access_token }) {
  const { t } = useTranslation(['users'])
  const [users, { error, isLoading }] = useUsers(access_token)
  return (
    <table className="table-auto bg-white">
      <thead>
        <tr className="text-left bg-gray-100">
          <th className="border-b p-2 border-slate-200">{t('Login')}</th>
          <th className="border-b p-2 border-slate-200">{t('Email')}</th>
          <th className="border-b p-2 border-slate-200">{t('IsAdmin')}</th>
          <th className="border-b p-2 border-slate-200">{t('Agreement')}</th>
          <th className="border-b p-2 border-slate-200">{t('Confession')}</th>
          <th className="border-b p-2 border-slate-200">{t('Blocked')}</th>
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
                <td className="border-b p-2 border-slate-200">
                  <Link href={'/users/' + user.id}>{user.login}</Link>
                </td>
                <td className="border-b p-2 border-slate-200">{user.email}</td>
                <td
                  className={
                    'border-b p-2 border-slate-200 ' +
                    (user.is_admin ? 'bg-green-50' : 'bg-red-50')
                  }
                >
                  {user.is_admin ? '+' : '-'}
                </td>
                <td
                  className={
                    'border-b p-2 border-slate-200 ' +
                    (user.agreement ? 'bg-green-50' : 'bg-red-50')
                  }
                >
                  {user.agreement ? '+' : '-'}
                </td>
                <td
                  className={
                    'border-b p-2 border-slate-200 ' +
                    (user.confession ? 'bg-green-50' : 'bg-red-50')
                  }
                >
                  {user.confession ? '+' : '-'}
                </td>
                <td
                  className={
                    'border-b p-2 border-slate-200 ' +
                    (user.blocked ? 'bg-green-50' : 'bg-red-50')
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
