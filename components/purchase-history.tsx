"use client"

import { AlertDialogTrigger } from "@/components/ui/alert-dialog"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { useState } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import type { Purchase } from "@/lib/types"
import { formatCurrency, formatBTC } from "@/lib/utils"
import { isoToJalali } from "@/lib/jalali-utils"
import { Edit, Trash2, ShoppingCart, X, ArrowUpDown, Calendar, DollarSign, Bitcoin } from "lucide-react"
import { ImportExportButtons } from "@/components/import-export-buttons"

interface PurchaseHistoryProps {
  purchases: Purchase[]
  onEdit: (purchase: Purchase) => void
  onDelete: (id: string) => void
  onDeleteMultiple: (ids: string[]) => void
  onImport: (purchases: Purchase[]) => void
}

type SortField = "date" | "usdPriceAtPurchase" | "btcAmount"
type SortDirection = "asc" | "desc"

interface SortConfig {
  field: SortField
  direction: SortDirection
}

export function PurchaseHistory({ purchases, onEdit, onDelete, onDeleteMultiple, onImport }: PurchaseHistoryProps) {
  const [deleteId, setDeleteId] = useState<string | null>(null)
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [sortConfig, setSortConfig] = useState<SortConfig>({ field: "date", direction: "desc" })

  const isAllSelected = purchases.length > 0 && selectedIds.size === purchases.length
  const isSomeSelected = selectedIds.size > 0 && selectedIds.size < purchases.length

  const handleSelectAll = () => {
    if (isAllSelected) {
      setSelectedIds(new Set())
    } else {
      setSelectedIds(new Set(purchases.map((p) => p.id)))
    }
  }

  const handleSelectOne = (id: string) => {
    const newSelected = new Set(selectedIds)
    if (newSelected.has(id)) {
      newSelected.delete(id)
    } else {
      newSelected.add(id)
    }
    setSelectedIds(newSelected)
  }

  const handleDeleteSelected = () => {
    onDeleteMultiple(Array.from(selectedIds))
    setSelectedIds(new Set())
    setShowDeleteDialog(false)
  }

  const handleCancelSelection = () => {
    setSelectedIds(new Set())
  }

  const handleDeleteConfirm = () => {
    if (deleteId) {
      onDelete(deleteId)
      setDeleteId(null)
    }
  }

  const sortedPurchases = [...purchases].sort((a, b) => {
    const { field, direction } = sortConfig
    const modifier = direction === "asc" ? 1 : -1

    if (field === "date") {
      return (new Date(a.date).getTime() - new Date(b.date).getTime()) * modifier
    }
    return (a[field] - b[field]) * modifier
  })

  const handleSort = (field: SortField) => {
    setSortConfig((current) => ({
      field,
      direction: current.field === field && current.direction === "desc" ? "asc" : "desc",
    }))
  }

  const getSortLabel = (field: SortField) => {
    switch (field) {
      case "date":
        return "تاریخ خرید"
      case "usdPriceAtPurchase":
        return "قیمت خرید"
      case "btcAmount":
        return "مقدار بیت‌کوین"
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div className="flex items-center gap-4">
          <h2 className="text-2xl font-bold text-foreground">تاریخچه خریدها</h2>
          {purchases.length > 0 && (
            <>
              <div className="hidden md:flex items-center gap-2">
                <Checkbox
                  id="select-all"
                  checked={isAllSelected}
                  onCheckedChange={handleSelectAll}
                  className="data-[state=checked]:bg-primary data-[state=checked]:border-primary"
                />
                <label
                  htmlFor="select-all"
                  className="text-sm text-muted-foreground cursor-pointer select-none hover:text-foreground transition-colors"
                >
                  انتخاب همه
                </label>
              </div>
              <Button
                size="sm"
                variant={isAllSelected ? "default" : "outline"}
                onClick={handleSelectAll}
                className="md:hidden"
              >
                {isAllSelected ? "لغو انتخاب همه" : "انتخاب همه"}
              </Button>
            </>
          )}
        </div>
        <div className="flex items-center gap-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" className="gap-2 bg-transparent">
                <ArrowUpDown className="h-4 w-4" />
                <span className="hidden sm:inline">مرتب‌سازی: {getSortLabel(sortConfig.field)}</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              <DropdownMenuLabel>مرتب‌سازی بر اساس</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => handleSort("date")} className="justify-between">
                <span className="flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  تاریخ
                </span>
                {sortConfig.field === "date" && (
                  <span className="text-xs text-muted-foreground">
                    {sortConfig.direction === "asc" ? "قدیمی‌ترین" : "جدیدترین"}
                  </span>
                )}
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleSort("usdPriceAtPurchase")} className="justify-between">
                <span className="flex items-center gap-2">
                  <DollarSign className="h-4 w-4" />
                  قیمت
                </span>
                {sortConfig.field === "usdPriceAtPurchase" && (
                  <span className="text-xs text-muted-foreground">
                    {sortConfig.direction === "asc" ? "ارزان‌ترین" : "گران‌ترین"}
                  </span>
                )}
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleSort("btcAmount")} className="justify-between">
                <span className="flex items-center gap-2">
                  <Bitcoin className="h-4 w-4" />
                  مقدار
                </span>
                {sortConfig.field === "btcAmount" && (
                  <span className="text-xs text-muted-foreground">
                    {sortConfig.direction === "asc" ? "کمترین" : "بیشترین"}
                  </span>
                )}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          <ImportExportButtons purchases={purchases} onImport={onImport} />
        </div>
      </div>

      {selectedIds.size > 0 && (
        <div className="fixed bottom-24 md:bottom-8 left-1/2 -translate-x-1/2 z-50 animate-fade-in">
          <Card className="px-6 py-4 border-2 border-primary/50 bg-card/95 backdrop-blur-sm shadow-2xl shadow-primary/20">
            <div className="flex items-center gap-4">
              <span className="text-sm font-medium text-foreground">{selectedIds.size} مورد انتخاب شده</span>
              <div className="flex items-center gap-2">
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={handleCancelSelection}
                  className="text-muted-foreground hover:text-foreground hover:bg-muted"
                >
                  <X className="w-4 h-4 ml-1" />
                  لغو
                </Button>
                <Button
                  size="sm"
                  variant="destructive"
                  onClick={() => setShowDeleteDialog(true)}
                  className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                >
                  <Trash2 className="w-4 h-4 ml-1" />
                  حذف
                </Button>
              </div>
            </div>
          </Card>
        </div>
      )}

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
        <div className="max-h-[500px] md:max-h-[600px] overflow-y-auto pr-3 space-y-3 custom-scrollbar rounded-lg">
          {sortedPurchases.map((purchase, index) => {
            const isSelected = selectedIds.has(purchase.id)
            return (
              <Card
                key={purchase.id}
                className={`p-4 border-border transition-all duration-200 animate-fade-in ${
                  isSelected ? "border-primary bg-primary/5 shadow-md shadow-primary/10" : "hover:border-primary/30"
                }`}
                style={{ animationDelay: `${index * 50}ms` }}
              >
                <div className="flex items-center gap-3">
                  <div
                    className="flex items-center justify-center w-10 h-10 md:w-auto md:h-auto cursor-pointer"
                    onClick={() => handleSelectOne(purchase.id)}
                  >
                    <Checkbox
                      checked={isSelected}
                      onCheckedChange={() => handleSelectOne(purchase.id)}
                      className="data-[state=checked]:bg-primary data-[state=checked]:border-primary w-5 h-5 md:w-4 md:h-4"
                    />
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3 mb-2 flex-wrap">
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

                  {selectedIds.size === 0 && (
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
                  )}
                </div>
              </Card>
            )
          })}
        </div>
      )}

      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>تایید حذف چندگانه</AlertDialogTitle>
            <AlertDialogDescription>
              آیا از حذف {selectedIds.size} رکورد خرید اطمینان دارید؟ این عمل غیرقابل بازگشت است.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>انصراف</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteSelected}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              حذف همه
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
