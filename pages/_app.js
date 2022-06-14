import LayoutStart from '../components/layoutStart'
import LayoutStartFooter from '../components/layoutStartFooter'
import LayoutBurger from '../components/layoutBurger'
import LayoutBurgerFooter from '../components/layoutBurgerFooter'
import { UserContextProvider } from '../lib/UserContext'
import { supabase } from '../utils/supabaseClient'
import { appWithTranslation } from 'next-i18next'
import '../styles/globals.css'

function MyApp({ Component, pageProps }) {
  switch (Component.layoutType) {
    case 'empty':
      return (
        <UserContextProvider supabaseClient={supabase}>
          <Component {...pageProps} />
        </UserContextProvider>
      )
      break
    case 'appbar':
      return (
        <UserContextProvider supabaseClient={supabase}>
          <LayoutBurger>
            <Component {...pageProps} />
          </LayoutBurger>
        </UserContextProvider>
      )
      break
    case 'appbarStart':
      return (
        <UserContextProvider supabaseClient={supabase}>
          <LayoutStart>
            <Component {...pageProps} />
          </LayoutStart>
        </UserContextProvider>
      )
      break
    case 'appbarStartFooter':
      return (
        <UserContextProvider supabaseClient={supabase}>
          <LayoutStartFooter>
            <Component {...pageProps} />
          </LayoutStartFooter>
        </UserContextProvider>
      )
      break
    default:
      return (
        <UserContextProvider supabaseClient={supabase}>
          <LayoutBurgerFooter>
            <Component {...pageProps} />
          </LayoutBurgerFooter>
        </UserContextProvider>
      )
      break
  }
}

export default appWithTranslation(MyApp)
