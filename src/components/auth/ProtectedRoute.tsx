import { Navigate } from "react-router-dom"
import type { ReactNode } from "react"
import { useAuth } from "@/context/AuthContext"

interface ProtectedRouteProps {
  children: ReactNode
  redirectTo?: string
}

/**
 * Protege rotas autenticadas.
 * Redireciona para /login se não houver sessão ativa.
 * Exibe spinner enquanto o estado de auth carrega.
 */
export function ProtectedRoute({
  children,
  redirectTo = "/login",
}: ProtectedRouteProps) {
  const { user, loading } = useAuth()

  if (loading) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-slate-50">
        <div className="flex flex-col items-center gap-4">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-[#3B0270]/20 border-t-[#3B0270]" />
          <p className="text-sm text-muted-foreground font-medium">Carregando…</p>
        </div>
      </div>
    )
  }

  if (!user) {
    return <Navigate to={redirectTo} replace />
  }

  return <>{children}</>
}
