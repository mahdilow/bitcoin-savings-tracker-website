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
  try {
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      throw new Error("Unauthorized")
    }

    const adminAuthClient = createAdminClient()

    // Check if there are other sessions to terminate
    const sessionCount = await getSessionCount()
    if (sessionCount <= 1) {
      // If only 1 session (current), strictly speaking we are just logging out.
      // But the UI usually disables the button if count <= 1.
      // If we are here, maybe the count was stale.
      // We'll proceed with signOut anyway as it achieves the goal (terminating sessions for this user).
    }

    // Sign out the user from all devices by invalidating all refresh tokens
    const { error } = await adminAuthClient.auth.admin.signOut(user.id)

    if (error) {
      console.error("Supabase Admin SignOut Error:", error)
      throw new Error(`Failed to terminate sessions: ${error.message}`)
    }

    // Revalidate to reflect changes (though user will be signed out eventually)
    revalidatePath("/account")

    return { success: true }
  } catch (error: any) {
    console.error("Unexpected error in terminateAllSessions:", error)
    throw new Error(error.message || "Failed to terminate sessions")
  }
}

export async function getSessionCount() {
  const supabase = await createClient()

  const { data, error } = await supabase.rpc("get_active_session_count")

  if (error) {
    console.error("Error fetching session count:", error)
    // Fallback to 1 if we can't count (assume current session exists)
    return 1
  }

  return data as number
}
