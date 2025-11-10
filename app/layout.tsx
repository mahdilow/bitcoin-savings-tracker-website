import type React from "react"
import type { Metadata } from "next"
import { Vazirmatn } from "next/font/google"
import { Analytics } from "@vercel/analytics/next"
import { Sidebar } from "@/components/sidebar"
import { BottomNav } from "@/components/bottom-nav"
import { PWAInstallPrompt } from "@/components/pwa-install-prompt"
import "./globals.css"

const vazirmatn = Vazirmatn({
  subsets: ["arabic"],
  variable: "--font-vazirmatn",
})

export const metadata: Metadata = {
  title: "Oryn - ردیاب پس‌انداز بیت‌کوین",
  description: "داشبورد هوشمند ردیابی سرمایه‌گذاری بیت‌کوین با Oryn",
  generator: "v0.app",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "Oryn",
  },
  formatDetection: {
    telephone: false,
  },
  themeColor: "#F7931A",
  viewport: {
    width: "device-width",
    initialScale: 1,
    maximumScale: 1,
    userScalable: false,
    viewportFit: "cover",
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="fa" dir="rtl">
      <head>
        <link rel="icon" href="/icon-192.png" />
        <link rel="apple-touch-icon" href="/icon-192.png" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
      </head>
      <body className={`${vazirmatn.variable} font-sans antialiased`}>
        <Sidebar className="hidden md:flex" />
        <BottomNav />
        <main className="md:pr-20 pb-20 md:pb-0">{children}</main>
        <PWAInstallPrompt />
        <Analytics />
      </body>
    </html>
  )
}
