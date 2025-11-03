"use client"

import { useState } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import type { Purchase } from "@/lib/types"
import { formatCurrency, formatBTC } from "@/lib/utils"
import { isoToJalali } from "@/lib/jalali-utils"
import { Edit, Trash2, ShoppingCart } from "lucide-react"
import { ImportExportButtons } from "@/components/import-export-buttons"

interface PurchaseHistoryProps {
  purchases: Purchase[]
  onEdit: (purchase: Purchase) => void
  onDelete: (id: string) => void
  onImport: (purchases: Purchase[]) => void
}

export function PurchaseHistory({ purchases, onEdit, onDelete, onImport }: PurchaseHistoryProps) {
  const [deleteId, setDeleteId] = useState<string | null>(null)
  const displayPurchases = purchases.slice(0, 5)

  const handleDeleteConfirm = () => {
    if (deleteId) {
      onDelete(deleteId)
      setDeleteId(null)
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <h2 className="text-2xl font-bold text-foreground">تاریخچه خریدها</h2>
        <div className="flex items-center gap-2 flex-wrap">
          <ImportExportButtons purchases={purchases} onImport={onImport} />
          {purchases.length > 5 && (
            <Button variant="outline" className="border-primary text-primary hover:bg-primary/10 bg-transparent">
              مشاهده همه ({purchases.length})
            </Button>
          )}
        </div>
      </div>

      {purchases.length === 0 ? (
        <Card className="p-12 text-center border-border">
          <div className="flex flex-col items-center gap-4">
            <div className="p-4 rounded-full bg-muted/30">
              <ShoppingCart className="w-12 h-12 text-muted-foreground" />
            </div>
            <div>
              <h3 className="text-xl font-semibold text-foreground mb-2">هنوز خریدی ثبت نشده است</h3>
              <p className="text-muted-foreground">برای شروع، اولین خرید خود را اضافه کنید</p>
            </div>
          </div>
        </Card>
      ) : (
        <div className="space-y-3">
          {displayPurchases.map((purchase, index) => (
            <Card
              key={purchase.id}
              className="p-4 border-border hover:border-primary/30 transition-all duration-200 animate-fade-in"
              style={{ animationDelay: `${index * 50}ms` }}
            >
              <div className="flex items-center justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-3 mb-2">
                    <p className="text-sm text-muted-foreground">{isoToJalali(purchase.date)}</p>
                    {purchase.notes && (
                      <span className="text-xs px-2 py-1 rounded-full bg-primary/10 text-primary">
                        {purchase.notes}
                      </span>
                    )}
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-sm">
                    <div>
                      <span className="text-muted-foreground">مقدار: </span>
                      <span className="font-semibold text-foreground">{formatBTC(purchase.btcAmount)} BTC</span>
                    </div>
                    <div>
                      <span className="text-muted-foreground">قیمت: </span>
                      <span className="font-semibold text-foreground">
                        {formatCurrency(purchase.usdPriceAtPurchase)}
                      </span>
                    </div>
                    <div>
                      <span className="text-muted-foreground">مجموع: </span>
                      <span className="font-semibold text-primary">{formatCurrency(purchase.totalUsdSpent)}</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => onEdit(purchase)}
                    className="text-muted-foreground hover:text-primary hover:bg-primary/10"
                  >
                    <Edit className="w-4 h-4" />
                  </Button>
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => setDeleteId(purchase.id)}
                        className="text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>تایید حذف</AlertDialogTitle>
                        <AlertDialogDescription>
                          آیا از حذف این رکورد خرید اطمینان دارید؟ این عمل غیرقابل بازگشت است.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel onClick={() => setDeleteId(null)}>انصراف</AlertDialogCancel>
                        <AlertDialogAction
                          onClick={handleDeleteConfirm}
                          className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                        >
                          حذف
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
