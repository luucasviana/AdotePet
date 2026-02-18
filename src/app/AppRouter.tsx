import { BrowserRouter, Routes, Route } from "react-router-dom"
import { LandingPage } from "@/pages/LandingPage"
import { LoginPage } from "@/pages/LoginPage"
import { CadastroPage } from "@/pages/CadastroPage"
import { ResetSenhaPage } from "@/pages/ResetSenhaPage"

export function AppRouter() {
    return (
        <BrowserRouter>
            <Routes>
                <Route path="/" element={<LandingPage />} />
                <Route path="/login" element={<LoginPage />} />
                <Route path="/cadastro" element={<CadastroPage />} />
                <Route path="/reset-senha" element={<ResetSenhaPage />} />
            </Routes>
        </BrowserRouter>
    )
}
