import LayoutStart from '../components/layoutStart'
import LayoutStartFooter from '../components/layoutStartFooter'
import LayoutBurger from '../components/layoutBurger'
import LayoutBurgerFooter from '../components/layoutBurgerFooter'
import '../styles/globals.css'

function MyApp({ Component, pageProps }) {
  switch (Component.layoutType) {
    case 'empty':
      return <Component {...pageProps} />
      break
    case 'appbar':
      return (
        <LayoutBurger>
          <Component {...pageProps} />
        </LayoutBurger>
      )
      break
    case 'appbarStart':
      return (
        <LayoutStart>
          <Component {...pageProps} />
        </LayoutStart>
      )
      break
    case 'appbarStartFooter':
      return (
        <LayoutStartFooter>
          <Component {...pageProps} />
        </LayoutStartFooter>
      )
      break
    default:
      return (
        <>
          <LayoutBurgerFooter>
            <Component {...pageProps} />
          </LayoutBurgerFooter>
        </>
      )
      break
  }
}

export default MyApp
