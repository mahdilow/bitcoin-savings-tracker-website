"use server"

import { createClient } from "@/lib/supabase/server"
import { createAdminClient } from "@/lib/supabase/admin"
import { revalidatePath } from "next/cache"

export async function deleteAccount() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    throw new Error("Unauthorized")
  }

  const adminAuthClient = createAdminClient()

  // 1. Delete user data from public schema (Purchases are cascade deleted usually, but let's be explicit if needed)
  // Note: RLS policies usually handle this, or ON DELETE CASCADE on foreign keys.
  // However, to be safe and strict, we delete the public user record.
  const { error: dbError } = await adminAuthClient.from("users").delete().eq("id", user.id)

  if (dbError) {
    console.error("Error deleting user data:", dbError)
    throw new Error("Failed to delete user data")
  }

  // 2. Delete user from Auth (This invalidates all sessions)
  const { error: authError } = await adminAuthClient.auth.admin.deleteUser(user.id)

  if (authError) {
    console.error("Error deleting auth user:", authError)
    throw new Error("Failed to delete account")
  }

  // 3. Sign out locally to clear cookies
  await supabase.auth.signOut()

  return { success: true }
}

export async function terminateAllSessions() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    throw new Error("Unauthorized")
  }

  const adminAuthClient = createAdminClient()

  // Sign out the user from all devices by invalidating all refresh tokens
  const { error } = await adminAuthClient.auth.admin.signOut(user.id)

  if (error) {
    console.error("Error terminating sessions:", error)
    throw new Error("Failed to terminate sessions")
  }

  // Revalidate to reflect changes (though user will be signed out eventually)
  revalidatePath("/account")

  return { success: true }
}
