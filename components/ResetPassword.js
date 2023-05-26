import { useEffect, useRef, useState } from 'react'

import Link from 'next/link'
import { useRouter } from 'next/router'

import { useTranslation } from 'next-i18next'

import { supabase } from 'utils/supabaseClient'

import SwitchLocalization from './SwitchLocalization'
import SignOut from './SignOut'

import { useRedirect } from 'utils/hooks'

import { useCurrentUser } from 'lib/UserContext'

import Report from 'public/error-outline.svg'
import EyeIcon from 'public/eye-icon.svg'
import EyeOffIcon from 'public/eye-off-icon.svg'
import Modal from './Modal'

function ResetPassword() {
  const [showPassword, setShowPassword] = useState(false)
  const [password, setPassword] = useState('')
  const [error, setError] = useState(false)
  const [login, setLogin] = useState('')
  const [isOpenModal, setIsOpenModal] = useState(false)
  const [restoreEmail, setRestoreEmail] = useState('')
  const [isPasswordReset, setIsPasswordReset] = useState(false)
  const [newPassword, setNewPassword] = useState('')

  const { user, loading } = useCurrentUser()
  const { t } = useTranslation('users')
  const passwordRef = useRef(null)
  const loginRef = useRef(null)
  const router = useRouter()

  const { href } = useRedirect({
    user,
    startLink: '/agreements',
  })

  const handlereset = async () => {
    const { data, error } = await supabase.auth.api.resetPasswordForEmail(
      'alexzed@bk.ru',
      { redirectTo: 'https://deploy-preview-363--v-cana.netlify.app/?password=reset' }
    )
    console.log({ data, error })
  }
  console.log(user)
  const handleUpdatePassword = async () => {
    if (newPassword) {
    }
    const { data, error } = await supabase.auth.update({
      password: newPassword,
    })
    console.log({ data, error })
  }
  return (
    <>
      {user?.id ? (
        <div className="flex flex-col p-5 lg:py-10 xl:px-8">
          <div className="flex justify-end mb-6">
            <SwitchLocalization />
          </div>
          <form className="space-y-6 xl:space-y-10">
            <div>Восстановление пароля</div>
            <div>Введите новый пароль</div>
            <input
              className="input-primary"
              value={newPassword}
              onChange={(el) => setNewPassword(el.target.value)}
            />
            <button onClick={handleUpdatePassword} className="btn-cyan">
              поменять
            </button>
          </form>
        </div>
      ) : (
        <div>oops</div>
      )}

      <Modal isOpen={isOpenModal} closeHandle={() => setIsOpenModal(false)}>
        <div>Напишите адрес</div>
        <input value={restoreEmail} onChange={(e) => setRestoreEmail(e.target.value)} />
        <button onClick={handlereset}>отправить</button>
      </Modal>
    </>
  )
}

export default ResetPassword
