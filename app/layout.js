// app/layout.js
import { Inter } from "next/font/google";
import "./globals.scss";
import Providers from "./providers";

const inter = Inter({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-inter",
});

export default function RootLayout({ children }) {
  return (
    <html lang="en" suppressHydrationWarning className={inter.variable}>
      <head>
        <link rel="icon" type="image/png" href="/app_icon.png" />
        <meta name="google-adsense-account" content="ca-pub-9530051498159475" />
        <script async src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-9530051498159475" crossOrigin="anonymous"></script>
      </head>
      <body className="antialiased font-sans">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
