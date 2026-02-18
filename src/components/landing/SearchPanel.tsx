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
// import { useGeolocation } removed unused

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
}

export function SearchPanel({
    filters,
    onFilterChange,
    onSearch,
    onUseLocation,
    isLocating,
}: SearchPanelProps) {
    return (
        <div className="w-full rounded-2xl bg-white p-4 shadow-lg border md:p-6 lg:flex lg:items-end lg:gap-4">
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4 lg:flex-1">

                {/* Espécie */}
                <div className="space-y-2">
                    <label className="text-sm font-medium text-muted-foreground">Espécie</label>
                    <Select
                        value={filters.species}
                        onValueChange={(val) => onFilterChange("species", val)}
                    >
                        <SelectTrigger>
                            <SelectValue placeholder="Qualquer" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">Qualquer</SelectItem>
                            <SelectItem value="Cachorro">Cachorro</SelectItem>
                            <SelectItem value="Gato">Gato</SelectItem>
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
                        <SelectTrigger>
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

                {/* Localização */}
                <div className="space-y-2 md:col-span-2 lg:col-span-2">
                    <div className="flex justify-between">
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
                    />
                </div>
            </div>

            <div className="mt-4 lg:mt-0">
                <Button size="lg" className="w-full lg:w-auto" onClick={onSearch}>
                    <Search className="mr-2 h-4 w-4" />
                    Buscar
                </Button>
            </div>
        </div>
    )
}
