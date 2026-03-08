import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { toast } from "sonner"
import { ChromeIcon } from "lucide-react"

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

// ─── Zod schemas ────────────────────────────────────────────────────────────

const cpfPattern = /^\d{11}$/

const pfSchema = z
  .object({
    nomeCompleto: z.string().min(1, "Nome é obrigatório"),
    email: z.string().min(1, "Email é obrigatório").email("Email inválido"),
    dataNascimento: z.string().min(1, "Data de nascimento é obrigatória"),
    cpf: z
      .string()
      .optional()
      .refine((v) => !v || cpfPattern.test(v), "CPF deve ter 11 dígitos numéricos"),
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
      .min(14, "CNPJ deve ter 14 dígitos")
      .max(14, "CNPJ deve ter 14 dígitos")
      .regex(/^\d+$/, "CNPJ deve conter apenas números"),
    nomeOrganizacao: z.string().min(1, "Nome da organização é obrigatório"),
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

// ─── PF Form ────────────────────────────────────────────────────────────────

function PfForm() {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<PfValues>({ resolver: zodResolver(pfSchema) })

  const onSubmit = async (_data: PfValues) => {
    await new Promise((r) => setTimeout(r, 600))
    toast.success("Cadastro simulado. Integração será adicionada.")
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate className="flex flex-col gap-4">
      {/* Nome */}
      <div className="flex flex-col gap-2">
        <label htmlFor="pf-nome" className="text-sm font-medium">Nome completo</label>
        <Input id="pf-nome" placeholder="Seu nome completo" className="h-10 rounded-lg"
          aria-invalid={!!errors.nomeCompleto}
          aria-describedby={errors.nomeCompleto ? "pf-nome-error" : undefined}
          {...register("nomeCompleto")} />
        {errors.nomeCompleto && <p id="pf-nome-error" className="text-xs text-destructive" role="alert">{errors.nomeCompleto.message}</p>}
      </div>

      {/* Email */}
      <div className="flex flex-col gap-2">
        <label htmlFor="pf-email" className="text-sm font-medium">Email</label>
        <Input id="pf-email" type="email" placeholder="seu@email.com" className="h-10 rounded-lg"
          aria-invalid={!!errors.email}
          aria-describedby={errors.email ? "pf-email-error" : undefined}
          {...register("email")} />
        {errors.email && <p id="pf-email-error" className="text-xs text-destructive" role="alert">{errors.email.message}</p>}
      </div>

      {/* Data nascimento */}
      <div className="flex flex-col gap-2">
        <label htmlFor="pf-dob" className="text-sm font-medium">Data de nascimento</label>
        <Input id="pf-dob" type="date" className="h-10 rounded-lg"
          aria-invalid={!!errors.dataNascimento}
          aria-describedby={errors.dataNascimento ? "pf-dob-error" : undefined}
          {...register("dataNascimento")} />
        {errors.dataNascimento && <p id="pf-dob-error" className="text-xs text-destructive" role="alert">{errors.dataNascimento.message}</p>}
      </div>

      {/* CPF (opcional) */}
      <div className="flex flex-col gap-2">
        <label htmlFor="pf-cpf" className="text-sm font-medium">CPF <span className="text-muted-foreground font-normal">(opcional)</span></label>
        <Input id="pf-cpf" placeholder="11 dígitos, sem pontuação" maxLength={11} className="h-10 rounded-lg"
          aria-invalid={!!errors.cpf}
          aria-describedby={errors.cpf ? "pf-cpf-error" : undefined}
          {...register("cpf")} />
        {errors.cpf && <p id="pf-cpf-error" className="text-xs text-destructive" role="alert">{errors.cpf.message}</p>}
      </div>

      {/* Senha */}
      <div className="flex flex-col gap-2">
        <label htmlFor="pf-senha" className="text-sm font-medium">Senha</label>
        <Input id="pf-senha" type="password" className="h-10 rounded-lg"
          aria-invalid={!!errors.senha}
          aria-describedby={errors.senha ? "pf-senha-error" : undefined}
          {...register("senha")} />
        {errors.senha && <p id="pf-senha-error" className="text-xs text-destructive" role="alert">{errors.senha.message}</p>}
      </div>

      {/* Confirmar senha */}
      <div className="flex flex-col gap-2">
        <label htmlFor="pf-confirmar" className="text-sm font-medium">Confirmar senha</label>
        <Input id="pf-confirmar" type="password" className="h-10 rounded-lg"
          aria-invalid={!!errors.confirmarSenha}
          aria-describedby={errors.confirmarSenha ? "pf-confirmar-error" : undefined}
          {...register("confirmarSenha")} />
        {errors.confirmarSenha && <p id="pf-confirmar-error" className="text-xs text-destructive" role="alert">{errors.confirmarSenha.message}</p>}
      </div>

      <Button type="submit" className="w-full h-10 rounded-lg bg-[#3B0270] hover:bg-[#2d0254] text-white mt-2" disabled={isSubmitting}>
        {isSubmitting ? "Criando conta…" : "Criar conta"}
      </Button>
    </form>
  )
}

// ─── PJ Form ────────────────────────────────────────────────────────────────

function PjForm() {
  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<PjValues>({ resolver: zodResolver(pjSchema) })

  const onSubmit = async (_data: PjValues) => {
    await new Promise((r) => setTimeout(r, 600))
    toast.success("Cadastro simulado. Integração será adicionada.")
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate className="flex flex-col gap-4">
      {/* Email */}
      <div className="flex flex-col gap-2">
        <label htmlFor="pj-email" className="text-sm font-medium">Email</label>
        <Input id="pj-email" type="email" placeholder="contato@org.com.br" className="h-10 rounded-lg"
          aria-invalid={!!errors.email}
          aria-describedby={errors.email ? "pj-email-error" : undefined}
          {...register("email")} />
        {errors.email && <p id="pj-email-error" className="text-xs text-destructive" role="alert">{errors.email.message}</p>}
      </div>

      {/* CNPJ */}
      <div className="flex flex-col gap-2">
        <label htmlFor="pj-cnpj" className="text-sm font-medium">CNPJ</label>
        <Input id="pj-cnpj" placeholder="14 dígitos, sem pontuação" maxLength={14} className="h-10 rounded-lg"
          aria-invalid={!!errors.cnpj}
          aria-describedby={errors.cnpj ? "pj-cnpj-error" : undefined}
          {...register("cnpj")} />
        {errors.cnpj && <p id="pj-cnpj-error" className="text-xs text-destructive" role="alert">{errors.cnpj.message}</p>}
      </div>

      {/* Nome da organização */}
      <div className="flex flex-col gap-2">
        <label htmlFor="pj-nome" className="text-sm font-medium">Nome da ONG / Empresa</label>
        <Input id="pj-nome" placeholder="Nome da organização" className="h-10 rounded-lg"
          aria-invalid={!!errors.nomeOrganizacao}
          aria-describedby={errors.nomeOrganizacao ? "pj-nome-error" : undefined}
          {...register("nomeOrganizacao")} />
        {errors.nomeOrganizacao && <p id="pj-nome-error" className="text-xs text-destructive" role="alert">{errors.nomeOrganizacao.message}</p>}
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
          aria-invalid={!!errors.senha}
          aria-describedby={errors.senha ? "pj-senha-error" : undefined}
          {...register("senha")} />
        {errors.senha && <p id="pj-senha-error" className="text-xs text-destructive" role="alert">{errors.senha.message}</p>}
      </div>

      {/* Confirmar senha */}
      <div className="flex flex-col gap-2">
        <label htmlFor="pj-confirmar" className="text-sm font-medium">Confirmar senha</label>
        <Input id="pj-confirmar" type="password" className="h-10 rounded-lg"
          aria-invalid={!!errors.confirmarSenha}
          aria-describedby={errors.confirmarSenha ? "pj-confirmar-error" : undefined}
          {...register("confirmarSenha")} />
        {errors.confirmarSenha && <p id="pj-confirmar-error" className="text-xs text-destructive" role="alert">{errors.confirmarSenha.message}</p>}
      </div>

      <Button type="submit" className="w-full h-10 rounded-lg bg-[#3B0270] hover:bg-[#2d0254] text-white mt-2" disabled={isSubmitting}>
        {isSubmitting ? "Criando conta…" : "Criar conta"}
      </Button>
    </form>
  )
}

// ─── RegisterForm (wrapper) ──────────────────────────────────────────────────

export function RegisterForm() {
  const navigate = useNavigate()
  const [tipo, setTipo] = useState<"pf" | "pj">("pf")

  const handleGoogle = () => {
    toast.info("Cadastro com Google será integrado em breve.")
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
        {/* Google */}
        <Button
          type="button"
          variant="outline"
          className="w-full h-10 rounded-lg gap-2 border"
          onClick={handleGoogle}
        >
          <ChromeIcon className="h-4 w-4" />
          Continuar com Google
        </Button>

        <div className="flex items-center gap-4">
          <Separator className="flex-1" />
          <span className="text-xs text-muted-foreground">ou</span>
          <Separator className="flex-1" />
        </div>

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
      </div>
    </div>
  )
}
