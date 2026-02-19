// import * as React from "react" removed unused
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { MapPin, Search } from "lucide-react"

export interface SearchFilters {
    species: string
    size: string
    gender: string
    location: string
}

interface SearchPanelProps {
    filters: SearchFilters
    onFilterChange: (key: keyof SearchFilters, value: string) => void
    onSearch: () => void
    onUseLocation: () => void
    isLocating: boolean
    sortBy: "recent" | "distance"
    onSortChange: (value: "recent" | "distance") => void
}

export function SearchPanel({
    filters,
    onFilterChange,
    onSearch,
    onUseLocation,
    isLocating,
    sortBy,
    onSortChange,
}: SearchPanelProps) {
    return (
        <div className="w-full rounded-2xl bg-white p-4 shadow-sm border border-border/60 md:p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-[1fr_1fr_1fr_1fr_2fr_auto] gap-4 items-end">

                {/* Espécie */}
                <div className="space-y-2">
                    <label className="text-sm font-medium text-muted-foreground">Espécie</label>
                    <Select
                        value={filters.species}
                        onValueChange={(val) => onFilterChange("species", val)}
                    >
                        <SelectTrigger className="h-10">
                            <SelectValue placeholder="Qualquer" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">Qualquer</SelectItem>
                            <SelectItem value="Cachorro">Cachorro</SelectItem>
                            <SelectItem value="Gato">Gato</SelectItem>
                        </SelectContent>
                    </Select>
                </div>

                {/* Sexo (New) */}
                <div className="space-y-2">
                    <label className="text-sm font-medium text-muted-foreground">Sexo</label>
                    <Select
                        value={filters.gender}
                        onValueChange={(val) => onFilterChange("gender", val)}
                    >
                        <SelectTrigger className="h-10">
                            <SelectValue placeholder="Qualquer" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">Qualquer</SelectItem>
                            <SelectItem value="Macho">Macho</SelectItem>
                            <SelectItem value="Fêmea">Fêmea</SelectItem>
                        </SelectContent>
                    </Select>
                </div>

                {/* Porte */}
                <div className="space-y-2">
                    <label className="text-sm font-medium text-muted-foreground">Porte</label>
                    <Select
                        value={filters.size}
                        onValueChange={(val) => onFilterChange("size", val)}
                    >
                        <SelectTrigger className="h-10">
                            <SelectValue placeholder="Qualquer" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">Qualquer</SelectItem>
                            <SelectItem value="Pequeno">Pequeno</SelectItem>
                            <SelectItem value="Médio">Médio</SelectItem>
                            <SelectItem value="Grande">Grande</SelectItem>
                        </SelectContent>
                    </Select>
                </div>

                {/* Ordenação */}
                <div className="space-y-2">
                    <label className="text-sm font-medium text-muted-foreground">Ordenar por</label>
                    <Select
                        value={sortBy}
                        onValueChange={(val: "recent" | "distance") => onSortChange(val)}
                    >
                        <SelectTrigger className="h-10">
                            <SelectValue placeholder="Ordenar" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="recent">Mais recentes</SelectItem>
                            <SelectItem value="distance">Mais próximos</SelectItem>
                        </SelectContent>
                    </Select>
                </div>

                {/* Localização */}
                <div className="space-y-2">
                    <div className="flex justify-between items-center h-5">
                        <label className="text-sm font-medium text-muted-foreground">Onde</label>
                        <button
                            onClick={onUseLocation}
                            disabled={isLocating}
                            className="flex items-center gap-1 text-xs text-primary hover:underline disabled:opacity-50"
                            type="button"
                        >
                            <MapPin className="h-3 w-3" />
                            {isLocating ? "Localizando..." : "Perto de mim"}
                        </button>
                    </div>

                    <Input
                        placeholder="Cidade, estado ou CEP"
                        value={filters.location}
                        onChange={(e) => onFilterChange("location", e.target.value)}
                        className="h-10"
                    />
                </div>

                {/* Botão Buscar */}
                <Button
                    className="h-10 w-full lg:w-auto px-6"
                    onClick={onSearch}
                >
                    <Search className="mr-2 h-4 w-4" />
                    Buscar
                </Button>
            </div>
        </div>
    )
}
