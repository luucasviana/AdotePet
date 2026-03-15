import { useState, useEffect, useMemo } from "react"
import { useNavigate } from "react-router-dom"
import { AuthPageHeader } from "@/components/layout/AuthPageHeader"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Skeleton } from "@/components/ui/skeleton"
import { Separator } from "@/components/ui/separator"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { PetCard } from "@/components/shared/PetCard"
import { QueroAdotarSheet } from "@/components/pf/quero-adotar/QueroAdotarSheet"
import { fetchAvailablePets, type AvailablePetFilters } from "@/lib/actions/adoptions"
import { AlertCircle, PawPrint, Search, X } from "lucide-react"

// ─── Types ────────────────────────────────────────────────────────────────────

interface FilterState extends AvailablePetFilters {
  species: string
  sex: string
  size: string
  search: string
  sortBy: "recent" | "nearest"
}

const DEFAULT_FILTERS: FilterState = {
  species: "all",
  sex: "all",
  size: "all",
  search: "",
  sortBy: "recent",
}

const PAGE_SIZE = 12

// ─── Skeleton ─────────────────────────────────────────────────────────────────

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

// ─── Error State ──────────────────────────────────────────────────────────────

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
      <Button variant="outline" onClick={onRetry} className="mt-6 h-10 rounded-lg font-sans">
        Tentar novamente
      </Button>
    </div>
  )
}

// ─── Empty State ──────────────────────────────────────────────────────────────

function EmptyState({ hasFilters, onClear }: { hasFilters: boolean; onClear: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center py-24 text-center">
      <div className="mb-4 rounded-full bg-muted p-5">
        <PawPrint className="h-10 w-10 text-muted-foreground" />
      </div>
      <h3 className="text-lg font-bold font-sans text-foreground">
        {hasFilters ? "Nenhum pet encontrado" : "Nenhum pet disponível no momento"}
      </h3>
      <p className="mt-2 max-w-xs text-sm text-muted-foreground font-sans">
        {hasFilters
          ? "Tente remover ou ajustar os filtros para ver mais resultados."
          : "Volte em breve! Novos pets são adicionados frequentemente."}
      </p>
      {hasFilters && (
        <Button variant="outline" onClick={onClear} className="mt-6 h-10 rounded-lg font-sans gap-2">
          <X className="h-4 w-4" />
          Limpar filtros
        </Button>
      )}
    </div>
  )
}

// ─── Desktop Filters ──────────────────────────────────────────────────────────

function DesktopFiltersBar({
  filters,
  onChange,
  onSearch,
  onClear,
  hasActiveFilters,
}: {
  filters: FilterState
  onChange: (k: keyof FilterState, v: string) => void
  onSearch: () => void
  onClear: () => void
  hasActiveFilters: boolean
}) {
  return (
    <div className="hidden md:block w-full rounded-2xl border border-border/60 bg-white p-6 shadow-sm">
      <div className="grid grid-cols-[2fr_1fr_1fr_1fr_1fr_auto] gap-4 items-end">
        <div className="space-y-2">
          <label htmlFor="search-name" className="text-sm font-medium font-sans text-muted-foreground">
            Buscar pet
          </label>
          <Input
            id="search-name"
            placeholder="Nome do pet..."
            value={filters.search}
            onChange={(e) => onChange("search", e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && onSearch()}
            className="h-10 rounded-lg font-sans"
          />
        </div>

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

        <div className="space-y-2">
          <label className="text-sm font-medium font-sans text-muted-foreground">Ordenar</label>
          <Select value={filters.sortBy} onValueChange={(v) => onChange("sortBy", v)}>
            <SelectTrigger className="h-10 rounded-lg font-sans">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="recent">Mais recentes</SelectItem>
              <SelectItem value="nearest">Mais próximos</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="flex items-center gap-2">
          <Button onClick={onSearch} className="h-10 px-4 rounded-lg font-sans">
            <Search className="mr-2 h-4 w-4" />
            Buscar
          </Button>
          {hasActiveFilters && (
            <Button
              variant="ghost"
              onClick={onClear}
              className="h-10 px-3 rounded-lg font-sans text-muted-foreground hover:text-foreground"
              aria-label="Limpar filtros"
            >
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>
      </div>
    </div>
  )
}

// ─── Pagination ───────────────────────────────────────────────────────────────

function Pagination({
  currentPage,
  totalPages,
  totalResults,
  startIndex,
  endIndex,
  onPageChange,
}: {
  currentPage: number
  totalPages: number
  totalResults: number
  startIndex: number
  endIndex: number
  onPageChange: (p: number) => void
}) {
  if (totalPages <= 1) return null

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
          className="h-10 px-3 rounded-lg font-sans"
        >
          Anterior
        </Button>
        {pages.map((page, i) =>
          page === "..." ? (
            <span key={`e-${i}`} className="px-2 text-muted-foreground">…</span>
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
          className="h-10 px-3 rounded-lg font-sans"
        >
          Próximo
        </Button>
      </div>
    </div>
  )
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export function QueroAdotarPage() {
  const navigate = useNavigate()

  const [pets, setPets] = useState<any[]>([])
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [currentPage, setCurrentPage] = useState(1)

  const [filters, setFilters] = useState<FilterState>(DEFAULT_FILTERS)
  const [activeFilters, setActiveFilters] = useState<FilterState>(DEFAULT_FILTERS)

  const hasActiveFilters = useMemo(
    () =>
      activeFilters.species !== "all" ||
      activeFilters.sex !== "all" ||
      activeFilters.size !== "all" ||
      (activeFilters.search ?? "").trim() !== "",
    [activeFilters]
  )

  const totalPages = Math.ceil(total / PAGE_SIZE)
  const startIndex = (currentPage - 1) * PAGE_SIZE
  const endIndex = Math.min(startIndex + PAGE_SIZE, total)

  const loadPets = async (f: FilterState, page: number) => {
    setLoading(true)
    setError(null)
    const { data, total: t, error: err } = await fetchAvailablePets(
      {
        species: f.species !== "all" ? f.species : undefined,
        sex: f.sex !== "all" ? f.sex : undefined,
        size: f.size !== "all" ? f.size : undefined,
        search: f.search || undefined,
        sortBy: f.sortBy,
      },
      page,
      PAGE_SIZE
    )
    if (err) setError(err)
    setPets(data)
    setTotal(t)
    setLoading(false)
  }

  useEffect(() => {
    loadPets(activeFilters, currentPage)
  }, [activeFilters, currentPage])

  const handleFilterChange = (key: keyof FilterState, value: string) => {
    setFilters((prev) => ({ ...prev, [key]: value }))
  }

  const handleSearch = () => {
    setActiveFilters({ ...filters })
    setCurrentPage(1)
  }

  const handleClear = () => {
    setFilters(DEFAULT_FILTERS)
    setActiveFilters(DEFAULT_FILTERS)
    setCurrentPage(1)
  }

  const handlePageChange = (page: number) => {
    setCurrentPage(page)
    window.scrollTo({ top: 0, behavior: "smooth" })
  }

  return (
    <div className="flex flex-1 flex-col h-full bg-slate-50/50">
      <AuthPageHeader
        title="Quero adotar"
        subtitle="Encontre seu novo melhor amigo"
      />

      <ScrollArea className="flex-1 px-4 pb-12 lg:px-8">
        <div className="mx-auto max-w-7xl w-full pt-6 flex flex-col gap-6">

          {/* Filtros desktop */}
          <DesktopFiltersBar
            filters={filters}
            onChange={handleFilterChange}
            onSearch={handleSearch}
            onClear={handleClear}
            hasActiveFilters={hasActiveFilters}
          />

          {/* Mobile: linha com busca rápida + botão filtros */}
          <div className="flex gap-3 md:hidden">
            <Input
              placeholder="Buscar pet pelo nome..."
              value={filters.search}
              onChange={(e) => handleFilterChange("search", e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSearch()}
              className="h-10 flex-1 rounded-lg font-sans"
              aria-label="Buscar pelo nome do pet"
            />
            <QueroAdotarSheet
              filters={filters}
              onChange={handleFilterChange}
              onApply={handleSearch}
              onClear={handleClear}
              hasActiveFilters={hasActiveFilters}
            />
          </div>

          {/* Contagem de resultados */}
          {!loading && !error && (
            <div className="flex items-center justify-between">
              <p className="text-sm text-muted-foreground font-sans">
                {total === 0 ? (
                  hasActiveFilters ? "Nenhum resultado para os filtros aplicados" : "Nenhum pet disponível"
                ) : (
                  <>
                    <span className="font-medium text-foreground">{total}</span>{" "}
                    {total === 1 ? "pet disponível" : "pets disponíveis"}
                  </>
                )}
              </p>
            </div>
          )}

          {/* Conteúdo */}
          {loading ? (
            <PetGridSkeleton />
          ) : error ? (
            <ErrorState onRetry={() => loadPets(activeFilters, currentPage)} />
          ) : pets.length === 0 ? (
            <EmptyState hasFilters={hasActiveFilters} onClear={handleClear} />
          ) : (
            <>
              <div className="grid grid-cols-2 gap-4 lg:grid-cols-3 xl:grid-cols-4">
                {pets.map((pet) => (
                  <PetCard
                    key={pet.id}
                    pet={{
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
                    }}
                    context="authenticated"
                    onNavigate={() => navigate(`/home/pets/${pet.id}`)}
                  />
                ))}
              </div>

              {totalPages > 1 && (
                <>
                  <Separator />
                  <Pagination
                    currentPage={currentPage}
                    totalPages={totalPages}
                    totalResults={total}
                    startIndex={startIndex}
                    endIndex={endIndex}
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
