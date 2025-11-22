"use client"

import { useState } from "react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Trash2, AlertTriangle, Download } from "lucide-react"
import { deleteAccount } from "@/app/account/actions"
import { useRouter } from "next/navigation"
import { exportData } from "@/lib/storage"

export function DeleteAccountDialog() {
  const [isOpen, setIsOpen] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const router = useRouter()

  const handleDelete = async () => {
    try {
      setIsDeleting(true)
      await deleteAccount()
      setIsOpen(false)
      router.push("/")
      router.refresh()
    } catch (error) {
      console.error("Failed to delete account:", error)
      alert("خطا در حذف حساب کاربری. لطفاً با پشتیبانی تماس بگیرید.")
    } finally {
      setIsDeleting(false)
    }
  }

  const handleDownloadBackup = () => {
    const data = exportData()
    const blob = new Blob([data], { type: "application/json" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `oryn-backup-${new Date().toISOString().split("T")[0]}.json`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="destructive" className="w-full sm:w-auto gap-2">
          <Trash2 className="w-4 h-4" />
          حذف حساب کاربری
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md dir-rtl">
        <DialogHeader className="gap-2">
          <div className="mx-auto w-12 h-12 rounded-full bg-red-100 flex items-center justify-center mb-2">
            <AlertTriangle className="w-6 h-6 text-red-600" />
          </div>
          <DialogTitle className="text-center text-xl text-red-600">حذف دائمی حساب کاربری</DialogTitle>
          <DialogDescription className="text-center text-foreground/80">
            آیا مطمئن هستید؟ این عملیات <span className="font-bold text-red-500">غیرقابل بازگشت</span> است. تمام اطلاعات
            شما، شامل تاریخچه خریدها و تنظیمات، برای همیشه از سرور حذف خواهند شد.
          </DialogDescription>
        </DialogHeader>

        <div className="bg-muted/50 p-4 rounded-lg border border-border/50 space-y-3 my-2">
          <p className="text-sm font-medium text-foreground flex items-center gap-2">
            <Download className="w-4 h-4 text-primary" />
            پیشنهاد می‌کنیم قبل از حذف، نسخه پشتیبان تهیه کنید:
          </p>
          <Button variant="outline" size="sm" className="w-full gap-2 bg-transparent" onClick={handleDownloadBackup}>
            <Download className="w-4 h-4" />
            دانلود نسخه پشتیبان (JSON)
          </Button>
        </div>

        <DialogFooter className="gap-2 sm:gap-0 mt-4">
          <Button variant="ghost" onClick={() => setIsOpen(false)} disabled={isDeleting}>
            انصراف
          </Button>
          <Button variant="destructive" onClick={handleDelete} disabled={isDeleting} className="gap-2">
            {isDeleting ? "در حال حذف..." : "بله، همه چیز را پاک کن"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
