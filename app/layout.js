// app/layout.js
import { Inter, Geist_Mono } from "next/font/google";
import "./globals.css";
import Providers from "./providers";

// Custom fonts setup
const inter = Inter({
  variable: "--font-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-mono",
  subsets: ["latin"],
});

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <link rel="icon" type="image/png" href="/icon.png" />
        <meta name="google-adsense-account" content="ca-pub-9530051498159475"/>
        <script async src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-9530051498159475" crossOrigin="anonymous"></script>
      </head>
      <body className={`${inter.variable} ${geistMono.variable} antialiased font-sans`}>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}