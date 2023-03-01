import { useTranslation } from 'next-i18next'
import Link from 'next/link'
import { useRouter } from 'next/router'
import Report from 'public/error-outline.svg'
import EyeIcon from 'public/eye-icon.svg'
import EyeOffIcon from 'public/eye-off-icon.svg'
import { useRef, useState } from 'react'
import SwitchLocalization from './SwitchLocalization'
function Login() {
  const { t } = useTranslation('users', 'common')

  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(false)
  const [login, setLogin] = useState('')
  const [password, setPassword] = useState('')
  const [isLoginError, setIsLoginError] = useState(false)
  const [isPasswordError, setIsPasswordError] = useState(false)
  const [hideWriteAdminButton, setHideWriteAdminButton] = useState(true)
  const [showPassword, setShowPassword] = useState(false)
  const loginRef = useRef(null)
  const passwordRef = useRef(null)

  const handleLogin = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      const { user, error } = await supabase.auth.signIn({
        email: login,
        password,
      })
      if (error) throw error
      // TODO может попробовать использовать useCurrentUser.
      // По идее обновится состояние и он вернет текущего юзера,
      // у которого можно будет проверить поля и редиректить куда надо
      const { data: dataUser, error: errorUser } = await supabase
        .from('users')
        .select('agreement,confession')
        .eq('id', user?.id)
      if (errorUser) throw errorUser
      const { agreement, confession } = dataUser[0]
      // TODO END
      setIsLoginError(false)
      setIsPasswordError(false)
      setError(false)
      router.push(agreement && confession ? `/account` : '/agreements')
    } catch (error) {
      setIsLoginError(true)
      setIsPasswordError(true)
      setHideWriteAdminButton(false)
      setError(true)
    } finally {
      setLoading(false)
    }
  }

  const report = (e) => {
    e.preventDefault()
    alert('Вы написали админу')
  }
  return (
    <div className="flex flex-col p-5">
      <div className="flex justify-between mb-6">
        <h1 className="text-2xl font-bold">Войти</h1>
        <SwitchLocalization />
      </div>
      <p className="text-sm">{t('common:ForRegistrations')}</p>
      <Link href={'/'}>
        <a className="mb-6 text-sm text-blue-450">{t('common:WriteAdministrator')}</a>
      </Link>
      <form className="space-y-3">
        <div className="relative z-0 w-full mb-6 group">
          <input
            ref={loginRef}
            className={`input-label peer ${isLoginError && 'border-red-700'}`}
            type="text"
            name="floating_email"
            id="floating_email"
            placeholder=""
            onChange={(event) => {
              setLogin(event.target.value)
              setIsLoginError(false)
            }}
          />
          <label htmlFor="floating_email" className="label">
            {t('common:Login')}
          </label>
        </div>
        <div className="relative z-0 w-full mb-6 group">
          <input
            ref={passwordRef}
            name="floating_password"
            id="floating_password"
            className={`input-label peer ${isPasswordError && 'border-red-700'}`}
            type={showPassword ? 'text' : 'password'}
            value={password}
            placeholder=" "
            onChange={(event) => {
              setPassword(event.target.value)
              setIsPasswordError(false)
            }}
          />
          <label htmlFor="floating_password" className="label">
            {t('Password')}
          </label>
          <span
            className="eye"
            onClick={() => {
              setShowPassword((prev) => !prev)
            }}
          >
            {showPassword ? <EyeOffIcon /> : <EyeIcon />}
          </span>
        </div>
        <div className="flex items-center justify-between mb-4">
          {error && (
            <>
              <p className="flex text-xs text-red-600">
                <Report className="w-4 h-4" /> {t('WrongLoginPassword')}
              </p>
              <a
                href="#"
                className="font-medium underline text-sky-500 hover:text-sky-600"
              >
                {t('ForgotPassword')}?
              </a>
            </>
          )}
        </div>
        <div className="flex justify-center">
          <input
            type="submit"
            disabled={loading}
            onClick={handleLogin}
            className="btn-blue w-40"
            value={t('common:LogIn')}
          />
        </div>
        <div className="flex justify-center">
          <Link href={'/'}>
            <a className="text-sm text-blue-450">{t('common:RestoreAccess')}</a>
          </Link>
        </div>
      </form>
    </div>
  )
}

export default Login
