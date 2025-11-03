"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Download, X } from "lucide-react"

export function PWAInstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null)
  const [showPrompt, setShowPrompt] = useState(false)

  useEffect(() => {
    const handler = (e: Event) => {
      e.preventDefault()
      setDeferredPrompt(e)
      setShowPrompt(true)
    }

    window.addEventListener("beforeinstallprompt", handler)

    return () => window.removeEventListener("beforeinstallprompt", handler)
  }, [])

  const handleInstall = async () => {
    if (!deferredPrompt) return

    deferredPrompt.prompt()
    const { outcome } = await deferredPrompt.userChoice

    if (outcome === "accepted") {
      setDeferredPrompt(null)
      setShowPrompt(false)
    }
  }

  const handleDismiss = () => {
    setShowPrompt(false)
    localStorage.setItem("pwa-prompt-dismissed", "true")
  }

  if (!showPrompt || localStorage.getItem("pwa-prompt-dismissed")) {
    return null
  }

  return (
    <Card className="fixed bottom-20 md:bottom-8 left-4 right-4 md:left-auto md:right-8 md:w-96 p-4 bg-card/95 backdrop-blur-lg border-primary/20 shadow-lg z-40 animate-slide-up">
      <button
        onClick={handleDismiss}
        className="absolute top-2 left-2 p-1 rounded-full hover:bg-muted transition-colors"
      >
        <X className="w-4 h-4 text-muted-foreground" />
      </button>
      <div className="flex items-start gap-3 pr-6">
        <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
          <Download className="w-5 h-5 text-primary" />
        </div>
        <div className="flex-1">
          <h3 className="font-semibold text-foreground mb-1">نصب اپلیکیشن</h3>
          <p className="text-sm text-muted-foreground mb-3">برای دسترسی سریع‌تر، اپلیکیشن را روی دستگاه خود نصب کنید</p>
          <Button onClick={handleInstall} className="w-full bg-primary hover:bg-primary/90" size="sm">
            نصب اپلیکیشن
          </Button>
        </div>
      </div>
    </Card>
  )
}
