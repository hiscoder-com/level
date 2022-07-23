import Link from 'next/link'

import { useTranslation } from 'next-i18next'

import { useUsers } from '../../utils/hooks'

function UsersList({ access_token }) {
  const { t } = useTranslation(['users'])
  const [users, { error, loading }] = useUsers('access_token')
  return (
    <table className="table-auto bg-white">
      <thead>
        <tr className="text-left bg-gray-100">
          <th className="border-b p-2 border-slate-200">{t('login')}</th>
          <th className="border-b p-2 border-slate-200">{t('email')}</th>
          <th className="border-b p-2 border-slate-200">{t('IsAdmin')}</th>
          <th className="border-b p-2 border-slate-200">{t('agreement')}</th>
          <th className="border-b p-2 border-slate-200">{t('confession')}</th>
          <th className="border-b p-2 border-slate-200">{t('blocked')}</th>
        </tr>
      </thead>
      <tbody>
        {loading ? (
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
                  <Link href={'/users/' + user.id}>
                    <a>{user.login}</a>
                  </Link>
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
