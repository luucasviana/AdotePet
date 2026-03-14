import { useState, useRef } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { toast } from "sonner"
import { Building2, Save, Upload, X, MapPin, Loader2 } from "lucide-react"

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { maskCNPJ, maskPhone, maskCEP } from "@/lib/mask"
import { supabase } from "@/lib/supabase"

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

const ESTADOS_BR = [
  "AC","AL","AP","AM","BA","CE","DF","ES","GO","MA","MT","MS",
  "MG","PA","PB","PR","PE","PI","RJ","RN","RS","RO","RR","SC",
  "SP","SE","TO",
]

const profileSchema = z.object({
  nomeOrganizacao: z.string().min(1, "Nome da empresa é obrigatório"),
  nomeFantasia: z.string().optional(),
  tipoOrganizacao: z.string().min(1, "Tipo de organização é obrigatório"),
  email: z.string().email("Email inválido").min(1, "Email é obrigatório"),
  telefone: z.string().optional(),
  // Endereço
  cep: z
    .string()
    .optional()
    .refine((v) => !v || v.replace(/\D/g, "").length === 8, {
      message: "CEP inválido",
    }),
  addressState: z.string().optional(),
  city: z.string().optional(),
  neighborhood: z.string().optional(),
  street: z.string().optional(),
  addressNumber: z.string().optional(),
  complement: z.string().optional(),
})

type ProfileFormValues = z.infer<typeof profileSchema>

interface OrganizationProfileFormProps {
  userId: string
  initialData?: Partial<ProfileFormValues> & { cnpj?: string; logoUrl?: string }
  onSave?: (data: ProfileFormValues & { logoUrl?: string }) => Promise<void>
}

/**
 * OrganizationProfileForm
 * Formulário utilizado na aba "Perfil da organização".
 * Concentra a manutenção dos dados criados durante o onboarding da PJ,
 * incluindo os campos de endereço com auto-preenchimento via ViaCEP.
 */
export function OrganizationProfileForm({ userId, initialData, onSave }: OrganizationProfileFormProps) {
  const [isSaving, setIsSaving] = useState(false)
  const [logoPreview, setLogoPreview] = useState<string | null>(initialData?.logoUrl || null)
  const [logoFile, setLogoFile] = useState<File | null>(null)
  const [isUploadingLogo, setIsUploadingLogo] = useState(false)
  const [isFetchingCep, setIsFetchingCep] = useState(false)
  const [cepError, setCepError] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<ProfileFormValues>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      nomeOrganizacao: initialData?.nomeOrganizacao || "",
      nomeFantasia: initialData?.nomeFantasia || "",
      tipoOrganizacao: initialData?.tipoOrganizacao || "ONG",
      email: initialData?.email || "",
      telefone: initialData?.telefone || "",
      cep: initialData?.cep ? maskCEP(initialData.cep) : "",
      addressState: initialData?.addressState || "",
      city: initialData?.city || "",
      neighborhood: initialData?.neighborhood || "",
      street: initialData?.street || "",
      addressNumber: initialData?.addressNumber || "",
      complement: initialData?.complement || "",
    },
  })

  // CNPJ é read-only após o cadastro.
  const cnpj = maskCNPJ(initialData?.cnpj || "") || "00.000.000/0000-00"

  // ─── ViaCEP ───────────────────────────────────────────────────────────────
  const handleCepChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const masked = maskCEP(e.target.value)
    setValue("cep", masked)
    setCepError(null)

    const digits = masked.replace(/\D/g, "")
    if (digits.length !== 8) return

    setIsFetchingCep(true)
    try {
      const res = await fetch(`https://viacep.com.br/ws/${digits}/json/`)
      if (!res.ok) throw new Error("network")
      const data = await res.json()

      if (data.erro) {
        setCepError("CEP não encontrado. Verifique e preencha o endereço manualmente.")
        return
      }

      setValue("street", data.logradouro || "")
      setValue("neighborhood", data.bairro || "")
      setValue("city", data.localidade || "")
      setValue("addressState", data.uf || "")
    } catch {
      setCepError("Não foi possível consultar o CEP. Preencha o endereço manualmente.")
    } finally {
      setIsFetchingCep(false)
    }
  }

  // ─── Logo ─────────────────────────────────────────────────────────────────
  const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    if (!file.type.startsWith("image/")) {
      toast.error("Por favor, selecione uma imagem válida.")
      return
    }
    if (file.size > 2 * 1024 * 1024) {
      toast.error("A imagem deve ter no máximo 2MB.")
      return
    }

    setLogoFile(file)
    setLogoPreview(URL.createObjectURL(file))
  }

  const handleRemoveLogo = () => {
    setLogoFile(null)
    setLogoPreview(null)
    if (fileInputRef.current) fileInputRef.current.value = ""
  }

  const uploadLogo = async (): Promise<string | null> => {
    if (!logoFile) return logoPreview

    setIsUploadingLogo(true)
    try {
      const ext = logoFile.name.split(".").pop()
      const path = `${userId}/logo.${ext}`

      const { error } = await supabase.storage
        .from("logos")
        .upload(path, logoFile, { upsert: true, contentType: logoFile.type })

      if (error) throw error

      const { data } = supabase.storage.from("logos").getPublicUrl(path)
      return `${data.publicUrl}?t=${Date.now()}`
    } catch (err) {
      console.error("Erro ao fazer upload da logo:", err)
      toast.error("Erro ao enviar imagem. Tente novamente.")
      return null
    } finally {
      setIsUploadingLogo(false)
    }
  }

  // ─── Submit ───────────────────────────────────────────────────────────────
  const onSubmit = async (data: ProfileFormValues) => {
    setIsSaving(true)
    try {
      const uploadedLogoUrl = await uploadLogo()

      if (onSave) {
        await onSave({ ...data, logoUrl: uploadedLogoUrl ?? undefined })
      } else {
        await new Promise((resolve) => setTimeout(resolve, 800))
        console.log("Mock saved profile data", data, uploadedLogoUrl)
      }
      toast.success("Perfil da organização atualizado com sucesso!")
    } catch {
      toast.error("Ocorreu um erro ao salvar o perfil.")
    } finally {
      setIsSaving(false)
    }
  }

  const orgInitials = (initialData?.nomeFantasia || initialData?.nomeOrganizacao || "?")
    .split(" ")
    .slice(0, 2)
    .map((w) => w[0])
    .join("")
    .toUpperCase()

  const cepValue = watch("cep") || ""
  const isAddressFetched = cepValue.replace(/\D/g, "").length === 8 && !isFetchingCep && !cepError

  return (
    <Card className="rounded-2xl border-border shadow-sm h-fit">
      <CardHeader className="pb-4">
        <CardTitle className="text-base font-semibold font-sans flex items-center gap-2">
          <Building2 className="w-5 h-5 text-[#3B0270]" />
          Dados Institucionais
        </CardTitle>
        <CardDescription className="font-sans mt-1">
          Gerencie as informações públicas e de contato da sua organização.
        </CardDescription>
      </CardHeader>

      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">

          {/* Logo da Organização */}
          <div className="flex flex-col gap-2">
            <Label className="font-sans font-medium text-sm">Logo da Organização</Label>
            <div className="flex items-center gap-4">
              <Avatar className="w-16 h-16 rounded-2xl border border-border">
                <AvatarImage src={logoPreview ?? undefined} alt="Logo da organização" className="object-cover" />
                <AvatarFallback className="rounded-2xl bg-[#3B0270]/10 text-[#3B0270] font-bold text-lg font-sans">
                  {orgInitials}
                </AvatarFallback>
              </Avatar>

              <div className="flex flex-col gap-2">
                <div className="flex gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="h-8 rounded-lg gap-2 border text-sm font-sans"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={isUploadingLogo}
                  >
                    <Upload className="h-3 w-3" />
                    {logoPreview ? "Trocar logo" : "Enviar logo"}
                  </Button>
                  {logoPreview && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="h-8 rounded-lg text-muted-foreground hover:text-destructive"
                      onClick={handleRemoveLogo}
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  )}
                </div>
                <p className="text-xs text-muted-foreground font-sans">
                  PNG, JPG ou WEBP. Máximo 2MB. Recomendado 256×256px.
                </p>
              </div>
            </div>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/png,image/jpeg,image/webp"
              className="hidden"
              aria-label="Upload da logo da organização"
              onChange={handleLogoChange}
            />
          </div>

          {/* ── Dados read-only + editáveis ─────────────────────────── */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* CNPJ (Read-only) */}
            <div className="space-y-2">
              <Label htmlFor="cnpj" className="font-sans font-medium text-sm">
                CNPJ
              </Label>
              <Input
                id="cnpj"
                value={cnpj}
                readOnly
                tabIndex={-1}
                className="h-10 rounded-lg font-sans bg-slate-50 text-muted-foreground border-0 cursor-not-allowed select-none focus-visible:ring-0"
              />
              <p className="text-xs text-muted-foreground font-sans">
                O CNPJ não pode ser alterado após o cadastro.
              </p>
            </div>

            {/* Tipo de organização (Read-only) */}
            <div className="space-y-2">
              <Label htmlFor="tipo" className="font-sans font-medium text-sm">
                Tipo de organização
              </Label>
              <Select
                defaultValue={initialData?.tipoOrganizacao || "ONG"}
                onOpenChange={() => {}}
              >
                <SelectTrigger
                  id="tipo"
                  tabIndex={-1}
                  className="h-10 rounded-lg font-sans bg-slate-50 text-muted-foreground border-0 cursor-not-allowed pointer-events-none"
                >
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {TIPOS_ORGANIZACAO.map((tipo) => (
                    <SelectItem key={tipo} value={tipo} className="font-sans">
                      {tipo}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground font-sans">
                O tipo de organização não pode ser alterado após o cadastro.
              </p>
            </div>

            {/* Razão Social (Read-only) */}
            <div className="space-y-2">
              <Label htmlFor="nomeOrganizacao" className="font-sans font-medium text-sm">
                Razão Social
              </Label>
              <Input
                id="nomeOrganizacao"
                readOnly
                tabIndex={-1}
                className="h-10 rounded-lg font-sans bg-slate-50 text-muted-foreground border-0 cursor-not-allowed select-none focus-visible:ring-0"
                placeholder="Razão social da empresa"
                {...register("nomeOrganizacao")}
              />
              {errors.nomeOrganizacao && (
                <p className="text-xs text-destructive font-sans">{errors.nomeOrganizacao.message}</p>
              )}
              <p className="text-xs text-muted-foreground font-sans">
                A razão social não pode ser alterada após o cadastro.
              </p>
            </div>

            {/* Nome Fantasia */}
            <div className="space-y-2">
              <Label htmlFor="nomeFantasia" className="font-sans font-medium text-sm">
                Nome Fantasia (Opcional)
              </Label>
              <Input
                id="nomeFantasia"
                className="h-10 rounded-lg font-sans"
                placeholder="Como a organização é conhecida"
                {...register("nomeFantasia")}
              />
            </div>

            {/* E-mail Oficial (Read-only) */}
            <div className="space-y-2">
              <Label htmlFor="email" className="font-sans font-medium text-sm">
                E-mail Oficial
              </Label>
              <Input
                id="email"
                type="email"
                readOnly
                tabIndex={-1}
                className="h-10 rounded-lg font-sans bg-slate-50 text-muted-foreground border-0 cursor-not-allowed select-none focus-visible:ring-0"
                placeholder="contato@ong.org.br"
                {...register("email")}
              />
              {errors.email && (
                <p className="text-xs text-destructive font-sans">{errors.email.message}</p>
              )}
              <p className="text-xs text-muted-foreground font-sans">
                O e-mail oficial não pode ser alterado por aqui.
              </p>
            </div>

            {/* Telefone de Contato */}
            <div className="space-y-2">
              <Label htmlFor="telefone" className="font-sans font-medium text-sm">
                Telefone / WhatsApp (Opcional)
              </Label>
              <Input
                id="telefone"
                className="h-10 rounded-lg font-sans"
                placeholder="(00) 00000-0000"
                maxLength={15}
                {...register("telefone", {
                  onChange: (e) => {
                    e.target.value = maskPhone(e.target.value)
                  },
                })}
              />
            </div>
          </div>

          {/* ── Endereço ──────────────────────────────────────────────── */}
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <Separator className="flex-1" />
              <div className="flex items-center gap-2 text-sm font-medium font-sans text-muted-foreground shrink-0">
                <MapPin className="w-4 h-4 text-[#3B0270]" />
                Endereço
              </div>
              <Separator className="flex-1" />
            </div>

            {/* Linha 1: CEP + Estado */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* CEP */}
              <div className="space-y-2">
                <Label htmlFor="cep" className="font-sans font-medium text-sm">
                  CEP
                </Label>
                <div className="relative">
                  <Input
                    id="cep"
                    className={`h-10 rounded-lg font-sans pr-10 ${cepError ? "border-destructive focus-visible:ring-destructive" : ""}`}
                    placeholder="00000-000"
                    maxLength={9}
                    {...register("cep")}
                    onChange={handleCepChange}
                  />
                  {isFetchingCep && (
                    <div className="absolute right-3 top-1/2 -translate-y-1/2">
                      <Loader2 className="w-4 h-4 animate-spin text-muted-foreground" />
                    </div>
                  )}
                </div>
                {cepError ? (
                  <p className="text-xs text-amber-600 font-sans">{cepError}</p>
                ) : (
                  <p className="text-xs text-muted-foreground font-sans">
                    Digite o CEP para preencher automaticamente.
                  </p>
                )}
                {errors.cep && (
                  <p className="text-xs text-destructive font-sans">{errors.cep.message}</p>
                )}
              </div>

              {/* Estado */}
              <div className="space-y-2">
                <Label htmlFor="addressState" className="font-sans font-medium text-sm">
                  Estado (UF)
                </Label>
                <Select
                  value={watch("addressState") || ""}
                  onValueChange={(v) => setValue("addressState", v)}
                >
                  <SelectTrigger
                    id="addressState"
                    className={`h-10 rounded-lg font-sans ${isAddressFetched ? "" : ""}`}
                  >
                    <SelectValue placeholder="Selecione" />
                  </SelectTrigger>
                  <SelectContent>
                    {ESTADOS_BR.map((uf) => (
                      <SelectItem key={uf} value={uf} className="font-sans">
                        {uf}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Linha 2: Cidade + Bairro */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="city" className="font-sans font-medium text-sm">
                  Cidade
                </Label>
                <Input
                  id="city"
                  className="h-10 rounded-lg font-sans"
                  placeholder="Ex: São Paulo"
                  {...register("city")}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="neighborhood" className="font-sans font-medium text-sm">
                  Bairro
                </Label>
                <Input
                  id="neighborhood"
                  className="h-10 rounded-lg font-sans"
                  placeholder="Ex: Centro"
                  {...register("neighborhood")}
                />
              </div>
            </div>

            {/* Linha 3: Logradouro full-width */}
            <div className="space-y-2">
              <Label htmlFor="street" className="font-sans font-medium text-sm">
                Logradouro / Rua
              </Label>
              <Input
                id="street"
                className="h-10 rounded-lg font-sans"
                placeholder="Ex: Av. Paulista"
                {...register("street")}
              />
            </div>

            {/* Linha 4: Número + Complemento */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="addressNumber" className="font-sans font-medium text-sm">
                  Número
                </Label>
                <Input
                  id="addressNumber"
                  className="h-10 rounded-lg font-sans"
                  placeholder="Ex: 1578"
                  {...register("addressNumber")}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="complement" className="font-sans font-medium text-sm">
                  Complemento{" "}
                  <span className="text-muted-foreground font-normal">(Opcional)</span>
                </Label>
                <Input
                  id="complement"
                  className="h-10 rounded-lg font-sans"
                  placeholder="Sala, andar, bloco..."
                  {...register("complement")}
                />
              </div>
            </div>
          </div>

          {/* ── Footer ─────────────────────────────────────────────── */}
          <div className="flex justify-end border-t border-border pt-6 pb-2">
            <Button
              type="submit"
              disabled={isSaving || isUploadingLogo || isFetchingCep}
              className="rounded-lg h-10 w-full sm:w-auto bg-[#3B0270] hover:bg-[#2d0254] text-white font-sans px-8"
            >
              {isSaving ? (
                <span className="flex items-center gap-2">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Salvando...
                </span>
              ) : (
                <>
                  <Save className="w-4 h-4 mr-2" />
                  Salvar Alterações
                </>
              )}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}
