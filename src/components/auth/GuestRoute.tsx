import { Navigate } from "react-router-dom"
import type { ReactNode } from "react"
import { useAuth } from "@/context/AuthContext"

/**
 * Wraps routes that should only be accessible to guests (not logged in).
 * If the user is already authenticated, redirects to /home.
 * Shows nothing while the session is loading to avoid flash.
 */
export function GuestRoute({ children }: { children: ReactNode }) {
  const { user, loading } = useAuth()

  if (loading) return null

  if (user) return <Navigate to="/home" replace />

  return <>{children}</>
}
