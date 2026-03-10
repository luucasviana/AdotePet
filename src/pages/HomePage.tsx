import { useNavigate } from "react-router-dom"
import { toast } from "sonner"
import { LogOut, CheckCircle2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useAuth } from "@/context/AuthContext"

export function HomePage() {
  const { user, signOut } = useAuth()
  const navigate = useNavigate()

  const handleSignOut = async () => {
    await signOut()
    toast.success("Você saiu da conta.")
    navigate("/login")
  }

  return (
    <div className="min-h-screen w-full bg-slate-50 flex items-center justify-center p-8">
      <div className="flex flex-col items-center gap-6 text-center">
        <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-[#3B0270]/10">
          <CheckCircle2 className="h-8 w-8 text-[#3B0270]" />
        </div>

        <div className="flex flex-col gap-2">
          <h1 className="text-2xl font-bold text-[#3B0270]">Você está logado! 🐾</h1>
          {user?.email && (
            <p className="text-sm text-muted-foreground">{user.email}</p>
          )}
        </div>

        <Button
          onClick={handleSignOut}
          variant="outline"
          className="h-10 rounded-lg gap-2 border border-[#3B0270]/20 text-[#3B0270] hover:bg-[#3B0270]/5"
        >
          <LogOut className="h-4 w-4" />
          Deslogar
        </Button>
      </div>
    </div>
  )
}
