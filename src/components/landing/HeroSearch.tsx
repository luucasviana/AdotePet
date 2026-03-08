import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { Container } from "@/components/layout/Container"
import { MapPin, Search } from "lucide-react"
import type { SearchFilters } from "@/components/landing/SearchPanel"

interface HeroSearchProps {
    filters: SearchFilters
    onFilterChange: (key: keyof SearchFilters, value: string) => void
    onSearch: () => void
    onUseLocation: () => void
    isLocating: boolean
    sortBy: "recent" | "distance"
    onSortChange: (value: "recent" | "distance") => void
}

export function HeroSearch({
    filters,
    onFilterChange,
    onSearch,
    onUseLocation,
    isLocating,
    sortBy,
    onSortChange,
}: HeroSearchProps) {
    return (
        <section className="relative bg-gradient-to-b from-primary/10 to-transparent pt-12 pb-8 md:pt-20 md:pb-12 lg:pt-24 lg:pb-16">
            <Container>
                <div className="flex flex-col gap-8">
                    {/* Headline */}
                    <div className="space-y-4 text-center">
                        <h1 className="text-4xl font-extrabold tracking-tight text-primary sm:text-5xl md:text-6xl">
                            Encontre seu novo{" "}
                            <span className="text-foreground">melhor amigo.</span>
                        </h1>
                        <p className="mx-auto max-w-[600px] text-lg text-muted-foreground">
                            Centenas de animais esperam por um lar amoroso. Adotar é um ato de amor que muda vidas.
                        </p>
                    </div>

                    {/* Search Panel */}
                    <div className="mx-auto w-full max-w-5xl rounded-2xl bg-white p-4 shadow-md border border-border/60 md:p-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-[1fr_1fr_1fr_1fr_2fr_auto] gap-4 items-end">

                            {/* Espécie */}
                            <div className="space-y-2">
                                <label htmlFor="hero-species" className="text-sm font-medium text-muted-foreground">
                                    Espécie
                                </label>
                                <Select
                                    value={filters.species}
                                    onValueChange={(val) => onFilterChange("species", val)}
                                >
                                    <SelectTrigger id="hero-species" className="h-10">
                                        <SelectValue placeholder="Qualquer" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">Qualquer</SelectItem>
                                        <SelectItem value="Cachorro">Cachorro</SelectItem>
                                        <SelectItem value="Gato">Gato</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            {/* Sexo */}
                            <div className="space-y-2">
                                <label htmlFor="hero-gender" className="text-sm font-medium text-muted-foreground">
                                    Sexo
                                </label>
                                <Select
                                    value={filters.gender}
                                    onValueChange={(val) => onFilterChange("gender", val)}
                                >
                                    <SelectTrigger id="hero-gender" className="h-10">
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
                                <label htmlFor="hero-size" className="text-sm font-medium text-muted-foreground">
                                    Porte
                                </label>
                                <Select
                                    value={filters.size}
                                    onValueChange={(val) => onFilterChange("size", val)}
                                >
                                    <SelectTrigger id="hero-size" className="h-10">
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
                                <label htmlFor="hero-sort" className="text-sm font-medium text-muted-foreground">
                                    Ordenar por
                                </label>
                                <Select
                                    value={sortBy}
                                    onValueChange={(val: "recent" | "distance") => onSortChange(val)}
                                >
                                    <SelectTrigger id="hero-sort" className="h-10">
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
                                    <label htmlFor="hero-location" className="text-sm font-medium text-muted-foreground">
                                        Onde
                                    </label>
                                    <button
                                        onClick={onUseLocation}
                                        disabled={isLocating}
                                        className="flex items-center gap-1 text-xs text-primary hover:underline disabled:opacity-50"
                                        type="button"
                                        aria-label="Usar minha localização atual"
                                    >
                                        <MapPin className="h-3 w-3" aria-hidden="true" />
                                        {isLocating ? "Localizando..." : "Perto de mim"}
                                    </button>
                                </div>
                                <Input
                                    id="hero-location"
                                    placeholder="Cidade, estado ou CEP"
                                    value={filters.location}
                                    onChange={(e) => onFilterChange("location", e.target.value)}
                                    className="h-10"
                                    onKeyDown={(e) => e.key === "Enter" && onSearch()}
                                    aria-label="Localização para busca de pets"
                                />
                            </div>

                            {/* Botão Buscar */}
                            <Button
                                className="h-10 w-full lg:w-auto px-6"
                                onClick={onSearch}
                                aria-label="Buscar pets"
                            >
                                <Search className="mr-2 h-4 w-4" aria-hidden="true" />
                                Buscar
                            </Button>
                        </div>
                    </div>
                </div>
            </Container>
        </section>
    )
}
