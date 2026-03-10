import { BrowserRouter, Routes, Route } from "react-router-dom"
import { LandingPage } from "@/pages/LandingPage"
import { LoginPage } from "@/pages/LoginPage"
import { CadastroPage } from "@/pages/CadastroPage"
import { ResetSenhaPage } from "@/pages/ResetSenhaPage"
import { HomePage } from "@/pages/HomePage"
import { GuestRoute } from "@/components/auth/GuestRoute"

export function AppRouter() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/home" element={<HomePage />} />
        <Route path="/login" element={
          <GuestRoute><LoginPage /></GuestRoute>
        } />
        <Route path="/cadastro" element={
          <GuestRoute><CadastroPage /></GuestRoute>
        } />
        <Route path="/reset-senha" element={<ResetSenhaPage />} />
      </Routes>
    </BrowserRouter>
  )
}

