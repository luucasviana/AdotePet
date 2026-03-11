import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom"
import { LandingPage } from "@/pages/LandingPage"
import { LoginPage } from "@/pages/LoginPage"
import { CadastroPage } from "@/pages/CadastroPage"
import { ResetSenhaPage } from "@/pages/ResetSenhaPage"
import { GuestRoute } from "@/components/auth/GuestRoute"
import { ProtectedRoute } from "@/components/auth/ProtectedRoute"
import { AuthLayout } from "@/components/layout/AuthLayout"
import { HomePage } from "@/pages/HomePage"
import { PJPetsPage } from "@/pages/pj/PJPetsPage"
import { PJAdocoesPage } from "@/pages/pj/PJAdocoesPage"
import { PJConfiguracoesPage } from "@/pages/pj/PJConfiguracoesPage"

/**
 * Roteamento da aplicação AdotePet.
 *
 * Área autenticada: tudo sob /home/* com AuthLayout único.
 * A HomePage detecta o userType e renderiza a view correta (PF | PJ | ADMIN).
 * Não existem rotas separadas por tipo de usuário para a Home.
 */
export function AppRouter() {
  return (
    <BrowserRouter>
      <Routes>
        {/* ── Rotas públicas ── */}
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={
          <GuestRoute><LoginPage /></GuestRoute>
        } />
        <Route path="/cadastro" element={
          <GuestRoute><CadastroPage /></GuestRoute>
        } />
        <Route path="/reset-senha" element={<ResetSenhaPage />} />

        {/* ── Área autenticada (todos os tipos de usuário) ── */}
        <Route
          path="/home"
          element={
            <ProtectedRoute>
              <AuthLayout />
            </ProtectedRoute>
          }
        >
          {/* /home → HomePage (hub condicional por userType) */}
          <Route index element={<HomePage />} />

          {/* Funcionalidades PJ */}
          <Route path="pets"          element={<PJPetsPage />} />
          <Route path="adocoes"       element={<PJAdocoesPage />} />
          <Route path="configuracoes" element={<PJConfiguracoesPage />} />
        </Route>

        {/* Redirect de rotas legadas */}
        <Route path="/pj/*"  element={<Navigate to="/home" replace />} />
        <Route path="*"      element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  )
}
