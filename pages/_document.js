import { Html, Head, Main, NextScript } from 'next/document'

export default function Document() {
  const isIntranet = process.env.NEXT_PUBLIC_INTRANET ?? false
  return (
    <Html>
      <Head>
        {!isIntranet && (
          <link
            href="https://fonts.googleapis.com/css2?family=Roboto&display=swap"
            rel="stylesheet"
          />
        )}
      </Head>
      <body>
        <Main />
        <NextScript />
      </body>
    </Html>
  )
}
