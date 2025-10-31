import type React from "react"
import type { Metadata } from "next"
import { Vazirmatn } from "next/font/google"
import { Analytics } from "@vercel/analytics/next"
import "./globals.css"

const vazirmatn = Vazirmatn({
  subsets: ["arabic"],
  variable: "--font-vazirmatn",
})

export const metadata: Metadata = {
  title: "ردیاب پس‌انداز بیت‌کوین",
  description: "داشبورد ردیابی سرمایه‌گذاری بیت‌کوین",
  generator: "v0.app",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="fa" dir="rtl" className="dark">
      <body className={`${vazirmatn.variable} font-sans antialiased`}>
        {children}
        <Analytics />
      </body>
    </html>
  )
}
