import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { Link } from "react-router-dom"
import { toast } from "sonner"
import { ArrowLeft } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Separator } from "@/components/ui/separator"

const schema = z.object({
  email: z.string().min(1, "Email é obrigatório").email("Email inválido"),
})

type ResetValues = z.infer<typeof schema>

export function ResetPasswordForm() {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ResetValues>({ resolver: zodResolver(schema) })

  const onSubmit = async (_data: ResetValues) => {
    await new Promise((r) => setTimeout(r, 600))
    toast.success("Se este email existir, enviaremos instruções.")
  }

  return (
    <div className="w-full rounded-2xl border bg-white shadow-sm flex flex-col">
      {/* Header */}
      <div className="flex flex-col items-center gap-4 px-8 pt-8 pb-6 border-b border-border">
        <div className="flex items-center gap-2">
          <img src="/logo.png" alt="AdotePet logo" width={48} height={48} className="rounded-lg object-contain" />
          <span className="text-xl font-bold text-[#3B0270]">AdotePet</span>
        </div>
        <div className="text-center">
          <h1 className="text-lg font-bold">Recuperar senha</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Você receberá um email com instruções.
          </p>
        </div>
      </div>

      {/* Form body */}
      <form onSubmit={handleSubmit(onSubmit)} noValidate className="flex flex-col gap-4 px-8 py-8">
        {/* Email */}
        <div className="flex flex-col gap-2">
          <label htmlFor="reset-email" className="text-sm font-medium">
            Email
          </label>
          <Input
            id="reset-email"
            type="email"
            placeholder="seu@email.com"
            autoComplete="email"
            aria-invalid={!!errors.email}
            aria-describedby={errors.email ? "reset-email-error" : undefined}
            className="h-10 rounded-lg"
            {...register("email")}
          />
          {errors.email && (
            <p id="reset-email-error" className="text-xs text-destructive" role="alert">
              {errors.email.message}
            </p>
          )}
        </div>

        <Button
          type="submit"
          className="w-full h-10 rounded-lg bg-[#3B0270] hover:bg-[#2d0254] text-white mt-2"
          disabled={isSubmitting}
        >
          {isSubmitting ? "Enviando…" : "Enviar link de redefinição"}
        </Button>

        <Separator />

        <Button variant="ghost" asChild className="w-full h-10 rounded-lg gap-2">
          <Link to="/login">
            <ArrowLeft className="h-4 w-4" />
            Voltar para login
          </Link>
        </Button>
      </form>
    </div>
  )
}
