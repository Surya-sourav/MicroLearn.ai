import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "../ui/globals.css"

const inter = Inter({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-inter",
})

export const metadata: Metadata = {
  title: "M I C R O.ai",
  description:
    "Your all in one AI companion. Generate images, videos, codes, docs, debug your web apps all with Pixa's interface.",
  keywords: [
    "AI",
    "artificial intelligence",
    "image generation",
    "code generation",
    "chatbot",
    "GPT",
    "Claude",
    "Gemini",
  ],
  authors: [{ name: "Pixa Team" }],
  creator: "Pixa",
  publisher: "Pixa",
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://pixa.ai",
    title: "Pixa - All your AI models in one place",
    description:
      "Your all in one AI companion. Generate images, videos, codes, docs, debug your web apps all with Pixa's interface.",
    siteName: "Pixa",
  },
  twitter: {
    card: "summary_large_image",
    title: "Pixa - All your AI models in one place",
    description:
      "Your all in one AI companion. Generate images, videos, codes, docs, debug your web apps all with Pixa's interface.",
    creator: "@pixa_ai",
  },
  viewport: {
    width: "device-width",
    initialScale: 1,
    maximumScale: 1,
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className={inter.variable}>
      <head>
        <link rel="icon" href="/favicon.ico" />
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
        <meta name="theme-color" content="#000000" />
      </head>
      <body className={`${inter.className} antialiased`}>
        <div id="root">{children}</div>
      </body>
    </html>
  )
}
