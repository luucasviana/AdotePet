import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import { AppRouter } from './app/AppRouter'
import { Toaster } from 'sonner'
import { AuthProvider } from './context/AuthContext'
import { ProfileProvider } from './context/ProfileContext'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <AuthProvider>
      <ProfileProvider>
        <AppRouter />
        <Toaster richColors position="top-center" />
      </ProfileProvider>
    </AuthProvider>
  </StrictMode>,
)

