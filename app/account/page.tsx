import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { User, Calendar, Smartphone, Mail, Shield, Clock } from "lucide-react"
import { LogoutButton } from "@/components/logout-button"
import { format } from "date-fns-jalali"

export default async function AccountPage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/auth/login?next=/account")
  }

  // Format dates
  const joinDate = user.created_at ? format(new Date(user.created_at), "d MMMM yyyy") : "نامشخص"

  const lastSignIn = user.last_sign_in_at ? format(new Date(user.last_sign_in_at), "d MMMM yyyy - HH:mm") : "نامشخص"

  return (
    <div className="container max-w-2xl mx-auto p-4 space-y-6 mt-8 md:mt-0 mb-24 md:mb-0">
      <h1 className="text-3xl font-bold text-foreground">حساب کاربری من</h1>

      <div className="grid gap-6">
        {/* User Profile Card */}
        <Card className="border-border/50 shadow-lg overflow-hidden relative">
          <div className="absolute top-0 left-0 w-full h-24 bg-gradient-to-r from-primary/20 to-primary/5" />
          <CardHeader className="relative pt-12 pb-2">
            <div className="flex flex-col items-center text-center gap-3">
              <div className="w-24 h-24 rounded-full bg-background border-4 border-background shadow-xl flex items-center justify-center text-primary">
                <User className="w-12 h-12" />
              </div>
              <div className="space-y-1">
                <CardTitle className="text-2xl">{user.user_metadata?.full_name || "کاربر عزیز"}</CardTitle>
                <div className="flex items-center justify-center gap-2 text-muted-foreground text-sm dir-ltr">
                  <Mail className="w-3 h-3" />
                  <span>{user.email}</span>
                </div>
              </div>
            </div>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="flex items-center gap-3 p-3 rounded-xl bg-muted/50 border border-border/50">
                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
                  <Calendar className="w-5 h-5" />
                </div>
                <div className="space-y-0.5">
                  <p className="text-xs text-muted-foreground">تاریخ عضویت</p>
                  <p className="text-sm font-medium">{joinDate}</p>
                </div>
              </div>

              <div className="flex items-center gap-3 p-3 rounded-xl bg-muted/50 border border-border/50">
                <div className="w-10 h-10 rounded-lg bg-blue-500/10 flex items-center justify-center text-blue-500">
                  <Clock className="w-5 h-5" />
                </div>
                <div className="space-y-0.5">
                  <p className="text-xs text-muted-foreground">آخرین ورود</p>
                  <p className="text-sm font-medium">{lastSignIn}</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Security & Session Info */}
        <Card className="border-border/50 shadow-md">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Shield className="w-5 h-5 text-green-500" />
              اطلاعات امنیتی و نشست
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between p-4 rounded-xl border border-border/50 hover:bg-muted/30 transition-colors">
              <div className="flex items-center gap-3">
                <Smartphone className="w-5 h-5 text-muted-foreground" />
                <div className="space-y-0.5">
                  <p className="text-sm font-medium">دستگاه فعلی</p>
                  <p className="text-xs text-muted-foreground">شما در حال حاضر با این دستگاه وارد شده‌اید</p>
                </div>
              </div>
              <div className="h-2 w-2 rounded-full bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.5)]" />
            </div>

            <LogoutButton />
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
