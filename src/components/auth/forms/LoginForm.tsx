import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { Link, useNavigate } from "react-router-dom"
import { toast } from "sonner"
import { ChromeIcon } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Separator } from "@/components/ui/separator"
import { supabase } from "@/lib/supabase"
import { NavigationLoader } from "@/components/shared/NavigationLoader"

const schema = z.object({
  email: z.string().min(1, "Email é obrigatório").email("Email inválido"),
  password: z.string().min(6, "Senha deve ter no mínimo 6 caracteres"),
})

type LoginValues = z.infer<typeof schema>

export function LoginForm() {
  const navigate = useNavigate()
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginValues>({ resolver: zodResolver(schema) })

  const onSubmit = async (data: LoginValues) => {
    const { error } = await supabase.auth.signInWithPassword({
      email: data.email,
      password: data.password,
    })

    if (error) {
      if (error.message.includes("Invalid login credentials")) {
        toast.error("Email ou senha incorretos.")
      } else if (error.message.includes("Email not confirmed")) {
        toast.warning("Confirme seu email antes de entrar. Verifique sua caixa de entrada.")
      } else {
        toast.error(error.message)
      }
      return
    }

    toast.success("Login realizado com sucesso!")
    navigate("/home")
  }

  const handleGoogle = async () => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${window.location.origin}/home`,
      },
    })
    if (error) toast.error("Erro ao iniciar login com Google: " + error.message)
  }

  return (
    <>
      {isSubmitting && <NavigationLoader />}
      <div className="w-full rounded-2xl border bg-white shadow-sm flex flex-col">
      {/* Header */}
      <div className="flex flex-col items-center gap-4 px-8 pt-8 pb-6 border-b border-border">
        <div className="flex items-center gap-2">
          <img src="/logo.png" alt="AdotePet logo" width={48} height={48} className="rounded-lg object-contain" />
          <span className="text-xl font-bold text-[#3B0270]">AdotePet</span>
        </div>
        <p className="text-sm text-muted-foreground text-center">Bem-vindo(a) de volta! 🐾</p>

        {/* Tabs login / cadastro */}
        <Tabs value="login" className="w-full">
          <TabsList className="w-full h-10 rounded-lg bg-muted">
            <TabsTrigger
              value="login"
              className="flex-1 rounded-lg data-[state=active]:bg-[#3B0270] data-[state=active]:text-white"
            >
              Entrar
            </TabsTrigger>
            <TabsTrigger
              value="cadastro"
              className="flex-1 rounded-lg"
              onClick={() => navigate("/cadastro")}
            >
              Cadastrar
            </TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      {/* Form body */}
      <form onSubmit={handleSubmit(onSubmit)} noValidate className="flex flex-col gap-4 px-8 py-8">

        {/* Email */}
        <div className="flex flex-col gap-2">
          <label htmlFor="login-email" className="text-sm font-medium">
            Email
          </label>
          <Input
            id="login-email"
            type="email"
            placeholder="seu@email.com"
            autoComplete="email"
            aria-invalid={!!errors.email}
            aria-describedby={errors.email ? "login-email-error" : undefined}
            className="h-10 rounded-lg"
            {...register("email")}
          />
          {errors.email && (
            <p id="login-email-error" className="text-xs text-destructive" role="alert">
              {errors.email.message}
            </p>
          )}
        </div>

        {/* Password */}
        <div className="flex flex-col gap-2">
          <div className="flex items-center justify-between">
            <label htmlFor="login-password" className="text-sm font-medium">
              Senha
            </label>
            <Link
              to="/reset-senha"
              className="text-xs text-[#3B0270] hover:underline font-medium"
            >
              Esqueci minha senha
            </Link>
          </div>
          <Input
            id="login-password"
            type="password"
            autoComplete="current-password"
            aria-invalid={!!errors.password}
            aria-describedby={errors.password ? "login-password-error" : undefined}
            className="h-10 rounded-lg"
            {...register("password")}
          />
          {errors.password && (
            <p id="login-password-error" className="text-xs text-destructive" role="alert">
              {errors.password.message}
            </p>
          )}
        </div>

        <Button
          type="submit"
          className="w-full h-10 rounded-lg bg-[#3B0270] hover:bg-[#2d0254] text-white mt-2"
          disabled={isSubmitting}
        >
          {isSubmitting ? "Entrando…" : "Entrar"}
        </Button>

        <div className="flex items-center gap-4">
          <Separator className="flex-1" />
          <span className="text-xs text-muted-foreground">ou</span>
          <Separator className="flex-1" />
        </div>

        {/* Google button */}
        <Button
          type="button"
          variant="outline"
          className="w-full h-10 rounded-lg gap-2 border"
          onClick={handleGoogle}
        >
          <ChromeIcon className="h-4 w-4" />
          Entrar com conta Google
        </Button>
      </form>
    </div>
    </>
  )
}
