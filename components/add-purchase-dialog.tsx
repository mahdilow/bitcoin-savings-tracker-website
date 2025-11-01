"use client"

import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { JalaliDateInput } from "@/components/jalali-date-input"
import type { Purchase } from "@/lib/types"

interface AddPurchaseDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSave: (purchase: Omit<Purchase, "id">) => void
  currentBTCPrice: number
  editingPurchase?: Purchase | null
}

export function AddPurchaseDialog({
  open,
  onOpenChange,
  onSave,
  currentBTCPrice,
  editingPurchase,
}: AddPurchaseDialogProps) {
  const [date, setDate] = useState("")
  const [btcAmount, setBtcAmount] = useState("")
  const [usdPrice, setUsdPrice] = useState("")
  const [notes, setNotes] = useState("")
  const [errors, setErrors] = useState<Record<string, string>>({})

  useEffect(() => {
    if (open) {
      if (editingPurchase) {
        setDate(editingPurchase.date)
        setBtcAmount(editingPurchase.btcAmount.toString())
        setUsdPrice(editingPurchase.usdPriceAtPurchase.toString())
        setNotes(editingPurchase.notes || "")
      } else {
        setDate(new Date().toISOString())
        setBtcAmount("")
        setUsdPrice(currentBTCPrice.toString())
        setNotes("")
      }
      setErrors({})
    }
  }, [open, currentBTCPrice, editingPurchase])

  const calculateTotal = () => {
    const btc = Number.parseFloat(btcAmount) || 0
    const price = Number.parseFloat(usdPrice) || 0
    return btc * price
  }

  const validate = () => {
    const newErrors: Record<string, string> = {}

    if (!date) newErrors.date = "تاریخ الزامی است"
    if (!btcAmount || Number.parseFloat(btcAmount) <= 0) newErrors.btcAmount = "مقدار بیت‌کوین باید بیشتر از صفر باشد"
    if (!usdPrice || Number.parseFloat(usdPrice) <= 0) newErrors.usdPrice = "قیمت باید بیشتر از صفر باشد"

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSave = () => {
    if (!validate()) return

    const purchase: Omit<Purchase, "id"> = {
      date: new Date(date).toISOString(),
      btcAmount: Number.parseFloat(btcAmount),
      usdPriceAtPurchase: Number.parseFloat(usdPrice),
      totalUsdSpent: calculateTotal(),
      notes: notes.trim() || undefined,
    }

    onSave(purchase)
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px] bg-card border-border">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold text-foreground">
            {editingPurchase ? "ویرایش خرید" : "افزودن خرید"}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="date" className="text-foreground">
              تاریخ خرید (شمسی)
            </Label>
            <JalaliDateInput value={date} onChange={setDate} className="bg-background border-border text-foreground" />
            {errors.date && <p className="text-sm text-destructive">{errors.date}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="btcAmount" className="text-foreground">
              مقدار بیت‌کوین
            </Label>
            <Input
              id="btcAmount"
              type="number"
              step="0.00000001"
              placeholder="0.00000000"
              value={btcAmount}
              onChange={(e) => setBtcAmount(e.target.value)}
              className="bg-background border-border text-foreground"
            />
            {errors.btcAmount && <p className="text-sm text-destructive">{errors.btcAmount}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="usdPrice" className="text-foreground">
              قیمت دلار
              <span className="text-xs text-muted-foreground mr-2">
                💡 قیمت فعلی: ${currentBTCPrice.toLocaleString()}
              </span>
            </Label>
            <Input
              id="usdPrice"
              type="number"
              step="0.01"
              placeholder="0.00"
              value={usdPrice}
              onChange={(e) => setUsdPrice(e.target.value)}
              className="bg-background border-border text-foreground"
            />
            {errors.usdPrice && <p className="text-sm text-destructive">{errors.usdPrice}</p>}
          </div>

          <div className="space-y-2">
            <Label className="text-foreground">مجموع پرداختی</Label>
            <div className="p-3 rounded-lg bg-muted/30 border border-border">
              <p className="text-lg font-semibold text-foreground">
                ${calculateTotal().toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </p>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes" className="text-foreground">
              یادداشت (اختیاری)
            </Label>
            <Input
              id="notes"
              type="text"
              placeholder="یادداشت خود را وارد کنید..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="bg-background border-border text-foreground"
            />
          </div>
        </div>

        <DialogFooter className="gap-2">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            className="border-border text-foreground hover:bg-muted"
          >
            لغو
          </Button>
          <Button onClick={handleSave} className="bg-primary text-primary-foreground hover:bg-primary/90">
            ذخیره
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
