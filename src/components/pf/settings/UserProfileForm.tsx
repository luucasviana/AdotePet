import { useState, useRef } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { toast } from "sonner"
import { User, Save, Upload, X, MapPin, Loader2 } from "lucide-react"

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
import { maskPhone, maskCEP } from "@/lib/mask"
import { supabase } from "@/lib/supabase"

const ESTADOS_BR = [
  "AC","AL","AP","AM","BA","CE","DF","ES","GO","MA","MT","MS",
  "MG","PA","PB","PR","PE","PI","RJ","RN","RS","RO","RR","SC",
  "SP","SE","TO",
]

const profileSchema = z.object({
  fullName: z.string().min(1, "Nome completo é obrigatório"),
  socialName: z.string().optional(),
  email: z.string().email("Email inválido").min(1, "Email é obrigatório"),
  phone: z.string().optional(),
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

interface UserProfileFormProps {
  userId: string
  initialData?: Partial<ProfileFormValues> & { avatarUrl?: string }
  onSave?: (data: ProfileFormValues & { avatarUrl?: string }) => Promise<void>
}

/**
 * UserProfileForm
 * Formulário utilizado na aba "Perfil" para a Pessoa Física.
 * Contém dados pessoais, upload de avatar e preenchimento de endereço via ViaCEP.
 */
export function UserProfileForm({ userId, initialData, onSave }: UserProfileFormProps) {
  const [isSaving, setIsSaving] = useState(false)
  const [avatarPreview, setAvatarPreview] = useState<string | null>(initialData?.avatarUrl || null)
  const [avatarFile, setAvatarFile] = useState<File | null>(null)
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false)
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
      fullName: initialData?.fullName || "",
      socialName: initialData?.socialName || "",
      email: initialData?.email || "",
      phone: initialData?.phone || "",
      cep: initialData?.cep ? maskCEP(initialData.cep) : "",
      addressState: initialData?.addressState || "",
      city: initialData?.city || "",
      neighborhood: initialData?.neighborhood || "",
      street: initialData?.street || "",
      addressNumber: initialData?.addressNumber || "",
      complement: initialData?.complement || "",
    },
  })

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

  // ─── Avatar ───────────────────────────────────────────────────────────────
  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
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

    setAvatarFile(file)
    setAvatarPreview(URL.createObjectURL(file))
  }

  const handleRemoveAvatar = () => {
    setAvatarFile(null)
    setAvatarPreview(null)
    if (fileInputRef.current) fileInputRef.current.value = ""
  }

  const uploadAvatar = async (): Promise<string | null> => {
    if (!avatarFile) return avatarPreview

    setIsUploadingAvatar(true)
    try {
      const ext = avatarFile.name.split(".").pop()
      const path = `${userId}/avatar.${ext}`

      const { error } = await supabase.storage
        .from("avatars")
        .upload(path, avatarFile, { upsert: true, contentType: avatarFile.type })

      if (error) throw error

      const { data } = supabase.storage.from("avatars").getPublicUrl(path)
      return `${data.publicUrl}?t=${Date.now()}`
    } catch (err) {
      console.error("Erro ao fazer upload da avatar:", err)
      toast.error("Erro ao enviar imagem. Tente novamente.")
      return null
    } finally {
      setIsUploadingAvatar(false)
    }
  }

  // ─── Submit ───────────────────────────────────────────────────────────────
  const onSubmit = async (data: ProfileFormValues) => {
    setIsSaving(true)
    try {
      const uploadedAvatarUrl = await uploadAvatar()

      if (onSave) {
        await onSave({ ...data, avatarUrl: uploadedAvatarUrl ?? undefined })
      }
      toast.success("Perfil do usuário atualizado com sucesso!")
    } catch {
      toast.error("Ocorreu um erro ao salvar o perfil.")
    } finally {
      setIsSaving(false)
    }
  }

  const userInitials = (watch("fullName") || "?")
    .trim()
    .split(/\s+/)
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
          <User className="w-5 h-5 text-[#3B0270]" />
          Dados Pessoais
        </CardTitle>
        <CardDescription className="font-sans mt-1">
          Gerencie suas informações de identificação.
        </CardDescription>
      </CardHeader>

      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">

          {/* Foto de Perfil */}
          <div className="flex flex-col gap-2">
            <Label className="font-sans font-medium text-sm">Foto de Perfil</Label>
            <div className="flex items-center gap-4">
              <Avatar className="w-16 h-16 rounded-full border border-border">
                <AvatarImage src={avatarPreview ?? undefined} alt="Avatar do usuário" className="object-cover" />
                <AvatarFallback className="rounded-full bg-[#3B0270]/10 text-[#3B0270] font-bold text-lg font-sans">
                  {userInitials || "???"}
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
                    disabled={isUploadingAvatar}
                  >
                    <Upload className="h-3 w-3" />
                    {avatarPreview ? "Trocar foto" : "Enviar foto"}
                  </Button>
                  {avatarPreview && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="h-8 rounded-lg text-muted-foreground hover:text-destructive"
                      onClick={handleRemoveAvatar}
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
              aria-label="Upload da foto de perfil"
              onChange={handleAvatarChange}
            />
          </div>

          {/* ── Dados Pessoais ─────────────────────────── */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

            {/* Nome Completo */}
            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="fullName" className="font-sans font-medium text-sm">
                Nome completo
              </Label>
              <Input
                id="fullName"
                className="h-10 rounded-lg font-sans"
                placeholder="Seu nome completo"
                {...register("fullName")}
              />
              {errors.fullName && (
                <p className="text-xs text-destructive font-sans">{errors.fullName.message}</p>
              )}
            </div>

            {/* Nome Social */}
            <div className="space-y-2">
              <Label htmlFor="socialName" className="font-sans font-medium text-sm">
                Nome social (Opcional)
              </Label>
              <Input
                id="socialName"
                className="h-10 rounded-lg font-sans"
                placeholder="Como você prefere ser chamado"
                {...register("socialName")}
              />
            </div>

            {/* Identidade PJ Invisível e Imutável no Form (apenas tratativa base) */}
            
            {/* E-mail (Read-only) */}
            <div className="space-y-2">
              <Label htmlFor="email" className="font-sans font-medium text-sm">
                E-mail
              </Label>
              <Input
                id="email"
                type="email"
                readOnly
                tabIndex={-1}
                className="h-10 rounded-lg font-sans bg-slate-50 text-muted-foreground border-0 cursor-not-allowed select-none focus-visible:ring-0"
                placeholder="seuemail@exemplo.com"
                {...register("email")}
              />
              {errors.email && (
                <p className="text-xs text-destructive font-sans">{errors.email.message}</p>
              )}
              <p className="text-xs text-muted-foreground font-sans">
                O e-mail de acesso não pode ser alterado por aqui.
              </p>
            </div>

            {/* Telefone de Contato */}
            <div className="space-y-2">
              <Label htmlFor="phone" className="font-sans font-medium text-sm">
                Telefone / WhatsApp
              </Label>
              <Input
                id="phone"
                className="h-10 rounded-lg font-sans"
                placeholder="(00) 00000-0000"
                maxLength={15}
                {...register("phone", {
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
                    Digite o CEP para buscar o endereço.
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
                  placeholder="Sua cidade"
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
                  placeholder="Seu bairro"
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
                placeholder="Sua rua, avenida, etc."
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
                  placeholder="Número ou SN"
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
                  placeholder="Apto, bloco, casa 2..."
                  {...register("complement")}
                />
              </div>
            </div>
          </div>

          {/* ── Footer ─────────────────────────────────────────────── */}
          <div className="flex justify-end border-t border-border pt-6 pb-2">
            <Button
              type="submit"
              disabled={isSaving || isUploadingAvatar || isFetchingCep}
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
