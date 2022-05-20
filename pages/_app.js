import '../styles/globals.css'
import Layout from '../components/layout'
import Footer from '../components/footer'

function MyApp({ Component, pageProps }) {
  if (Component.layoutType === 'empty') {
    return <Component {...pageProps} />
  }
  if (Component.layoutType === 'appbar') {
    return (
      <Layout>
        <Component {...pageProps} />
      </Layout>
    )
  } else {
    return (
      <>
        <Layout>
          <Component {...pageProps} />
          <Footer />
        </Layout>
      </>
    )
  }
}

export default MyApp
