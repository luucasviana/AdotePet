import { Outlet, useLocation } from "react-router-dom"
import { useEffect, useState } from "react"
import { AppSidebar } from "@/components/layout/AppSidebar"

/**
 * Layout base único para toda a área autenticada.
 * Renderiza a AppSidebar à esquerda e o <Outlet> à direita.
 * Utilizado por todos os tipos de usuário (PF, PJ, ADMIN).
 *
 * Nota: useNavigation() requer createBrowserRouter (data router mode).
 * Como o projeto usa BrowserRouter, usamos useLocation + useState para o loading bar.
 */
export function AuthLayout() {
  const location = useLocation()
  const [isNavigating, setIsNavigating] = useState(false)

  useEffect(() => {
    setIsNavigating(true)
    const timer = setTimeout(() => setIsNavigating(false), 300)
    return () => clearTimeout(timer)
  }, [location.pathname])

  return (
    <div className="flex h-screen w-full overflow-hidden bg-slate-50">
      {/* Sidebar única adaptável */}
      <AppSidebar />

      {/* Área de conteúdo principal */}
      <main
        className="relative flex flex-1 flex-col overflow-y-auto"
        aria-label="Área de conteúdo principal"
      >
        {/* Barra de loading ao trocar de rota */}
        {isNavigating && (
          <div
            role="status"
            aria-label="Carregando página"
            className="absolute inset-x-0 top-0 z-50 h-[2px] overflow-hidden"
          >
            <div className="h-full w-full animate-pulse bg-gradient-to-r from-[#3B0270]/60 via-[#3B0270] to-[#3B0270]/60" />
          </div>
        )}

        <Outlet />
      </main>
    </div>
  )
}
