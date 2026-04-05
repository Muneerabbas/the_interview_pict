// app/layout.js
import { Inter } from "next/font/google";
import "./globals.scss";
import Providers from "./providers";

export const metadata = {
  metadataBase: new URL("https://theinterviewroom.in"),
  applicationName: "The Interview Room",
  title: {
    default: "The Interview Room",
    template: "%s | The Interview Room",
  },
  description:
    "Real interview experiences, company insights, and prep resources to help you land your next role.",
  alternates: {
    canonical: "/",
  },
  keywords: [
    "interview experiences",
    "interview questions",
    "company interview process",
    "job interview preparation",
    "tech interviews",
    "placement interviews",
  ],
  openGraph: {
    type: "website",
    url: "https://theinterviewroom.in",
    siteName: "The Interview Room",
    title: "The Interview Room",
    description:
      "Real interview experiences, company insights, and prep resources to help you land your next role.",
    images: [
      {
        url: "/app_icon.png",
        width: 512,
        height: 512,
        alt: "The Interview Room",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "The Interview Room",
    description:
      "Real interview experiences, company insights, and prep resources to help you land your next role.",
    images: ["/app_icon.png"],
  },
  icons: {
    icon: "/app_icon.png",
    shortcut: "/app_icon.png",
    apple: "/app_icon.png",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
      "max-video-preview": -1,
    },
  },
};

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
