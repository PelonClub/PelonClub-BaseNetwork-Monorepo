import { Html, Head, Main, NextScript } from 'next/document';

export default function Document() {
  return (
    <Html>
      <Head>
        <link rel="icon" type="image/png" href="/img/icon.png" />
        <link rel="shortcut icon" type="image/png" href="/img/icon.png" />
        <link rel="apple-touch-icon" href="/img/icon.png" />
      </Head>
      <body>
        <Main />
        <NextScript />
      </body>
    </Html>
  );
}

