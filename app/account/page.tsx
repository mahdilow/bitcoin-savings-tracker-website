import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { User, Calendar, Mail, Shield, Clock, TriangleAlert } from "lucide-react"
import { LogoutButton } from "@/components/logout-button"
import { format } from "date-fns-jalali"
import { DeleteAccountDialog } from "@/components/delete-account-dialog"
import { SessionManager } from "@/components/session-manager"
import { getSessionCount } from "./actions"

export default async function AccountPage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/auth/login?next=/account")
  }

  // Fetch session count server-side
  const sessionCount = await getSessionCount()

  // Format dates
  const joinDate = user.created_at ? format(new Date(user.created_at), "d MMMM yyyy") : "نامشخص"

  const lastSignIn = user.last_sign_in_at ? format(new Date(user.last_sign_in_at), "d MMMM yyyy - HH:mm") : "نامشخص"

  return (
    <div className="container max-w-5xl mx-auto p-4 space-y-8 mt-8 mb-24 md:mb-0 md:py-8">
      <h1 className="text-3xl font-bold text-foreground mr-2">حساب کاربری من</h1>

      <div className="grid gap-8 md:grid-cols-12 items-start">
        {/* Left Column: User Profile - Takes 4 columns on desktop */}
        <div className="md:col-span-4 space-y-6">
          <Card className="border-border/50 shadow-lg overflow-hidden relative h-full">
            <div className="absolute top-0 left-0 w-full h-32 bg-gradient-to-b from-primary/20 to-transparent" />
            <CardHeader className="relative pt-12 pb-6 flex flex-col items-center text-center z-10">
              <div className="w-32 h-32 rounded-full bg-background border-4 border-background shadow-2xl flex items-center justify-center text-primary mb-4 ring-4 ring-primary/5">
                <User className="w-16 h-16" />
              </div>
              <CardTitle className="text-2xl font-bold">{user.user_metadata?.full_name || "کاربر عزیز"}</CardTitle>
              <div className="flex items-center justify-center gap-2 text-muted-foreground text-sm dir-ltr bg-muted/50 px-3 py-1 rounded-full mt-2">
                <Mail className="w-3 h-3" />
                <span>{user.email}</span>
              </div>
            </CardHeader>
            <CardContent className="pb-8 px-6">
              <div className="grid gap-4">
                <div className="flex items-center gap-4 p-4 rounded-2xl bg-muted/50 border border-border/50 transition-colors hover:bg-muted">
                  <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary shadow-sm">
                    <Calendar className="w-5 h-5" />
                  </div>
                  <div className="space-y-1">
                    <p className="text-xs text-muted-foreground font-medium">تاریخ عضویت</p>
                    <p className="text-sm font-bold">{joinDate}</p>
                  </div>
                </div>

                <div className="flex items-center gap-4 p-4 rounded-2xl bg-muted/50 border border-border/50 transition-colors hover:bg-muted">
                  <div className="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center text-blue-500 shadow-sm">
                    <Clock className="w-5 h-5" />
                  </div>
                  <div className="space-y-1">
                    <p className="text-xs text-muted-foreground font-medium">آخرین ورود</p>
                    <p className="text-sm font-bold">{lastSignIn}</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Column: Settings & Actions - Takes 8 columns on desktop */}
        <div className="md:col-span-8 space-y-6">
          {/* Security & Session Info */}
          <Card className="border-border/50 shadow-md">
            <CardHeader className="pb-4 border-b border-border/50">
              <CardTitle className="text-xl flex items-center gap-2">
                <Shield className="w-6 h-6 text-green-500" />
                مدیریت نشست‌ها و امنیت
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-6 space-y-8">
              <SessionManager initialSessionCount={sessionCount} />

              <div className="bg-muted/30 rounded-xl p-6 border border-border/50 flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="space-y-1 text-center sm:text-right">
                  <p className="font-medium">خروج از حساب کاربری</p>
                  <p className="text-sm text-muted-foreground">فقط از همین دستگاه خارج می‌شوید</p>
                </div>
                <LogoutButton />
              </div>
            </CardContent>
          </Card>

          {/* Danger Zone */}
          <Card className="border-red-200 dark:border-red-900/50 shadow-md bg-red-50/30 dark:bg-red-900/10 overflow-hidden">
            <CardHeader className="bg-red-100/50 dark:bg-red-900/20 border-b border-red-200 dark:border-red-900/50 pb-4">
              <CardTitle className="text-lg flex items-center gap-2 text-red-600 dark:text-red-400">
                <TriangleAlert className="w-5 h-5" />
                منطقه خطر
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-6">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 p-5 rounded-xl border border-red-200 dark:border-red-900/30 bg-background/80">
                <div className="space-y-1.5">
                  <p className="font-bold text-foreground">حذف حساب کاربری و داده‌ها</p>
                  <p className="text-sm text-muted-foreground max-w-md">
                    با حذف حساب کاربری، تمام اطلاعات شما شامل تاریخچه خریدها، تنظیمات و اطلاعات شخصی به صورت غیرقابل
                    بازگشت حذف خواهند شد.
                  </p>
                </div>
                <DeleteAccountDialog />
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
