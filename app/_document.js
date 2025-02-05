// app/_document.js
import { Html, Head, Main, NextScript } from 'next/document';

export default function Document() {
  return (
    <Html>
      <Head>
        <script>console.log('Custom _document.js is working!');</script>
      </Head>
      <body>
        <Main />
        <NextScript />
      </body>
    </Html>
  );
}