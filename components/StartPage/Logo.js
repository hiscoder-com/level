import { useRouter } from 'next/router'
import Link from 'next/link'

import TTMLogo from 'public/ttm-logo.svg'
import Facebook from 'public/facebook.svg'
import Instagram from 'public/instagram.svg'
import Telegram from 'public/telegram.svg'
import Youtube from 'public/youtube.svg'

function Logo({ t }) {
  const { locale } = useRouter()

  let socialLinks = [
    { href: 'https://www.youtube.com/@texttree', Icon: Youtube },
    { href: 'https://texttree.t.me', Icon: Telegram },
    { href: 'https://facebook.com/texttreeorg', Icon: Facebook, size: '6' },
    { href: 'https://instagram.com/texttreeorg', Icon: Instagram },
  ]

  if (locale !== 'ru') {
    socialLinks = [{ href: 'https://www.youtube.com/@texttreemovement', Icon: Youtube }]
  }

  return (
    <div className="flex flex-col w-full gap-6 md:gap-14">
      <p className="font-semibold md:font-bold mr-10">{t('LogoHeader')}</p>
      <p className="text-sm md:text-base font-normal">{t('LogoText')}</p>

      <div className="flex items-center gap-5 md:gap-10 flex-col md:flex-row">
        <Link href="https://www.texttree.org" target="_blank">
          <TTMLogo />
        </Link>

        <div className="flex justify-center items-center gap-3">
          {socialLinks.map(({ href, Icon, size }, index) => (
            <Link href={href} key={index} target="_blank">
              <div
                className={`flex items-center justify-center w-8 h-8 rounded-full bg-slate-550`}
              >
                <Icon className={size ? `h-${size}` : 'w-5'} />
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  )
}

export default Logo
