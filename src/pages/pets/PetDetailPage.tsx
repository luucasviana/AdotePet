import React, { useState, useEffect } from "react"
import { useParams, useNavigate } from "react-router-dom"
import { supabase } from "@/lib/supabase"
import Autoplay from "embla-carousel-autoplay"
import { AuthPageHeader } from "@/components/layout/AuthPageHeader"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Separator } from "@/components/ui/separator"
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { toast } from "sonner"
import {
  ChevronLeft,
  Pencil,
  AlertCircle,
  PawPrint,
  MapPin,
  Heart,
  CalendarDays,
  Swords,
  Palette,
  Ruler,
  Scissors,
  Trash2,
  RefreshCcw
} from "lucide-react"
import { displaySpecies, displaySize, displayGender } from "@/lib/filters"
import { cn } from "@/lib/utils"

// ─── Types ────────────────────────────────────────────────────────────────────

interface PetPhoto {
  id: string
  file_url: string
  sort_order: number
  is_primary: boolean
}

interface PetColor {
  id: string
  label: string
  hex: string
}

interface PetTrait {
  id: string
  label: string
}

interface PetDetail {
  id: string
  name: string
  species: string
  sex: string
  size: string
  breed: string
  age_range: string
  neutered_status: string
  description: string | null
  status: string
  city: string | null
  address_state: string | null
  neighborhood: string | null
  created_at: string
  responsible_profile_id: string
  photos: PetPhoto[]
  colors: PetColor[]
  traits: PetTrait[]
}

// ─── Display helpers ──────────────────────────────────────────────────────────

function displayAgeRange(v: string) {
  const map: Record<string, string> = {
    up_to_1_year: "Até 1 ano",
    from_1_to_3_years: "1–3 anos",
    from_3_to_6_years: "3–6 anos",
    over_6_years: "Mais de 6 anos",
  }
  return map[v] ?? v
}

function displayNeutered(v: string) {
  if (v === "yes") return "Castrado(a)"
  if (v === "no") return "Não castrado(a)"
  return "Não informado"
}

function displayStatus(v: string) {
  if (v === "available") return "Disponível"
  if (v === "adopted") return "Adotado"
  if (v === "removed") return "Removido"
  return v
}

// ─── Info Row ─────────────────────────────────────────────────────────────────

function InfoRow({
  icon: Icon,
  label,
  value,
}: {
  icon?: React.ElementType
  label: string
  value: React.ReactNode
}) {
  return (
    <div className="flex items-start gap-3">
      {Icon && (
        <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary/8">
          <Icon className="h-4 w-4 text-primary" />
        </div>
      )}
      <div className="min-w-0 flex-1">
        <p className="text-xs font-medium font-sans text-muted-foreground uppercase tracking-wide leading-none mb-1">
          {label}
        </p>
        <p className="text-sm font-sans text-foreground leading-snug">{value}</p>
      </div>
    </div>
  )
}

// ─── Photo Gallery ────────────────────────────────────────────────────────────

function PhotoGallery({ photos }: { photos: PetPhoto[] }) {
  const sorted = [...photos].sort((a, b) => {
    if (a.is_primary && !b.is_primary) return -1
    if (!a.is_primary && b.is_primary) return 1
    return a.sort_order - b.sort_order
  })

  if (photos.length === 0) {
    return (
      <div className="flex h-64 w-full items-center justify-center rounded-2xl bg-muted md:h-[400px]">
        <div className="flex flex-col items-center gap-2 text-muted-foreground">
          <PawPrint className="h-10 w-10" />
          <span className="text-sm font-sans">Sem fotos cadastradas</span>
        </div>
      </div>
    )
  }

  const plugin = React.useRef(
    Autoplay({ delay: 4000, stopOnInteraction: false })
  )

  return (
    <Carousel
      opts={{ loop: true }}
      plugins={[plugin.current]}
      className="w-full"
      onMouseEnter={plugin.current.stop}
      onMouseLeave={plugin.current.reset}
    >
      <div className="relative w-full overflow-hidden rounded-2xl bg-muted border border-border">
        <CarouselContent>
          {sorted.map((photo, idx) => (
            <CarouselItem key={photo.id} className="relative h-64 md:h-[400px]">
              <img
                src={photo.file_url}
                alt={`Foto ${idx + 1}`}
                className="absolute inset-0 h-full w-full object-cover"
                loading={idx === 0 ? "eager" : "lazy"}
              />
            </CarouselItem>
          ))}
        </CarouselContent>

        {sorted.length > 1 && (
          <>
            <CarouselPrevious className="absolute left-4 top-1/2 -translate-y-1/2 h-10 w-10 rounded-full border-transparent bg-white/70 hover:bg-white text-primary shadow-sm backdrop-blur-sm transition-all" />
            <CarouselNext className="absolute right-4 top-1/2 -translate-y-1/2 h-10 w-10 rounded-full border-transparent bg-white/70 hover:bg-white text-primary shadow-sm backdrop-blur-sm transition-all" />
          </>
        )}
      </div>
    </Carousel>
  )
}

// ─── Loading skeleton ─────────────────────────────────────────────────────────

function DetailSkeleton() {
  return (
    <div className="mx-auto max-w-3xl w-full pt-6 flex flex-col gap-6 px-4 lg:px-8">
      <Skeleton className="h-80 w-full rounded-2xl" />
      <div className="flex flex-col gap-3">
        <Skeleton className="h-8 w-48 rounded-lg" />
        <Skeleton className="h-5 w-32 rounded-lg" />
      </div>
      <Skeleton className="h-px w-full" />
      <div className="grid grid-cols-2 gap-4">
        {Array.from({ length: 6 }).map((_, i) => (
          <Skeleton key={i} className="h-12 w-full rounded-lg" />
        ))}
      </div>
    </div>
  )
}

// ─── Error state ──────────────────────────────────────────────────────────────

function DetailError({ onBack }: { onBack: () => void }) {
  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-4 py-24 text-center px-8">
      <div className="rounded-full bg-destructive/10 p-5">
        <AlertCircle className="h-10 w-10 text-destructive" />
      </div>
      <h2 className="text-lg font-bold font-sans">Pet não encontrado</h2>
      <p className="max-w-xs text-sm text-muted-foreground font-sans">
        Não foi possível carregar as informações deste pet. Ele pode ter sido removido ou você não tem permissão para visualizá-lo.
      </p>
      <Button onClick={onBack} variant="outline" className="h-10 rounded-lg font-sans mt-2">
        <ChevronLeft className="mr-2 h-4 w-4" />
        Voltar
      </Button>
    </div>
  )
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export function PetDetailPage() {
  const { petId } = useParams<{ petId: string }>()
  const navigate = useNavigate()

  const [pet, setPet] = useState<PetDetail | null>(null)
  const [canEdit, setCanEdit] = useState(false)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)

  // Dialog States
  const [isStatusDialogOpen, setIsStatusDialogOpen] = useState(false)
  const [pendingStatus, setPendingStatus] = useState<string>("available")
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false)

  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)

  useEffect(() => {
    if (!petId) {
      setError(true)
      setLoading(false)
      return
    }
    loadPetDetail(petId)
  }, [petId])

  const loadPetDetail = async (id: string) => {
    setLoading(true)
    setError(false)
    try {
      // 1. Fetch pet + photos + colors + traits in parallel
      const [petRes, photosRes, colorsRes, traitsRes, rpcRes] = await Promise.all([
        supabase
          .from("pets")
          .select("id, name, species, sex, size, breed, age_range, neutered_status, description, status, city, address_state, neighborhood, created_at, responsible_profile_id")
          .eq("id", id)
          .single(),

        supabase
          .from("pet_photos")
          .select("id, file_url, sort_order, is_primary")
          .eq("pet_id", id)
          .order("sort_order"),

        supabase
          .from("pet_color_assignments")
          .select("pet_colors(id, label, hex)")
          .eq("pet_id", id),

        supabase
          .from("pet_trait_assignments")
          .select("pet_traits(id, label)")
          .eq("pet_id", id),

        supabase.rpc("resolve_responsible_profile"),
      ])

      if (petRes.error || !petRes.data) throw new Error("Pet não encontrado")

      const p = petRes.data

      const photos: PetPhoto[] = (photosRes.data ?? []).map((row: any) => ({
        id: row.id,
        file_url: row.file_url,
        sort_order: row.sort_order,
        is_primary: row.is_primary,
      }))

      const colors: PetColor[] = (colorsRes.data ?? [])
        .map((row: any) => row.pet_colors)
        .filter(Boolean)

      const traits: PetTrait[] = (traitsRes.data ?? [])
        .map((row: any) => row.pet_traits)
        .filter(Boolean)

      const petDetail: PetDetail = {
        id: p.id,
        name: p.name,
        species: p.species,
        sex: p.sex,
        size: p.size,
        breed: p.breed,
        age_range: p.age_range,
        neutered_status: p.neutered_status,
        description: p.description ?? null,
        status: p.status,
        city: p.city ?? null,
        address_state: p.address_state ?? null,
        neighborhood: p.neighborhood ?? null,
        created_at: p.created_at,
        responsible_profile_id: p.responsible_profile_id,
        photos,
        colors,
        traits,
      }

      setPet(petDetail)

      // 2. Determine permissions
      if (!rpcRes.error && rpcRes.data) {
        const responsibleId: string = rpcRes.data.responsible_id
        setCanEdit(responsibleId === p.responsible_profile_id)
      }
    } catch (err) {
      console.error("PetDetailPage error:", err)
      setError(true)
    } finally {
      setLoading(false)
    }
  }

  const handleBack = () => navigate(-1)

  const headerSubtitle = pet
    ? `${displaySpecies(pet.species)} · ${displayGender(pet.sex)} · ${pet.breed}`
    : "Carregando..."

  const handleUpdateStatus = async () => {
    if (!pet) return
    setIsUpdatingStatus(true)
    try {
      const { error: updateError } = await supabase
        .from("pets")
        .update({ status: pendingStatus })
        .eq("id", pet.id)
      
      if (updateError) throw updateError
      
      setPet({ ...pet, status: pendingStatus })
      toast.success("Status do pet atualizado com sucesso!")
      setIsStatusDialogOpen(false)
    } catch (err) {
      console.error(err)
      toast.error("Erro ao atualizar o status.")
    } finally {
      setIsUpdatingStatus(false)
    }
  }

  const handleDeletePet = async () => {
    if (!pet) return
    setIsDeleting(true)
    try {
      // Hard delete as requested if 'excluir' is meant. Or we could soft delete, but prompt says 'excluir da base de dados'. We use the delete endpoint.
      const { error: delError } = await supabase.from("pets").delete().eq("id", pet.id)
      if (delError) throw delError
      
      toast.success("Pet excluído com sucesso.")
      navigate("/home/pets", { replace: true })
    } catch (err) {
      console.error(err)
      toast.error("Erro ao excluir o pet.")
      setIsDeleting(false)
    }
  }

  return (
    <div className="flex flex-1 flex-col h-full bg-slate-50/50">
      <AuthPageHeader
        title={pet?.name ?? "Detalhes do pet"}
        subtitle={headerSubtitle}
        actions={
          <div className="flex items-center gap-2">
            {canEdit && pet && (
              <>
                <Button
                  onClick={() => {
                    setPendingStatus(pet.status)
                    setIsStatusDialogOpen(true)
                  }}
                  variant="outline"
                  className="h-10 gap-2 rounded-lg font-sans bg-white"
                >
                  <RefreshCcw className="h-4 w-4" />
                  <span className="hidden sm:inline">Alterar status</span>
                </Button>

                <Button
                  onClick={() => setIsDeleteDialogOpen(true)}
                  variant="outline"
                  className="h-10 gap-2 rounded-lg font-sans border-destructive/20 text-destructive hover:bg-destructive/10 bg-white"
                >
                  <Trash2 className="h-4 w-4" />
                  <span className="hidden sm:inline">Excluir</span>
                </Button>

                <Button
                  onClick={() => navigate(`/home/pets/${pet.id}/editar`)}
                  variant="outline"
                  className="h-10 gap-2 rounded-lg font-sans border-primary text-primary hover:bg-primary/5 bg-white"
                >
                  <Pencil className="h-4 w-4" />
                  <span className="hidden sm:inline">Editar pet</span>
                </Button>
              </>
            )}
          </div>
        }
      />

      {loading ? (
        <ScrollArea className="flex-1">
          <DetailSkeleton />
        </ScrollArea>
      ) : error || !pet ? (
        <DetailError onBack={handleBack} />
      ) : (
        <ScrollArea className="flex-1 pb-12">
          <div className="mx-auto max-w-3xl w-full pt-6 px-4 lg:px-8 pb-12 flex flex-col gap-6">

            {/* ── Photo Gallery ─────────────────────────────────── */}
            <PhotoGallery photos={pet.photos} />

            {/* ── Hero: name + status + actions ────────────────── */}
            <Card className="rounded-2xl border-border shadow-sm bg-white overflow-hidden">
              <CardContent className="p-6 md:p-8">
                <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                  {/* Left: name + quick info */}
                  <div className="flex flex-col gap-2">
                    <div className="flex items-center gap-3 flex-wrap">
                      <h1 className="text-2xl font-bold font-sans text-foreground leading-tight">
                        {pet.name}
                      </h1>
                      <span
                        className={cn(
                          "inline-flex items-center rounded-lg border px-2.5 py-1 text-xs font-semibold font-sans",
                          pet.status === "available"
                            ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                            : pet.status === "adopted"
                              ? "bg-sky-50 text-sky-700 border-sky-200"
                              : "bg-muted text-muted-foreground border-border"
                        )}
                      >
                        {displayStatus(pet.status)}
                      </span>
                    </div>
                    <p className="text-sm text-muted-foreground font-sans">
                      {pet.breed} · {displaySpecies(pet.species)} · {displayGender(pet.sex)}
                    </p>
                    {(pet.city || pet.address_state) && (
                      <p className="flex items-center gap-1.5 text-sm text-muted-foreground font-sans">
                        <MapPin className="h-3.5 w-3.5" />
                        {[pet.neighborhood, pet.city, pet.address_state]
                          .filter(Boolean)
                          .join(", ")}
                      </p>
                    )}
                  </div>

                  {/* Right: CTA (Adotar only if not owner) */}
                  {!canEdit && (
                    <div className="flex flex-col gap-2 shrink-0 md:items-end w-full md:w-auto mt-2 md:mt-0">
                      <Button
                        className="h-11 md:h-10 gap-2 rounded-lg font-sans font-bold bg-primary hover:bg-[#2d0254] text-primary-foreground w-full md:w-auto px-6 text-base md:text-sm"
                      >
                        <Heart className="h-4 w-4" />
                        Adotar pet
                      </Button>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* ── Info sections ─────────────────────────────────── */}
            <Card className="rounded-2xl border-border shadow-sm bg-white overflow-hidden">
              <CardContent className="p-6 md:p-8 flex flex-col gap-6">

                {/* Características físicas */}
                <div className="flex flex-col gap-4">
                  <h2 className="text-base font-bold font-sans text-foreground">
                    Características
                  </h2>
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <InfoRow icon={PawPrint} label="Espécie" value={displaySpecies(pet.species)} />
                    <InfoRow icon={Ruler} label="Porte" value={displaySize(pet.size)} />
                    <InfoRow icon={CalendarDays} label="Faixa etária" value={displayAgeRange(pet.age_range)} />
                    <InfoRow icon={Scissors} label="Castração" value={displayNeutered(pet.neutered_status)} />
                  </div>
                </div>

                {/* Cores */}
                {pet.colors.length > 0 && (
                  <>
                    <Separator />
                    <div className="flex flex-col gap-3">
                      <h2 className="text-base font-bold font-sans text-foreground flex items-center gap-2">
                        <Palette className="h-4 w-4 text-primary" />
                        Cores predominantes
                      </h2>
                      <div className="flex flex-wrap gap-2">
                        {pet.colors.map((color) => (
                          <div
                            key={color.id}
                            className="flex items-center gap-2 rounded-lg border border-border bg-muted/40 px-3 py-1.5"
                          >
                            <span
                              className="h-3 w-3 rounded-full border border-border/40 shrink-0"
                              style={{ backgroundColor: color.hex }}
                            />
                            <span className="text-xs font-medium font-sans text-foreground">
                              {color.label}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </>
                )}

                {/* Personalidade */}
                {pet.traits.length > 0 && (
                  <>
                    <Separator />
                    <div className="flex flex-col gap-3">
                      <h2 className="text-base font-bold font-sans text-foreground flex items-center gap-2">
                        <Swords className="h-4 w-4 text-primary" />
                        Personalidade
                      </h2>
                      <div className="flex flex-wrap gap-2">
                        {pet.traits.map((trait) => (
                          <Badge
                            key={trait.id}
                            variant="secondary"
                            className="rounded-lg h-8 px-3 text-xs font-medium font-sans"
                          >
                            {trait.label}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </>
                )}

                {/* Descrição */}
                {pet.description && (
                  <>
                    <Separator />
                    <div className="flex flex-col gap-3">
                      <h2 className="text-base font-bold font-sans text-foreground flex items-center gap-2">
                        <Heart className="h-4 w-4 text-primary" />
                        Sobre {pet.name}
                      </h2>
                      <p className="text-sm text-muted-foreground font-sans leading-relaxed whitespace-pre-line">
                        {pet.description}
                      </p>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>

            {/* ── Removed redundant bottom buttons ── */}


          </div>
        </ScrollArea>
      )}

      {/* ── Dialogs Gestão de Pet ── */}
      <Dialog open={isStatusDialogOpen} onOpenChange={setIsStatusDialogOpen}>
        <DialogContent className="sm:max-w-md rounded-2xl w-[90%] font-sans">
          <DialogHeader>
            <DialogTitle>Alterar status do pet</DialogTitle>
            <DialogDescription>
              Atualize a disponibilidade deste pet na plataforma.
            </DialogDescription>
          </DialogHeader>
          
          <div className="flex flex-col gap-4 py-4">
            <Select value={pendingStatus} onValueChange={setPendingStatus}>
              <SelectTrigger className="h-11 rounded-lg">
                <SelectValue placeholder="Selecione o status" />
              </SelectTrigger>
              <SelectContent className="rounded-lg">
                <SelectItem value="available">Disponível para adoção</SelectItem>
                <SelectItem value="adopted">Adotado</SelectItem>
                <SelectItem value="removed">Removido (Suspenso/Oculto)</SelectItem>
              </SelectContent>
            </Select>

            <div className="bg-muted p-4 rounded-lg flex flex-col gap-2 border border-border">
              {pendingStatus === "available" && (
                <p className="text-sm text-muted-foreground leading-relaxed">
                  <span className="font-semibold text-emerald-700 block mb-1">Disponível</span>
                  O pet aparecerá na lista pública de buscas e usuários poderão demonstrar interesse e solicitar a adoção.
                </p>
              )}
              {pendingStatus === "adopted" && (
                <p className="text-sm text-muted-foreground leading-relaxed">
                  <span className="font-semibold text-sky-700 block mb-1">Adotado</span>
                  Que notícia boa! O pet não aparecerá mais nos resultados de busca pública, mas continuará constando no seu histórico de adoções finalizadas.
                </p>
              )}
              {pendingStatus === "removed" && (
                <p className="text-sm text-muted-foreground leading-relaxed">
                  <span className="font-semibold text-foreground block mb-1">Removido</span>
                  O pet deixará de ser listado publicamente temporariamente ou de forma definitiva, mas continuará salvo no seu painel para referências.
                </p>
              )}
            </div>
          </div>

          <DialogFooter className="flex-col sm:flex-row gap-2 mt-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsStatusDialogOpen(false)}
              className="h-10 rounded-lg w-full sm:w-auto"
            >
              Cancelar
            </Button>
            <Button
              type="button"
              onClick={handleUpdateStatus}
              disabled={isUpdatingStatus || pendingStatus === pet?.status}
              className="h-10 rounded-lg w-full sm:w-auto bg-primary text-primary-foreground hover:bg-[#2d0254]"
            >
              {isUpdatingStatus ? "Salvando..." : "Salvar alteração"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent className="sm:max-w-md rounded-2xl w-[90%] font-sans border-destructive/20">
          <DialogHeader className="mb-2">
            <div className="w-12 h-12 bg-destructive/10 rounded-full flex items-center justify-center mb-4">
              <Trash2 className="w-6 h-6 text-destructive" />
            </div>
            <DialogTitle className="text-destructive font-bold text-xl">Excluir pet?</DialogTitle>
            <DialogDescription className="text-base mt-2 leading-relaxed">
              Tem certeza de que deseja excluir este pet? <br />
              <strong>Esta ação é irreversível</strong> e removerá todos os dados, fotos e histórico permanentemente da plataforma.
            </DialogDescription>
          </DialogHeader>

          <DialogFooter className="flex-col sm:flex-row gap-2 mt-4 pt-4 border-t border-border">
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsDeleteDialogOpen(false)}
              className="h-10 rounded-lg w-full sm:w-auto font-semibold"
            >
              Cancelar e manter
            </Button>
            <Button
              type="button"
              variant="destructive"
              onClick={handleDeletePet}
              disabled={isDeleting}
              className="h-10 rounded-lg w-full sm:w-auto font-semibold"
            >
              {isDeleting ? "Excluindo..." : "Sim, confirmar exclusão"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

