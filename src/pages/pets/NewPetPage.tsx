import { useEffect, useState } from "react"
import { useNavigate, useParams } from "react-router-dom"
import { useForm, Controller, FormProvider, useFormContext } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { toast } from "sonner"
import type { LucideIcon } from "lucide-react"
import {
  Upload, Trash2, Star, Info, CheckCircle2,
  Dog, Cat, Bird, Turtle, Check,
  Zap, Heart, Smile, Wind, Shield, Leaf, Search, Users, EyeOff,
  Feather, Tag, Lightbulb, Flame, Music, Home, UserCheck
} from "lucide-react"

import { supabase } from "@/lib/supabase"
import { registerPet } from "@/lib/actions/registerPet"
import { updatePet } from "@/lib/actions/updatePet"

import { AuthPageHeader } from "@/components/layout/AuthPageHeader"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue
} from "@/components/ui/select"
import { ScrollArea } from "@/components/ui/scroll-area"
import { cn } from "@/lib/utils"

// ─── Schemas de Validação ───────────────────────────────────────────────────

const petFormSchema = z.object({
  name: z.string().min(2, "O nome deve ter no mínimo 2 caracteres."),
  species: z.enum(["dog", "cat", "bird", "reptile"], { message: "Selecione a espécie." }),
  sex: z.enum(["male", "female"], { message: "Selecione o sexo." }),
  breed: z.string().min(1, "A raça é obrigatória (informe SRD se não souber)."),

  photos: z.array(z.object({
    file: z.instanceof(File).optional(),
    previewUrl: z.string(),
    is_primary: z.boolean(),
    id: z.string().optional() // For existing photos
  }))
    .min(3, "Adicione no mínimo 3 fotos.")
    .max(5, "Adicione no máximo 5 fotos.")
    .refine(
      (photos) => photos.filter(p => p.is_primary).length === 1,
      { message: "Exatamente 1 foto deve ser marcada como principal." }
    ),

  color_ids: z.array(z.string()).min(1, "Selecione pelo menos 1 cor."),
  trait_ids: z.array(z.string()).min(1, "Selecione no mínimo 1 traço.").max(6, "Selecione no máximo 6 traços."),
  size: z.enum(["mini", "small", "medium", "large"], { message: "Selecione o porte." }),
  age_range: z.enum(["up_to_1_year", "from_1_to_3_years", "from_3_to_6_years", "over_6_years"], { message: "Selecione a faixa etária." }),
  neutered_status: z.enum(["yes", "no", "unknown"], { message: "Informe o status de castração." }),

  description: z.string().optional(),
})

export type PetFormValues = z.infer<typeof petFormSchema>

const STEP_FIELDS: (keyof PetFormValues)[][] = [
  ["name", "species", "sex", "breed"],
  ["photos"],
  ["color_ids", "trait_ids", "size", "age_range", "neutered_status"],
  ["description"]
]

const STEPS = [
  { id: 0, title: "Identificação", subtitle: "Preencha as informações básicas do pet." },
  { id: 1, title: "Fotos",         subtitle: "Adicione entre 3 e 5 fotos. A marcada com ★ será a capa do anúncio." },
  { id: 2, title: "Características", subtitle: "Defina as características físicas e de personalidade." },
  { id: 3, title: "Descrição",     subtitle: "Escreva um texto para aumentar as chances de adoção. (Opcional)" },
]

// ─── Trait icon mapping ───────────────────────────────────────────────────────

const TRAIT_ICON_MAP: { keywords: string[]; icon: LucideIcon }[] = [
  { keywords: ["ativ", "energéti", "energeti"],       icon: Zap },
  { keywords: ["amor", "carinhos", "afeto"],          icon: Heart },
  { keywords: ["brincalh", "alegre", "divertid"],     icon: Smile },
  { keywords: ["calm", "tranquil", "sereno"],         icon: Wind },
  { keywords: ["protetor", "guard"],                  icon: Shield },
  { keywords: ["dócil", "docil", "gentil", "manso"],  icon: Leaf },
  { keywords: ["curioso"],                            icon: Search },
  { keywords: ["territorial"],                        icon: Home },
  { keywords: ["sociáv", "sociav", "amigáv", "amigav", "socializad"], icon: Users },
  { keywords: ["tímid", "timid", "medroso", "medrosa"], icon: EyeOff },
  { keywords: ["sensív", "sensiv", "delicad"],        icon: Feather },
  { keywords: ["inteligent"],                         icon: Lightbulb },
  { keywords: ["leal", "fiel"],                       icon: UserCheck },
  { keywords: ["músic", "music"],                     icon: Music },
  { keywords: ["independ"],                           icon: Flame },
]

function getTraitIcon(label: string): LucideIcon {
  const lower = label.toLowerCase()
  for (const { keywords, icon } of TRAIT_ICON_MAP) {
    if (keywords.some(k => lower.includes(k))) return icon
  }
  return Tag
}

// ─── Shared selectable chip ──────────────────────────────────────────────────

function chipClass(isSelected: boolean) {
  return cn(
    "inline-flex items-center gap-2 h-10 px-4 rounded-lg border text-sm font-medium font-sans transition-colors outline-none active:scale-95 select-none cursor-pointer",
    isSelected
      ? "bg-primary/5 border-primary text-primary"
      : "bg-white border-border text-foreground hover:bg-muted hover:border-muted-foreground/30"
  )
}

// ─── Stepper Nav ─────────────────────────────────────────────────────────────

function StepperNav({ currentStep }: { currentStep: number }) {
  return (
    <div className="w-full mb-8">
      {/* Desktop — bolinhas numeradas + linhas separadoras que crescem */}
      <div className="hidden md:flex items-center w-full">
        {STEPS.map((step, index) => {
          const isCompleted = currentStep > index
          const isCurrent = currentStep === index
          return (
            <div key={step.id} className="flex items-center flex-1 last:flex-none">
              <div className={cn(
                "flex items-center gap-2.5 shrink-0 transition-colors",
                isCurrent ? "text-primary" : isCompleted ? "text-primary" : "text-muted-foreground"
              )}>
                {/* Bolinha numerada */}
                <div className={cn(
                  "w-7 h-7 rounded-full flex items-center justify-center shrink-0 transition-colors border",
                  isCurrent
                    ? "bg-primary border-primary text-primary-foreground"
                    : isCompleted
                      ? "bg-primary/10 border-primary/30 text-primary"
                      : "bg-white border-border text-muted-foreground"
                )}>
                  {isCompleted
                    ? <Check className="w-3.5 h-3.5" />
                    : <span className="text-xs font-semibold font-sans">{step.id + 1}</span>
                  }
                </div>
                {/* Label */}
                <span className={cn(
                  "text-sm font-sans transition-colors",
                  isCurrent ? "font-semibold text-primary" : isCompleted ? "font-medium text-primary" : "font-normal text-muted-foreground"
                )}>{step.title}</span>
              </div>

              {/* Linha conectora — cresce entre os itens */}
              {index < STEPS.length - 1 && (
                <div className={cn(
                  "flex-1 h-px mx-4 transition-colors",
                  currentStep > index ? "bg-primary/30" : "bg-border"
                )} />
              )}
            </div>
          )
        })}
      </div>

      {/* Mobile — apenas barra de progresso */}
      <div className="flex md:hidden w-full">
        <div className="w-full h-1.5 rounded-full bg-muted overflow-hidden">
          <div
            className="h-full bg-primary transition-all duration-300 rounded-full"
            style={{ width: `${((Math.min(currentStep, 3) + 1) / 4) * 100}%` }}
          />
        </div>
      </div>
    </div>
  )
}

// ─── Step 1 — Identificação Básica ──────────────────────────────────────────

function Step1BasicInfo() {
  const { register, control, formState: { errors }, watch, setValue } = useFormContext<PetFormValues>()
  const selectedSpecies = watch("species")

  const speciesOptions = [
    { value: "dog",     label: "Cachorro", icon: Dog },
    { value: "cat",     label: "Gato",     icon: Cat },
    { value: "bird",    label: "Ave",      icon: Bird },
    { value: "reptile", label: "Réptil",   icon: Turtle },
  ]

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">

      {/* Espécie */}
      <div className="space-y-2">
        <Label className="text-sm font-medium font-sans">Qual a espécie do pet?</Label>
        <div className="flex flex-wrap gap-2">
          {speciesOptions.map(option => {
            const Icon = option.icon
            const isSelected = selectedSpecies === option.value
            return (
              <button
                key={option.value}
                type="button"
                onClick={() => setValue("species", option.value as any, { shouldValidate: true })}
                className={chipClass(isSelected)}
              >
                <Icon className="w-4 h-4 shrink-0" />
                <span>{option.label}</span>
              </button>
            )
          })}
        </div>
        {errors.species && (
          <p className="text-xs text-destructive font-sans">{errors.species.message}</p>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Nome */}
        <div className="space-y-2">
          <Label htmlFor="name" className="text-sm font-medium font-sans">Nome do animal</Label>
          <Input
            id="name"
            {...register("name" as any)}
            className="h-10 rounded-lg font-sans"
            placeholder="Ex: Rex, Luna..."
          />
          {errors.name && (
            <p className="text-xs text-destructive font-sans">{errors.name.message as string}</p>
          )}
        </div>

        {/* Sexo */}
        <div className="space-y-2">
          <Label className="text-sm font-medium font-sans">Sexo</Label>
          <Controller
            name="sex"
            control={control}
            render={({ field }) => (
              <Select onValueChange={field.onChange} defaultValue={field.value} value={field.value}>
                <SelectTrigger className="h-10 rounded-lg font-sans">
                  <SelectValue placeholder="Selecione macho ou fêmea" />
                </SelectTrigger>
                <SelectContent className="rounded-lg font-sans">
                  <SelectItem value="female">Fêmea</SelectItem>
                  <SelectItem value="male">Macho</SelectItem>
                </SelectContent>
              </Select>
            )}
          />
          {errors.sex && (
            <p className="text-xs text-destructive font-sans">{errors.sex.message}</p>
          )}
        </div>

        {/* Raça */}
        <div className="space-y-2 md:col-span-2">
          <Label htmlFor="breed" className="text-sm font-medium font-sans">Raça</Label>
          <Input
            id="breed"
            {...register("breed")}
            className="h-10 rounded-lg font-sans"
            placeholder="Qual a raça do pet?"
          />
          <p className="text-xs text-muted-foreground font-sans flex items-center gap-1">
            <Info className="w-3 h-3 shrink-0" />
            Caso não saiba a raça, informe SRD (Sem Raça Definida).
          </p>
          {errors.breed && (
            <p className="text-xs text-destructive font-sans">{errors.breed.message}</p>
          )}
        </div>
      </div>
    </div>
  )
}

// ─── Step 2 — Fotos ──────────────────────────────────────────────────────────

function Step2Photos() {
  const { watch, setValue, formState: { errors } } = useFormContext<PetFormValues>()
  const photos = watch("photos")

  const handleAddedFiles = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) return
    const newFiles = Array.from(e.target.files)

    if (photos.length + newFiles.length > 5) {
      toast.error("O pet pode ter no máximo 5 fotos.")
      return
    }

    const newPhotos = newFiles.map(file => ({
      file,
      previewUrl: URL.createObjectURL(file),
      is_primary: false
    }))

    const updatedPhotos = [...photos, ...newPhotos]
    if (updatedPhotos.length > 0 && !updatedPhotos.some(p => p.is_primary)) {
      updatedPhotos[0].is_primary = true
    }

    setValue("photos", updatedPhotos, { shouldValidate: true })
    e.target.value = ""
  }

  const removePhoto = (index: number) => {
    const updated = [...photos]
    const removed = updated.splice(index, 1)[0]
    URL.revokeObjectURL(removed.previewUrl)
    if (removed.is_primary && updated.length > 0) updated[0].is_primary = true
    setValue("photos", updated, { shouldValidate: true })
  }

  const setPrimaryPhoto = (index: number) => {
    setValue("photos", photos.map((p, i) => ({ ...p, is_primary: i === index })), { shouldValidate: true })
  }

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
        {photos.map((photo, index) => (
          <div
            key={photo.previewUrl}
            className={cn(
              "relative aspect-square w-full rounded-lg overflow-hidden border group transition-all",
              photo.is_primary ? "border-primary shadow-sm scale-[1.02]" : "border-border"
            )}
          >
            <img src={photo.previewUrl} alt={`Foto ${index + 1}`} className="object-cover w-full h-full" />
            <div className="absolute inset-x-0 top-0 p-2 bg-gradient-to-b from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex justify-between">
              <button
                type="button"
                onClick={() => setPrimaryPhoto(index)}
                className={cn(
                  "p-1.5 rounded-full transition-colors flex items-center justify-center",
                  photo.is_primary
                    ? "bg-primary text-primary-foreground shadow-sm"
                    : "bg-white text-muted-foreground hover:text-primary border border-border"
                )}
                title={photo.is_primary ? "Foto principal" : "Marcar como principal"}
                aria-label={photo.is_primary ? "Foto principal" : "Marcar como principal"}
              >
                <Star className={cn("w-4 h-4", photo.is_primary && "fill-current")} />
              </button>
              <button
                type="button"
                onClick={() => removePhoto(index)}
                className="p-1.5 rounded-full bg-white text-muted-foreground hover:text-destructive border border-border transition-colors shadow-sm flex items-center justify-center"
                title="Remover foto"
                aria-label="Remover foto"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
            {photo.is_primary && (
              <div className="absolute bottom-0 inset-x-0 bg-primary text-primary-foreground text-[10px] uppercase font-semibold font-sans py-1 text-center flex items-center justify-center gap-1">
                <Star className="w-3 h-3 fill-current" /> Principal
              </div>
            )}
          </div>
        ))}

        {photos.length < 5 && (
          <Label
            htmlFor="photo-upload"
            className="aspect-square w-full rounded-lg border-2 border-dashed border-border hover:border-primary bg-white hover:bg-primary/5 transition-colors cursor-pointer flex flex-col items-center justify-center text-muted-foreground hover:text-primary gap-2"
          >
            <div className="p-3 bg-muted rounded-full">
              <Upload className="w-5 h-5" />
            </div>
            <span className="text-xs font-medium font-sans">Enviar foto</span>
            <Input id="photo-upload" type="file" accept="image/png, image/jpeg, image/webp" multiple className="hidden" onChange={handleAddedFiles} />
          </Label>
        )}
      </div>

      {errors.photos && (
        <div className="p-3 bg-destructive/5 rounded-lg border border-destructive/20 flex items-center gap-2">
          <Info className="w-4 h-4 text-destructive shrink-0" />
          <p className="text-xs text-destructive font-sans font-medium">{errors.photos.message}</p>
        </div>
      )}
    </div>
  )
}

// ─── Step 3 — Características ────────────────────────────────────────────────

function Step3Characteristics({
  colorsCatalog, traitsCatalog
}: {
  colorsCatalog: { id: string; hex: string; label: string }[];
  traitsCatalog: { id: string; label: string }[];
}) {
  const { watch, setValue, control, formState: { errors } } = useFormContext<PetFormValues>()
  const selectedColors = watch("color_ids") || []
  const selectedTraits = watch("trait_ids") || []

  const sizeOptions = [
    { value: "mini",   label: "Mini" },
    { value: "small",  label: "Pequeno" },
    { value: "medium", label: "Médio" },
    { value: "large",  label: "Grande" },
  ]

  return (
    <div className="flex flex-col gap-10 animate-in fade-in slide-in-from-bottom-4 duration-500">

      {/* ── Cores ─────────────────────────────────────────────────────── */}
      <div className="space-y-3">
        <div>
          <Label className="text-sm font-medium font-sans">Cores predominantes</Label>
          <p className="text-xs text-muted-foreground font-sans mt-1">
            Selecione uma ou mais cores que representem o pet.
          </p>
        </div>
        <div className="flex flex-wrap gap-3">
          {colorsCatalog.map(color => {
            const isSelected = selectedColors.includes(color.id)
            return (
              <button
                type="button"
                key={color.id}
                onClick={() => {
                  if (isSelected) setValue("color_ids", selectedColors.filter(id => id !== color.id), { shouldValidate: true })
                  else setValue("color_ids", [...selectedColors, color.id], { shouldValidate: true })
                }}
                className={cn(
                  "relative w-10 h-10 rounded-full border transition-all flex items-center justify-center active:scale-95 outline-none",
                  isSelected
                    ? "border-primary ring-2 ring-offset-2 ring-primary"
                    : "border-border hover:scale-105 shadow-sm"
                )}
                style={{ backgroundColor: color.hex }}
                title={color.label}
                aria-label={`Selecionar cor ${color.label}`}
              >
                {isSelected && (
                  <CheckCircle2
                    className={cn(
                      "w-5 h-5 drop-shadow-sm",
                      ["#FFFFFF", "#F3E7C9", "#D6C2A1", "#F4C542", "#D4AF37"].includes(color.hex)
                        ? "text-slate-800"
                        : "text-white"
                    )}
                  />
                )}
              </button>
            )
          })}
        </div>
        {errors.color_ids && (
          <p className="text-xs text-destructive font-sans">{errors.color_ids.message}</p>
        )}
      </div>

      {/* ── Personalidade ─────────────────────────────────────────────── */}
      <div className="space-y-3">
        <div>
          <Label className="text-sm font-medium font-sans">Personalidade</Label>
          <p className="text-xs text-muted-foreground font-sans mt-1">
            Selecione de 1 a 6 traços que descrevem melhor o pet.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          {traitsCatalog.map(trait => {
            const isSelected = selectedTraits.includes(trait.id)
            const Icon = getTraitIcon(trait.label)
            return (
              <button
                type="button"
                key={trait.id}
                onClick={() => {
                  if (isSelected) {
                    setValue("trait_ids", selectedTraits.filter(id => id !== trait.id), { shouldValidate: true })
                  } else {
                    if (selectedTraits.length >= 6) { toast.error("Máximo de 6 traços atingido."); return }
                    setValue("trait_ids", [...selectedTraits, trait.id], { shouldValidate: true })
                  }
                }}
                className={cn(
                  "inline-flex items-center gap-2 h-9 px-3 rounded-lg border text-sm font-medium font-sans transition-colors outline-none active:scale-95 select-none cursor-pointer",
                  isSelected
                    ? "bg-primary text-primary-foreground border-primary"
                    : "bg-white text-foreground border-border hover:bg-muted"
                )}
              >
                <Icon className="w-3.5 h-3.5 shrink-0" />
                <span>{trait.label}</span>
              </button>
            )
          })}
        </div>
        {errors.trait_ids && (
          <p className="text-xs text-destructive font-sans">{errors.trait_ids.message}</p>
        )}
      </div>

      {/* ── Porte ─────────────────────────────────────────────────────── */}
      <div className="space-y-3">
        <Label className="text-sm font-medium font-sans">Porte do pet</Label>
        <div className="flex flex-wrap gap-2">
          {sizeOptions.map(option => {
            const isSelected = watch("size") === option.value
            return (
              <button
                key={option.value}
                type="button"
                onClick={() => setValue("size", option.value as any, { shouldValidate: true })}
                className={chipClass(isSelected)}
              >
                {option.label}
              </button>
            )
          })}
        </div>
        {errors.size && (
          <p className="text-xs text-destructive font-sans">{errors.size.message}</p>
        )}
      </div>

      {/* ── Faixa etária + Castração ───────────────────────────────────── */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <Label className="text-sm font-medium font-sans">Faixa Etária</Label>
          <Controller
            name="age_range"
            control={control}
            render={({ field }) => (
              <Select onValueChange={field.onChange} defaultValue={field.value} value={field.value}>
                <SelectTrigger className="h-10 rounded-lg font-sans">
                  <SelectValue placeholder="Qual a idade estimada?" />
                </SelectTrigger>
                <SelectContent className="rounded-lg font-sans">
                  <SelectItem value="up_to_1_year">0 a 1 ano (Filhote)</SelectItem>
                  <SelectItem value="from_1_to_3_years">1 a 3 anos (Jovem adulto)</SelectItem>
                  <SelectItem value="from_3_to_6_years">3 a 6 anos (Adulto)</SelectItem>
                  <SelectItem value="over_6_years">Mais de 6 anos (Sênior)</SelectItem>
                </SelectContent>
              </Select>
            )}
          />
          {errors.age_range && (
            <p className="text-xs text-destructive font-sans">{errors.age_range.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label className="text-sm font-medium font-sans">Status de castração</Label>
          <Controller
            name="neutered_status"
            control={control}
            render={({ field }) => (
              <Select onValueChange={field.onChange} defaultValue={field.value} value={field.value}>
                <SelectTrigger className="h-10 rounded-lg font-sans">
                  <SelectValue placeholder="O pet é castrado?" />
                </SelectTrigger>
                <SelectContent className="rounded-lg font-sans">
                  <SelectItem value="yes">Sim, é castrado</SelectItem>
                  <SelectItem value="no">Não é castrado</SelectItem>
                  <SelectItem value="unknown">Não sei informar</SelectItem>
                </SelectContent>
              </Select>
            )}
          />
          {errors.neutered_status && (
            <p className="text-xs text-destructive font-sans">{errors.neutered_status.message}</p>
          )}
        </div>
      </div>
    </div>
  )
}

// ─── Step 4 — Descrição ──────────────────────────────────────────────────────

function Step4Description() {
  const { register, watch } = useFormContext<PetFormValues>()
  const animalName = watch("name") || "o pet"

  return (
    <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <p className="text-sm text-muted-foreground font-sans">
        Animais com boas descrições têm taxas de adoção muito maiores. Fale sobre a história,
        hábitos, necessidades médicas ou como ele se comporta com crianças e outros animais.
      </p>
      <Textarea
        id="description"
        {...register("description")}
        className="min-h-[160px] resize-y rounded-lg font-sans text-sm"
        placeholder={`Escreva aqui a história incrível de ${animalName}...`}
      />
    </div>
  )
}

// ─── Step 5 — Sucesso ────────────────────────────────────────────────────────

function Step5Success({ onNewPet, isEditMode, petName }: { onNewPet: () => void; isEditMode: boolean; petName?: string }) {
  const navigate = useNavigate()
  return (
    <div className="flex flex-col items-center justify-center py-16 px-4 text-center animate-in zoom-in-95 fade-in duration-500">
      <div className="w-20 h-20 bg-emerald-50 text-emerald-600 rounded-full flex items-center justify-center mb-6 shadow-sm border border-emerald-100">
        <Check className="w-10 h-10 stroke-[2.5]" />
      </div>
      <h2 className="text-2xl font-bold font-sans text-foreground mb-2">
        {isEditMode ? "Pet atualizado com sucesso!" : "Pet cadastrado com sucesso!"}
      </h2>
      <p className="text-sm text-muted-foreground font-sans max-w-sm mx-auto mb-8 leading-relaxed">
        {isEditMode 
          ? "As informações do pet foram atualizadas publicamente." 
          : "Mais um amigo está um passo mais perto de encontrar um novo lar. Obrigado por fazer a diferença."}
      </p>
      <div className="flex flex-col sm:flex-row gap-3 w-full max-w-xs">
        <Button
          onClick={() => navigate("/home/pets")}
          className="h-10 w-full bg-primary hover:bg-[#2d0254] text-primary-foreground font-sans font-medium rounded-lg"
        >
          {isEditMode ? "Voltar para lista de pets" : "Ver pets cadastrados"}
        </Button>
        <Button
          onClick={onNewPet}
          variant="outline"
          className="h-10 w-full rounded-lg font-sans font-medium"
        >
          {isEditMode ? `Ver ${petName || "pet"}` : "Cadastrar novo pet"}
        </Button>
      </div>
    </div>
  )
}

// ─── Componente Principal ────────────────────────────────────────────────────

export function NewPetPage() {
  const { petId } = useParams<{ petId: string }>()
  const navigate = useNavigate()
  const isEditMode = !!petId

  const [colors, setColors] = useState<{ id: string; hex: string; label: string }[]>([])
  const [traits, setTraits] = useState<{ id: string; label: string }[]>([])

  const [currentStep, setCurrentStep] = useState(0)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const form = useForm<PetFormValues>({
    resolver: zodResolver(petFormSchema),
    mode: "onTouched",
    defaultValues: {
      name: "",
      breed: "",
      description: "",
      color_ids: [],
      trait_ids: [],
      photos: [],
      species: undefined,
      sex: undefined,
      size: undefined,
      age_range: undefined,
      neutered_status: undefined,
    }
  })

  // Carregar dados mestre de formulário e tentar obter ID se for edição
  useEffect(() => {
    async function loadData() {
      try {
        const [colorsRes, traitsRes] = await Promise.all([
          supabase.from("pet_colors").select("id, hex, label").eq("is_active", true).order("sort_order"),
          supabase.from("pet_traits").select("id, label").eq("is_active", true).order("sort_order"),
        ])
        if (colorsRes.data) setColors(colorsRes.data)
        if (traitsRes.data) setTraits(traitsRes.data)

        if (isEditMode && petId) {
          const { data: petData, error } = await supabase
            .from("pets")
            .select(`
              *,
              pet_photos (id, file_url, sort_order, is_primary),
              pet_color_assignments (color_id),
              pet_trait_assignments (trait_id)
            `)
            .eq("id", petId)
            .single()

          if (error || !petData) throw new Error("Pet não encontrado")

          // Popular Form com dados reais
          form.reset({
            name: petData.name || "",
            breed: petData.breed || "",
            description: petData.description || "",
            species: petData.species,
            sex: petData.sex,
            size: petData.size,
            age_range: petData.age_range,
            neutered_status: petData.neutered_status,
            color_ids: petData.pet_color_assignments.map((c: any) => c.color_id),
            trait_ids: petData.pet_trait_assignments.map((t: any) => t.trait_id),
            photos: (petData.pet_photos || [])
              .sort((a: any, b: any) => a.sort_order - b.sort_order)
              .map((p: any) => ({
                id: p.id,
                previewUrl: p.file_url,
                is_primary: p.is_primary,
                file: undefined // We don't have the real File object for existing ones
              }))
          })
        }
      } catch (err) {
        toast.error("Erro ao carregar os dados para a página.")
      }
    }
    loadData()
  }, [petId, isEditMode, form])

  const nextStep = async () => {
    const fieldsToValidate = STEP_FIELDS[currentStep]
    const isValid = await form.trigger(fieldsToValidate)
    if (isValid) {
      setCurrentStep(prev => prev + 1)
      window.scrollTo({ top: 0, behavior: "smooth" })
    }
  }

  const prevStep = () => {
    setCurrentStep(prev => prev - 1)
    window.scrollTo({ top: 0, behavior: "smooth" })
  }

  const onSubmit = async (data: PetFormValues) => {
    setIsSubmitting(true)
    try {
      const uploadedPhotos = await Promise.all(data.photos.map(async (p, index) => {
        // Se ela vier com undefined em "file", significa que já é uma imagem upada anteriormente e mantivemos.
        if (!p.file) {
          return { file_url: p.previewUrl, sort_order: index + 1, is_primary: p.is_primary }
        }

        const fileExt = p.file.name.split(".").pop()
        const fileName = `${Math.random()}.${fileExt}`
        let file_url = ""
        const { error: uploadError } = await supabase.storage.from("pets").upload(fileName, p.file)
        if (uploadError) {
          file_url = p.previewUrl // Fallback error
        } else {
          const { data: publicUrlData } = supabase.storage.from("pets").getPublicUrl(fileName)
          file_url = publicUrlData.publicUrl
        }
        return { file_url, sort_order: index + 1, is_primary: p.is_primary }
      }))

      if (isEditMode && petId) {
        await updatePet({
          petId,
          name: data.name,
          species: data.species as any,
          sex: data.sex as any,
          size: data.size as any,
          breed: data.breed,
          age_range: data.age_range as any,
          neutered_status: data.neutered_status as any,
          description: data.description || undefined,
          photos: uploadedPhotos,
          color_ids: data.color_ids,
          trait_ids: data.trait_ids
        })
      } else {
        await registerPet({
          name: data.name,
          species: data.species as any,
          sex: data.sex as any,
          size: data.size as any,
          breed: data.breed,
          age_range: data.age_range as any,
          neutered_status: data.neutered_status as any,
          description: data.description || undefined,
          photos: uploadedPhotos,
          color_ids: data.color_ids,
          trait_ids: data.trait_ids
        })
      }

      setCurrentStep(4)
    } catch (error: any) {
      console.error(error)
      toast.error(error.message || `Erro inesperado ao ${isEditMode ? "atualizar" : "cadastrar"} o pet.`)
      form.trigger()
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleResetOrNavigate = () => {
    if (isEditMode && petId) {
      navigate(`/home/pets/${petId}`)
    } else {
      form.reset()
      setCurrentStep(0)
    }
  }

  const currentStepMeta = STEPS[Math.min(currentStep, 3)]

  return (
    <div className="flex flex-1 flex-col h-full bg-slate-50/50">
      {currentStep < 4 && (
        <AuthPageHeader
          title={isEditMode ? "Editar pet" : "Cadastrar novo pet"}
          subtitle={isEditMode ? "Atualize as informações do pet." : "Preencha os dados por etapas para disponibilizá-lo para adoção."}
        />
      )}

      <ScrollArea className="flex-1 px-4 lg:px-8 pb-12">
        <div className="max-w-3xl mx-auto w-full pt-6">

          {currentStep < 4 && <StepperNav currentStep={currentStep} />}

          <FormProvider {...form}>
            <form onSubmit={(e) => { e.preventDefault() }}>
              {currentStep < 4 && (
                <Card className="rounded-2xl border-border shadow-sm bg-white overflow-hidden mb-8">

                  {/* Título da etapa dentro do card */}
                  <div className="px-6 md:px-8 pt-6 pb-5 border-b border-border">
                    <h2 className="text-lg font-semibold font-sans text-foreground leading-tight">
                      {currentStepMeta.title}
                    </h2>
                    <p className="text-sm text-muted-foreground font-sans mt-1">
                      {currentStepMeta.subtitle}
                    </p>
                  </div>

                  <CardContent className="p-6 md:p-8">
                    {currentStep === 0 && <Step1BasicInfo />}
                    {currentStep === 1 && <Step2Photos />}
                    {currentStep === 2 && (
                      <Step3Characteristics colorsCatalog={colors} traitsCatalog={traits} />
                    )}
                    {currentStep === 3 && <Step4Description />}
                  </CardContent>

                  {/* Footer de ações */}
                  <div className="px-6 md:px-8 py-6 border-t border-border flex items-center justify-between">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={prevStep}
                      disabled={currentStep === 0 || isSubmitting}
                      className={cn(
                        "h-10 px-6 rounded-lg font-sans font-medium",
                        currentStep === 0 && "invisible"
                      )}
                    >
                      Voltar
                    </Button>

                    {currentStep < 3 ? (
                      <Button
                        type="button"
                        onClick={nextStep}
                        className="h-10 px-8 rounded-lg bg-primary hover:bg-[#2d0254] text-primary-foreground font-sans font-medium transition-all active:scale-95"
                      >
                        Continuar
                      </Button>
                    ) : (
                      <Button
                        type="button"
                        onClick={form.handleSubmit(onSubmit as any)}
                        disabled={isSubmitting}
                        className="h-10 px-8 rounded-lg bg-primary hover:bg-[#2d0254] text-primary-foreground font-sans font-medium transition-all active:scale-95 flex items-center gap-2"
                      >
                        {isSubmitting ? "Finalizando..." : "Concluir Cadastro"}
                        {!isSubmitting && <CheckCircle2 className="w-4 h-4" />}
                      </Button>
                    )}
                  </div>
                </Card>
              )}

              {currentStep === 4 && <Step5Success onNewPet={handleResetOrNavigate} isEditMode={isEditMode} petName={form.watch("name")} />}
            </form>
          </FormProvider>

        </div>
      </ScrollArea>
    </div>
  )
}
