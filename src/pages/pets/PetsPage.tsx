import { useState, useEffect, useMemo } from "react"
import { useNavigate } from "react-router-dom"
import { supabase } from "@/lib/supabase"
import { AuthPageHeader } from "@/components/layout/AuthPageHeader"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

import { Skeleton } from "@/components/ui/skeleton"
import { Separator } from "@/components/ui/separator"
import { ScrollArea } from "@/components/ui/scroll-area"
import {
  Search,
  PlusCircle,
  AlertCircle,
  PawPrint,
  X,
  SlidersHorizontal,
} from "lucide-react"
import { PetCard } from "@/components/shared/PetCard"

// ─── Types ───────────────────────────────────────────────────────────────────

interface SupabasePet {
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
  created_at: string
  primary_photo: string | null
}

interface Filters {
  species: string
  sex: string
  size: string
  status: string
  search: string
}

const PAGE_SIZE = 12

// ─── Component ─────────────────────────────────────────────────────────
// ─── Skeleton cards ───────────────────────────────────────────────────────────

function PetGridSkeleton() {
  return (
    <div className="grid grid-cols-2 gap-4 lg:grid-cols-3 xl:grid-cols-4">
      {Array.from({ length: 8 }).map((_, i) => (
        <div key={i} className="flex flex-col gap-3">
          <Skeleton className="h-40 w-full rounded-2xl" />
          <Skeleton className="h-4 w-3/4 rounded-lg" />
          <Skeleton className="h-3 w-1/2 rounded-lg" />
        </div>
      ))}
    </div>
  )
}

// ─── Empty state ──────────────────────────────────────────────────────────────

function EmptyState({
  hasFilters,
  onClear,
  onAdd,
}: {
  hasFilters: boolean
  onClear: () => void
  onAdd: () => void
}) {
  return (
    <div className="flex flex-col items-center justify-center py-24 text-center">
      <div className="mb-4 rounded-full bg-muted p-5">
        <PawPrint className="h-10 w-10 text-muted-foreground" />
      </div>
      <h3 className="text-lg font-bold font-sans text-foreground">
        {hasFilters ? "Nenhum pet encontrado com esses filtros" : "Nenhum pet cadastrado ainda"}
      </h3>
      <p className="mt-2 max-w-xs text-sm text-muted-foreground font-sans">
        {hasFilters
          ? "Tente remover ou ajustar os filtros para ver mais resultados."
          : "Cadastre seu primeiro pet para começar a receber solicitações de adoção."}
      </p>
      <div className="mt-6 flex gap-3">
        {hasFilters && (
          <Button variant="outline" onClick={onClear} className="h-10 rounded-lg font-sans">
            <X className="mr-2 h-4 w-4" />
            Limpar filtros
          </Button>
        )}
        {!hasFilters && (
          <Button onClick={onAdd} className="h-10 rounded-lg font-sans">
            <PlusCircle className="mr-2 h-4 w-4" />
            Cadastrar pet
          </Button>
        )}
      </div>
    </div>
  )
}

// ─── Error state ──────────────────────────────────────────────────────────────

function ErrorState({ onRetry }: { onRetry: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center py-24 text-center">
      <div className="mb-4 rounded-full bg-destructive/10 p-5">
        <AlertCircle className="h-10 w-10 text-destructive" />
      </div>
      <h3 className="text-lg font-bold font-sans text-foreground">Erro ao carregar pets</h3>
      <p className="mt-2 max-w-xs text-sm text-muted-foreground font-sans">
        Ocorreu um problema ao buscar os pets. Verifique sua conexão e tente novamente.
      </p>
      <Button
        variant="outline"
        onClick={onRetry}
        className="mt-6 h-10 rounded-lg font-sans"
      >
        Tentar novamente
      </Button>
    </div>
  )
}

// ─── Pagination ───────────────────────────────────────────────────────────────

function PetsPagination({
  currentPage,
  totalPages,
  startIndex,
  endIndex,
  totalResults,
  onPageChange,
}: {
  currentPage: number
  totalPages: number
  startIndex: number
  endIndex: number
  totalResults: number
  onPageChange: (page: number) => void
}) {
  if (totalPages <= 1) return null

  const getPageNumbers = () => {
    const pages: (number | "...")[] = []
    if (totalPages <= 5) {
      for (let i = 1; i <= totalPages; i++) pages.push(i)
    } else {
      pages.push(1)
      if (currentPage > 3) pages.push("...")
      const start = Math.max(2, currentPage - 1)
      const end = Math.min(totalPages - 1, currentPage + 1)
      for (let i = start; i <= end; i++) pages.push(i)
      if (currentPage < totalPages - 2) pages.push("...")
      pages.push(totalPages)
    }
    return pages
  }

  return (
    <div className="flex flex-col items-center justify-between gap-4 py-4 md:flex-row">
      <p className="order-2 text-sm text-muted-foreground font-sans md:order-1">
        Mostrando{" "}
        <span className="font-medium text-foreground">{startIndex + 1}–{endIndex}</span>{" "}
        de{" "}
        <span className="font-medium text-foreground">{totalResults}</span>
      </p>
      <div className="order-1 flex items-center gap-2 md:order-2">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 1}
          className="h-10 px-3 font-sans rounded-lg"
        >
          Anterior
        </Button>
        {getPageNumbers().map((page, i) =>
          page === "..." ? (
            <span key={`ellipsis-${i}`} className="px-2 text-muted-foreground">…</span>
          ) : (
            <Button
              key={page}
              variant={currentPage === page ? "default" : "outline"}
              size="sm"
              onClick={() => onPageChange(page as number)}
              className="h-10 w-10 p-0 rounded-lg font-sans"
            >
              {page}
            </Button>
          )
        )}
        <Button
          variant="ghost"
          size="sm"
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          className="h-10 px-3 font-sans rounded-lg"
        >
          Próximo
        </Button>
      </div>
    </div>
  )
}

// ─── Filters Bar ──────────────────────────────────────────────────────────────

function FiltersBar({
  filters,
  onChange,
  onSearch,
  onClear,
  hasActiveFilters,
}: {
  filters: Filters
  onChange: (key: keyof Filters, value: string) => void
  onSearch: () => void
  onClear: () => void
  hasActiveFilters: boolean
}) {
  return (
    <div className="w-full rounded-2xl border border-border/60 bg-white p-4 shadow-sm md:p-6">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-[2fr_1fr_1fr_1fr_1fr_auto]">
        {/* Busca por nome */}
        <div className="space-y-2">
          <label className="text-sm font-medium font-sans text-muted-foreground">
            Buscar pet
          </label>
          <Input
            placeholder="Nome do pet..."
            value={filters.search}
            onChange={(e) => onChange("search", e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && onSearch()}
            className="h-10 rounded-lg font-sans"
          />
        </div>

        {/* Espécie */}
        <div className="space-y-2">
          <label className="text-sm font-medium font-sans text-muted-foreground">Espécie</label>
          <Select value={filters.species} onValueChange={(v) => onChange("species", v)}>
            <SelectTrigger className="h-10 rounded-lg font-sans">
              <SelectValue placeholder="Qualquer" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Qualquer</SelectItem>
              <SelectItem value="dog">Cachorro</SelectItem>
              <SelectItem value="cat">Gato</SelectItem>
              <SelectItem value="bird">Ave</SelectItem>
              <SelectItem value="reptile">Réptil</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Sexo */}
        <div className="space-y-2">
          <label className="text-sm font-medium font-sans text-muted-foreground">Sexo</label>
          <Select value={filters.sex} onValueChange={(v) => onChange("sex", v)}>
            <SelectTrigger className="h-10 rounded-lg font-sans">
              <SelectValue placeholder="Qualquer" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Qualquer</SelectItem>
              <SelectItem value="male">Macho</SelectItem>
              <SelectItem value="female">Fêmea</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Porte */}
        <div className="space-y-2">
          <label className="text-sm font-medium font-sans text-muted-foreground">Porte</label>
          <Select value={filters.size} onValueChange={(v) => onChange("size", v)}>
            <SelectTrigger className="h-10 rounded-lg font-sans">
              <SelectValue placeholder="Qualquer" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Qualquer</SelectItem>
              <SelectItem value="mini">Mini</SelectItem>
              <SelectItem value="small">Pequeno</SelectItem>
              <SelectItem value="medium">Médio</SelectItem>
              <SelectItem value="large">Grande</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Status */}
        <div className="space-y-2">
          <label className="text-sm font-medium font-sans text-muted-foreground">Status</label>
          <Select value={filters.status} onValueChange={(v) => onChange("status", v)}>
            <SelectTrigger className="h-10 rounded-lg font-sans">
              <SelectValue placeholder="Todos" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos</SelectItem>
              <SelectItem value="available">Disponível</SelectItem>
              <SelectItem value="adopted">Adotado</SelectItem>
              <SelectItem value="removed">Removido</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Actions */}
        <div className="flex items-end gap-2">
          <Button
            onClick={onSearch}
            className="h-10 w-full px-4 rounded-lg font-sans lg:w-auto"
          >
            <Search className="mr-2 h-4 w-4" />
            Buscar
          </Button>
          {hasActiveFilters && (
            <Button
              variant="ghost"
              onClick={onClear}
              className="h-10 px-3 rounded-lg font-sans text-muted-foreground hover:text-foreground"
            >
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>
      </div>
    </div>
  )
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export function PetsPage() {
  const navigate = useNavigate()

  const [allPets, setAllPets] = useState<SupabasePet[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [currentPage, setCurrentPage] = useState(1)

  const [filters, setFilters] = useState<Filters>({
    species: "all",
    sex: "all",
    size: "all",
    status: "all",
    search: "",
  })

  // Committed filters (only applied when user clicks "Buscar")
  const [activeFilters, setActiveFilters] = useState<Filters>(filters)

  // ── Fetch pets from Supabase ──────────────────────────────────────────────
  const fetchPets = async () => {
    setLoading(true)
    setError(null)
    try {
      // Step 1: resolve responsible profile via RPC (handles PJ, PF+PJ, PF independent)
      const { data: responsible, error: rpcError } = await supabase.rpc(
        "resolve_responsible_profile"
      )

      if (rpcError || !responsible) {
        throw new Error(rpcError?.message || "Não foi possível identificar o perfil responsável.")
      }

      const responsibleId: string = responsible.responsible_id

      // Step 2: Fetch pets where responsible_profile_id = responsibleId
      // Use left join (not !inner) so pets without photos still appear
      const { data: pets, error: petsError } = await supabase
        .from("pets")
        .select(
          `
          id, name, species, sex, size, breed, age_range, neutered_status,
          description, status, city, address_state, created_at,
          pet_photos(file_url, is_primary, sort_order)
          `
        )
        .eq("responsible_profile_id", responsibleId)
        .order("created_at", { ascending: false })

      if (petsError) {
        throw new Error(petsError.message)
      }

      // Step 3: Extract primary photo per pet, with fallback to first photo
      const mapped: SupabasePet[] = (pets ?? []).map((p: any) => {
        const photos: any[] = p.pet_photos ?? []
        // Prefer explicit primary; fall back to lowest sort_order; then first in array
        const primaryPhoto =
          photos.find((ph) => ph.is_primary) ??
          photos.sort((a, b) => (a.sort_order ?? 99) - (b.sort_order ?? 99))[0] ??
          null
        return {
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
          created_at: p.created_at,
          primary_photo: primaryPhoto?.file_url ?? null,
        }
      })

      setAllPets(mapped)
    } catch (err: any) {
      console.error("PetsPage fetchPets error:", err)
      setError(err.message || "Erro inesperado ao carregar os pets.")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchPets()
  }, [])

  // ── Filter + search (client-side on committed filters) ────────────────────
  const filteredPets = useMemo(() => {
    let result = [...allPets]

    if (activeFilters.species !== "all") {
      result = result.filter((p) => p.species === activeFilters.species)
    }
    if (activeFilters.sex !== "all") {
      result = result.filter((p) => p.sex === activeFilters.sex)
    }
    if (activeFilters.size !== "all") {
      result = result.filter((p) => p.size === activeFilters.size)
    }
    if (activeFilters.status !== "all") {
      result = result.filter((p) => p.status === activeFilters.status)
    }
    if (activeFilters.search.trim()) {
      const term = activeFilters.search.trim().toLowerCase()
      result = result.filter(
        (p) =>
          p.name.toLowerCase().includes(term) ||
          p.breed.toLowerCase().includes(term)
      )
    }

    return result
  }, [allPets, activeFilters])

  // Reset page when filters change
  useEffect(() => {
    setCurrentPage(1)
  }, [activeFilters])

  // ── Pagination ────────────────────────────────────────────────────────────
  const totalResults = filteredPets.length
  const totalPages = Math.ceil(totalResults / PAGE_SIZE)
  const startIndex = (currentPage - 1) * PAGE_SIZE
  const endIndex = Math.min(startIndex + PAGE_SIZE, totalResults)
  const pagePets = filteredPets.slice(startIndex, startIndex + PAGE_SIZE)

  const hasActiveFilters =
    activeFilters.species !== "all" ||
    activeFilters.sex !== "all" ||
    activeFilters.size !== "all" ||
    activeFilters.status !== "all" ||
    activeFilters.search.trim() !== ""

  const handleFilterChange = (key: keyof Filters, value: string) => {
    setFilters((prev) => ({ ...prev, [key]: value }))
  }

  const handleSearch = () => {
    setActiveFilters({ ...filters })
    setCurrentPage(1)
  }

  const handleClearFilters = () => {
    const cleared: Filters = { species: "all", sex: "all", size: "all", status: "all", search: "" }
    setFilters(cleared)
    setActiveFilters(cleared)
    setCurrentPage(1)
  }

  const handlePageChange = (page: number) => {
    setCurrentPage(page)
    window.scrollTo({ top: 0, behavior: "smooth" })
  }

  return (
    <div className="flex flex-1 flex-col h-full bg-slate-50/50">
      <AuthPageHeader
        title="Meus pets"
        subtitle="Gerencie todos os pets cadastrados pela sua organização."
        actions={
          <Button
            onClick={() => navigate("/home/pets/novo")}
            className="h-10 rounded-lg gap-2 font-sans bg-primary hover:bg-[#2d0254] text-primary-foreground"
          >
            <PlusCircle className="h-4 w-4" />
            Cadastrar pet
          </Button>
        }
      />

      <ScrollArea className="flex-1 px-4 pb-12 lg:px-8">
        <div className="mx-auto max-w-7xl w-full pt-6 flex flex-col gap-6">

          {/* Filters */}
          <FiltersBar
            filters={filters}
            onChange={handleFilterChange}
            onSearch={handleSearch}
            onClear={handleClearFilters}
            hasActiveFilters={hasActiveFilters}
          />

          {/* Results header */}
          {!loading && !error && (
            <div className="flex items-center justify-between">
              <p className="text-sm text-muted-foreground font-sans">
                {totalResults === 0 ? (
                  hasActiveFilters ? "Nenhum resultado para os filtros aplicados" : "Nenhum pet cadastrado"
                ) : (
                  <>
                    <span className="font-medium text-foreground">{totalResults}</span>{" "}
                    {totalResults === 1 ? "pet encontrado" : "pets encontrados"}
                    {hasActiveFilters && (
                      <button
                        onClick={handleClearFilters}
                        className="ml-3 inline-flex items-center gap-1 text-primary hover:underline"
                      >
                        <SlidersHorizontal className="h-3 w-3" />
                        Limpar filtros
                      </button>
                    )}
                  </>
                )}
              </p>
            </div>
          )}

          {/* Content area */}
          {loading ? (
            <PetGridSkeleton />
          ) : error ? (
            <ErrorState onRetry={fetchPets} />
          ) : filteredPets.length === 0 ? (
            <EmptyState
              hasFilters={hasActiveFilters}
              onClear={handleClearFilters}
              onAdd={() => navigate("/home/pets/novo")}
            />
          ) : (
            <>
              <div className="grid grid-cols-2 gap-4 lg:grid-cols-3 xl:grid-cols-4">
                {pagePets.map((pet) => {
                  const petData = {
                    id: pet.id,
                    name: pet.name,
                    species: pet.species,
                    sex: pet.sex,
                    size: pet.size,
                    breed: pet.breed,
                    age: pet.age_range,
                    status: pet.status,
                    city: pet.city,
                    state: pet.address_state,
                    photoUrl: pet.primary_photo,
                  }
                  return (
                    <PetCard
                      key={pet.id}
                      pet={petData}
                      context="authenticated"
                      onNavigate={() => navigate(`/home/pets/${pet.id}`)}
                    />
                  )
                })}
              </div>

              {totalPages > 1 && (
                <>
                  <Separator />
                  <PetsPagination
                    currentPage={currentPage}
                    totalPages={totalPages}
                    startIndex={startIndex}
                    endIndex={endIndex}
                    totalResults={totalResults}
                    onPageChange={handlePageChange}
                  />
                </>
              )}
            </>
          )}
        </div>
      </ScrollArea>
    </div>
  )
}
