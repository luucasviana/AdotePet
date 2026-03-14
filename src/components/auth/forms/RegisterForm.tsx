import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { toast } from "sonner"
import { ChromeIcon, CalendarIcon } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { Separator } from "@/components/ui/separator"
import { supabase } from "@/lib/supabase"
import { NavigationLoader } from "@/components/shared/NavigationLoader"

import { maskCPF, maskCNPJ, unmask } from "@/lib/mask"

// ─── Zod schemas ─────────────────────────────────────────────────────────────

const pfSchema = z
  .object({
    nomeCompleto: z.string().min(1, "Nome é obrigatório"),
    email: z.string().min(1, "Email é obrigatório").email("Email inválido"),
    dataNascimento: z.string().min(1, "Data de nascimento é obrigatória"),
    cpf: z
      .string()
      .optional()
      .refine((v) => !v || unmask(v).length === 11, "CPF deve ter 11 dígitos numéricos"),
    senha: z.string().min(6, "Senha deve ter no mínimo 6 caracteres"),
    confirmarSenha: z.string().min(1, "Confirme a senha"),
  })
  .refine((d) => d.senha === d.confirmarSenha, {
    message: "As senhas não coincidem",
    path: ["confirmarSenha"],
  })

const pjSchema = z
  .object({
    email: z.string().min(1, "Email é obrigatório").email("Email inválido"),
    cnpj: z
      .string()
      .refine((v) => unmask(v).length === 14, "CNPJ deve ter 14 dígitos"),
    nomeOrganizacao: z.string().min(1, "Nome da empresa é obrigatório"),
    nomeFantasia: z.string().optional(),
    tipoOrganizacao: z.string().min(1, "Tipo de organização é obrigatório"),
    senha: z.string().min(6, "Senha deve ter no mínimo 6 caracteres"),
    confirmarSenha: z.string().min(1, "Confirme a senha"),
  })
  .refine((d) => d.senha === d.confirmarSenha, {
    message: "As senhas não coincidem",
    path: ["confirmarSenha"],
  })

type PfValues = z.infer<typeof pfSchema>
type PjValues = z.infer<typeof pjSchema>

const TIPOS_ORGANIZACAO = [
  "ONG",
  "Abrigo",
  "Órgão Municipal",
  "Clínica Veterinária",
  "Veterinário Autônomo",
  "Pet Shop",
  "Banho e Tosa",
  "Casa de Ração",
  "Casa Agrícola",
  "Pet Walker",
  "Pet Sitter / Hotel / Creche",
  "Adestrador",
  "Protetor Independente / Resgatista",
  "Outro",
]

// ─── PF Form ─────────────────────────────────────────────────────────────────

function PfForm() {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<PfValues>({ resolver: zodResolver(pfSchema) })

  useEffect(() => {
    return () => reset()
  }, [reset])

  const onSubmit = async (data: PfValues) => {
    const { error } = await supabase.auth.signUp({
      email: data.email,
      password: data.senha,
      options: {
        data: {
          tipo: "pf",
          nome_completo: data.nomeCompleto,
          data_nascimento: data.dataNascimento,
          cpf: data.cpf ? unmask(data.cpf) : null,
        },
      },
    })

    if (error) {
      if (error.message.includes("already registered")) {
        toast.error("Este email já está cadastrado. Tente fazer login.")
      } else {
        toast.error(error.message)
      }
      return
    }

    toast.success("Conta criada! Verifique seu email para confirmar o cadastro.")
    reset()
  }

  return (
    <>
      {isSubmitting && <NavigationLoader />}
      <form onSubmit={handleSubmit(onSubmit)} noValidate autoComplete="off" className="flex flex-col gap-4">
        {/* Nome */}
        <div className="flex flex-col gap-2">
          <label htmlFor="pf-nome" className="text-sm font-medium">Nome completo</label>
          <Input id="pf-nome" placeholder="Seu nome completo" className="h-10 rounded-lg"
            autoComplete="off"
            aria-invalid={!!errors.nomeCompleto}
            aria-describedby={errors.nomeCompleto ? "pf-nome-error" : undefined}
            {...register("nomeCompleto")} />
          {errors.nomeCompleto && <p id="pf-nome-error" className="text-xs text-destructive" role="alert">{errors.nomeCompleto.message}</p>}
        </div>

        {/* Email */}
        <div className="flex flex-col gap-2">
          <label htmlFor="pf-email" className="text-sm font-medium">Email</label>
          <Input id="pf-email" type="email" placeholder="seu@email.com" className="h-10 rounded-lg"
            autoComplete="off"
            aria-invalid={!!errors.email}
            aria-describedby={errors.email ? "pf-email-error" : undefined}
            {...register("email")} />
          {errors.email && <p id="pf-email-error" className="text-xs text-destructive" role="alert">{errors.email.message}</p>}
        </div>

        {/* Data nascimento */}
        <div className="flex flex-col gap-2">
          <label htmlFor="pf-dob" className="text-sm font-medium">Data de nascimento</label>
        <div className="relative">
          <Input id="pf-dob" type="date" className="h-10 rounded-lg pr-10" autoComplete="off"
            aria-invalid={!!errors.dataNascimento}
            aria-describedby={errors.dataNascimento ? "pf-dob-error" : undefined}
            {...register("dataNascimento")} />
          <CalendarIcon className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" aria-hidden />
        </div>
          {errors.dataNascimento && <p id="pf-dob-error" className="text-xs text-destructive" role="alert">{errors.dataNascimento.message}</p>}
        </div>

        {/* CPF (opcional) */}
        <div className="flex flex-col gap-2">
          <label htmlFor="pf-cpf" className="text-sm font-medium">CPF <span className="text-muted-foreground font-normal">(opcional)</span></label>
          <Input id="pf-cpf" placeholder="000.000.000-00" maxLength={14} className="h-10 rounded-lg"
            autoComplete="off"
            aria-invalid={!!errors.cpf}
            aria-describedby={errors.cpf ? "pf-cpf-error" : undefined}
            {...register("cpf", {
              onChange: (e) => {
                e.target.value = maskCPF(e.target.value)
              }
            })} />
          {errors.cpf && <p id="pf-cpf-error" className="text-xs text-destructive" role="alert">{errors.cpf.message}</p>}
        </div>

        {/* Senha */}
        <div className="flex flex-col gap-2">
          <label htmlFor="pf-senha" className="text-sm font-medium">Senha</label>
          <Input id="pf-senha" type="password" className="h-10 rounded-lg"
            autoComplete="new-password"
            aria-invalid={!!errors.senha}
            aria-describedby={errors.senha ? "pf-senha-error" : undefined}
            {...register("senha")} />
          {errors.senha && <p id="pf-senha-error" className="text-xs text-destructive" role="alert">{errors.senha.message}</p>}
        </div>

        {/* Confirmar senha */}
        <div className="flex flex-col gap-2">
          <label htmlFor="pf-confirmar" className="text-sm font-medium">Confirmar senha</label>
          <Input id="pf-confirmar" type="password" className="h-10 rounded-lg"
            autoComplete="new-password"
            aria-invalid={!!errors.confirmarSenha}
            aria-describedby={errors.confirmarSenha ? "pf-confirmar-error" : undefined}
            {...register("confirmarSenha")} />
          {errors.confirmarSenha && <p id="pf-confirmar-error" className="text-xs text-destructive" role="alert">{errors.confirmarSenha.message}</p>}
        </div>

        <Button type="submit" className="w-full h-10 rounded-lg bg-[#3B0270] hover:bg-[#2d0254] text-white mt-2" disabled={isSubmitting}>
          {isSubmitting ? "Criando conta…" : "Criar conta"}
        </Button>
      </form>
    </>
  )
}

// ─── PJ Form ─────────────────────────────────────────────────────────────────

function PjForm() {
  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<PjValues>({ resolver: zodResolver(pjSchema) })

  useEffect(() => {
    return () => reset()
  }, [reset])

  const [isFetchingCnpj, setIsFetchingCnpj] = useState(false)
  const [cnpjError, setCnpjError] = useState<string | null>(null)

  const cnpjValue = watch("cnpj")

  // Auto-fetch company info from Brasil API when CNPJ has 14 digits
  useEffect(() => {
    const unmaskedCnpj = unmask(cnpjValue || "")

    if (!unmaskedCnpj || unmaskedCnpj.length !== 14) {
      if (unmaskedCnpj && unmaskedCnpj.length < 14) {
        setValue("nomeOrganizacao", "")
        setValue("nomeFantasia", "")
        setCnpjError(null)
      }
      return
    }

    const timer = setTimeout(async () => {
      setIsFetchingCnpj(true)
      setCnpjError(null)
      try {
        const res = await fetch(`https://brasilapi.com.br/api/cnpj/v1/${unmaskedCnpj}`)
        if (!res.ok) throw new Error("CNPJ não encontrado")
        const data = await res.json()
        setValue("nomeOrganizacao", data.razao_social ?? "", { shouldValidate: true })
        setValue("nomeFantasia", data.nome_fantasia ?? "", { shouldValidate: true })
      } catch {
        setCnpjError("CNPJ não encontrado na Receita Federal.")
        setValue("nomeOrganizacao", "")
        setValue("nomeFantasia", "")
      } finally {
        setIsFetchingCnpj(false)
      }
    }, 600)

    return () => clearTimeout(timer)
  }, [cnpjValue, setValue])

  const onSubmit = async (data: PjValues) => {
    const { error } = await supabase.auth.signUp({
      email: data.email,
      password: data.senha,
      options: {
        data: {
          tipo: "pj",
          cnpj: unmask(data.cnpj),
          nome_organizacao: data.nomeOrganizacao,
          nome_fantasia: data.nomeFantasia ?? null,
          tipo_organizacao: data.tipoOrganizacao,
        },
      },
    })

    if (error) {
      if (error.message.includes("already registered")) {
        toast.error("Este email já está cadastrado. Tente fazer login.")
      } else {
        toast.error(error.message)
      }
      return
    }

    toast.success("Conta criada! Verifique seu email para confirmar o cadastro.")
    reset()
  }

  return (
    <>
      {isSubmitting && <NavigationLoader />}
      <form onSubmit={handleSubmit(onSubmit)} noValidate autoComplete="off" className="flex flex-col gap-4">
        {/* Email */}
        <div className="flex flex-col gap-2">
          <label htmlFor="pj-email" className="text-sm font-medium">Email</label>
          <Input id="pj-email" type="email" placeholder="contato@empresa.com.br" className="h-10 rounded-lg"
            autoComplete="off"
            aria-invalid={!!errors.email}
            aria-describedby={errors.email ? "pj-email-error" : undefined}
            {...register("email")} />
          {errors.email && <p id="pj-email-error" className="text-xs text-destructive" role="alert">{errors.email.message}</p>}
        </div>

        {/* CNPJ */}
        <div className="flex flex-col gap-2">
          <label htmlFor="pj-cnpj" className="text-sm font-medium">CNPJ</label>
          <div className="relative">
            <Input id="pj-cnpj" placeholder="00.000.000/0000-00" maxLength={18}
              autoComplete="off"
              className={`h-10 rounded-lg pr-10 ${isFetchingCnpj ? "opacity-70" : ""}`}
              aria-invalid={!!errors.cnpj || !!cnpjError}
              aria-describedby={errors.cnpj ? "pj-cnpj-error" : cnpjError ? "pj-cnpj-api-error" : undefined}
              {...register("cnpj", {
                onChange: (e) => {
                  e.target.value = maskCNPJ(e.target.value)
                }
              })} />
            {isFetchingCnpj && (
              <div className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 rounded-full border-2 border-[#3B0270]/30 border-t-[#3B0270] animate-spin" />
            )}
          </div>
          {errors.cnpj && <p id="pj-cnpj-error" className="text-xs text-destructive" role="alert">{errors.cnpj.message}</p>}
          {cnpjError && <p id="pj-cnpj-api-error" className="text-xs text-destructive" role="alert">{cnpjError}</p>}
        </div>

        {/* Nome da Empresa (readonly — preenchido pela API) */}
        <div className="flex flex-col gap-2">
          <label htmlFor="pj-nome" className="text-sm font-medium">
            Razão Social
            <span className="ml-2 text-xs text-muted-foreground font-normal">(preenchido pelo CNPJ)</span>
          </label>
          <Input id="pj-nome" placeholder="Preenchido automaticamente" className="h-10 rounded-lg bg-muted/50 cursor-not-allowed"
            readOnly
            autoComplete="off"
            aria-readonly="true"
            aria-invalid={!!errors.nomeOrganizacao}
            aria-describedby={errors.nomeOrganizacao ? "pj-nome-error" : undefined}
            {...register("nomeOrganizacao")} />
          {errors.nomeOrganizacao && <p id="pj-nome-error" className="text-xs text-destructive" role="alert">{errors.nomeOrganizacao.message}</p>}
        </div>

        {/* Nome Fantasia (editável — pré-preenchido pela API) */}
        <div className="flex flex-col gap-2">
          <label htmlFor="pj-fantasia" className="text-sm font-medium">
            Nome Fantasia
            <span className="ml-2 text-xs text-muted-foreground font-normal">(opcional, editável)</span>
          </label>
          <Input id="pj-fantasia" placeholder="Nome fantasia da empresa" className="h-10 rounded-lg"
            autoComplete="off"
            {...register("nomeFantasia")} />
        </div>

        {/* Tipo de organização */}
        <div className="flex flex-col gap-2">
          <label htmlFor="pj-tipo" className="text-sm font-medium">Tipo de organização</label>
          <Select onValueChange={(v) => setValue("tipoOrganizacao", v, { shouldValidate: true })}>
            <SelectTrigger id="pj-tipo" className="h-10 rounded-lg" aria-label="Tipo de organização">
              <SelectValue placeholder="Selecione o tipo" />
            </SelectTrigger>
            <SelectContent>
              {TIPOS_ORGANIZACAO.map((tipo) => (
                <SelectItem key={tipo} value={tipo}>{tipo}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          {errors.tipoOrganizacao && <p className="text-xs text-destructive" role="alert">{errors.tipoOrganizacao.message}</p>}
        </div>

        {/* Senha */}
        <div className="flex flex-col gap-2">
          <label htmlFor="pj-senha" className="text-sm font-medium">Senha</label>
          <Input id="pj-senha" type="password" className="h-10 rounded-lg"
            autoComplete="new-password"
            aria-invalid={!!errors.senha}
            aria-describedby={errors.senha ? "pj-senha-error" : undefined}
            {...register("senha")} />
          {errors.senha && <p id="pj-senha-error" className="text-xs text-destructive" role="alert">{errors.senha.message}</p>}
        </div>

        {/* Confirmar senha */}
        <div className="flex flex-col gap-2">
          <label htmlFor="pj-confirmar" className="text-sm font-medium">Confirmar senha</label>
          <Input id="pj-confirmar" type="password" className="h-10 rounded-lg"
            autoComplete="new-password"
            aria-invalid={!!errors.confirmarSenha}
            aria-describedby={errors.confirmarSenha ? "pj-confirmar-error" : undefined}
            {...register("confirmarSenha")} />
          {errors.confirmarSenha && <p id="pj-confirmar-error" className="text-xs text-destructive" role="alert">{errors.confirmarSenha.message}</p>}
        </div>

        <Button type="submit" className="w-full h-10 rounded-lg bg-[#3B0270] hover:bg-[#2d0254] text-white mt-2" disabled={isSubmitting}>
          {isSubmitting ? "Criando conta…" : "Criar conta"}
        </Button>
      </form>
    </>
  )
}

// ─── RegisterForm (wrapper) ───────────────────────────────────────────────────

export function RegisterForm() {
  const navigate = useNavigate()
  const [tipo, setTipo] = useState<"pf" | "pj">("pf")

  const handleGoogle = async () => {
    // Safety guard — Google signup is PF only
    if (tipo !== "pf") {
      toast.error("Cadastro com Google disponível apenas para Pessoa Física.")
      return
    }

    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${window.location.origin}/home`,
        // All Google accounts are registered as PF
        queryParams: { account_type: "pf" },
      },
    })
    if (error) toast.error("Erro ao iniciar cadastro com Google: " + error.message)
  }

  return (
    <div className="w-full rounded-2xl border bg-white shadow-sm flex flex-col">
      {/* Header */}
      <div className="flex flex-col items-center gap-4 px-8 pt-8 pb-6 border-b border-border">
        <div className="flex items-center gap-2">
          <img src="/logo.png" alt="AdotePet logo" width={48} height={48} className="rounded-lg object-contain" />
          <span className="text-xl font-bold text-[#3B0270]">AdotePet</span>
        </div>
        <p className="text-sm text-muted-foreground">Crie sua conta e comece a ajudar 🐾</p>

        {/* Tabs login / cadastro */}
        <Tabs value="cadastro" className="w-full">
          <TabsList className="w-full h-10 rounded-lg bg-muted">
            <TabsTrigger
              value="login"
              className="flex-1 rounded-lg"
              onClick={() => navigate("/login")}
            >
              Entrar
            </TabsTrigger>
            <TabsTrigger
              value="cadastro"
              className="flex-1 rounded-lg data-[state=active]:bg-[#3B0270] data-[state=active]:text-white"
            >
              Cadastrar
            </TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      {/* Form body */}
      <div className="flex flex-col gap-4 px-8 py-8">

        {/* PF / PJ toggle */}
        <Tabs value={tipo} onValueChange={(v) => setTipo(v as "pf" | "pj")} className="w-full">
          <TabsList className="w-full h-10 rounded-lg bg-muted mb-4">
            <TabsTrigger
              value="pf"
              className="flex-1 rounded-lg data-[state=active]:bg-[#3B0270] data-[state=active]:text-white"
            >
              Pessoa Física
            </TabsTrigger>
            <TabsTrigger
              value="pj"
              className="flex-1 rounded-lg data-[state=active]:bg-[#3B0270] data-[state=active]:text-white"
            >
              Pessoa Jurídica
            </TabsTrigger>
          </TabsList>

          <TabsContent value="pf">
            <PfForm />
          </TabsContent>

          <TabsContent value="pj">
            <PjForm />
          </TabsContent>
        </Tabs>

        {/* Google — PF only */}
        {tipo === "pf" && (
          <>
            <div className="flex items-center gap-4">
              <Separator className="flex-1" />
              <span className="text-xs text-muted-foreground">ou</span>
              <Separator className="flex-1" />
            </div>

            <Button
              type="button"
              variant="outline"
              className="w-full h-10 rounded-lg gap-2 border"
              onClick={handleGoogle}
            >
              <ChromeIcon className="h-4 w-4" />
              Cadastrar com conta Google
            </Button>
          </>
        )}
      </div>
    </div>
  )
}
