import { useState } from "react"
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet"
import { Button } from "@/components/ui/button"
import { SlidersHorizontal } from "lucide-react"
import type { AvailablePetFilters } from "@/lib/actions/adoptions"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { X } from "lucide-react"

interface FilterState extends AvailablePetFilters {
  species: string
  sex: string
  size: string
  search: string
  sortBy: "recent" | "nearest"
}

interface Props {
  filters: FilterState
  onChange: (key: keyof FilterState, value: string) => void
  onApply: () => void
  onClear: () => void
  hasActiveFilters: boolean
}

/**
 * Sheet de filtros para a tela Quero Adotar (mobile).
 */
export function QueroAdotarSheet({ filters, onChange, onApply, onClear, hasActiveFilters }: Props) {
  const [open, setOpen] = useState(false)

  const handleApply = () => {
    onApply()
    setOpen(false)
  }

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button
          variant="outline"
          className="h-10 gap-2 rounded-lg font-sans relative"
          aria-label="Abrir filtros de busca"
        >
          <SlidersHorizontal className="h-4 w-4" />
          Filtros
          {hasActiveFilters && (
            <span className="absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center rounded-full bg-primary text-[10px] font-bold text-white">
              !
            </span>
          )}
        </Button>
      </SheetTrigger>

      <SheetContent side="bottom" className="rounded-t-2xl px-6 pb-8 pt-6 font-sans">
        <SheetHeader className="mb-6">
          <SheetTitle className="font-sans text-left">Filtrar pets</SheetTitle>
        </SheetHeader>

        <div className="flex flex-col gap-4">
          {/* Busca */}
          <div className="space-y-2">
            <label htmlFor="sheet-search" className="text-sm font-medium text-muted-foreground">
              Nome do pet
            </label>
            <Input
              id="sheet-search"
              placeholder="Buscar pelo nome..."
              value={filters.search}
              onChange={(e) => onChange("search", e.target.value)}
              className="h-10 rounded-lg font-sans"
            />
          </div>

          {/* Espécie */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-muted-foreground">Espécie</label>
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
            <label className="text-sm font-medium text-muted-foreground">Sexo</label>
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
            <label className="text-sm font-medium text-muted-foreground">Porte</label>
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

          {/* Ordenação */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-muted-foreground">Ordenar por</label>
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
        </div>

        <div className="mt-6 flex gap-3">
          {hasActiveFilters && (
            <Button
              variant="outline"
              onClick={() => { onClear(); setOpen(false) }}
              className="h-10 flex-1 rounded-lg font-sans gap-2"
            >
              <X className="h-4 w-4" />
              Limpar
            </Button>
          )}
          <Button
            onClick={handleApply}
            className="h-10 flex-1 rounded-lg font-sans bg-primary hover:bg-[#2d0254] text-primary-foreground"
          >
            Aplicar filtros
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  )
}
