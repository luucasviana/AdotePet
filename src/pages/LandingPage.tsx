import { useState, useMemo } from "react"
import { SiteHeader } from "@/components/landing/SiteHeader"
import { HeroSearch } from "@/components/landing/HeroSearch"
import { SearchPanel } from "@/components/landing/SearchPanel"
// import { SearchSheet } from "@/components/landing/SearchSheet"
import { PetGrid } from "@/components/landing/PetGrid"
import { SocialProof } from "@/components/landing/SocialProof"
import { HowToAdopt } from "@/components/landing/HowToAdopt"
import { MetricsBand } from "@/components/landing/MetricsBand"
import { FaqAccordion } from "@/components/landing/FaqAccordion"
import { SiteFooter } from "@/components/landing/SiteFooter"
import { Container } from "@/components/layout/Container"
import { Section } from "@/components/layout/Section"
import { SectionHeader } from "@/components/landing/SectionHeader"
import { PETS } from "@/data/pets"
import { calculateDistance } from "@/lib/geo"
import type { SearchFilters } from "@/components/landing/SearchPanel"
import { toast } from "sonner"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { X } from "lucide-react"

export function LandingPage() {
    // State
    const [filters, setFilters] = useState<SearchFilters>({
        species: "all",
        size: "all",
        gender: "all",
        location: "",
    })

    const [sortBy, setSortBy] = useState<"recent" | "distance">("recent")
    const [userLocation, setUserLocation] = useState<{ lat: number; lon: number } | null>(null)
    const [isLocating, setIsLocating] = useState(false)
    const [loading, setLoading] = useState(false) // Fake loading for UX

    // Handlers
    const handleFilterChange = (key: keyof SearchFilters, value: string) => {
        setFilters((prev) => ({ ...prev, [key]: value }))
    }

    const handleSearch = () => {
        setLoading(true)
        setTimeout(() => setLoading(false), 500) // Simulate network request
        // In a real app, this might trigger a refetch
    }

    const handleClearFilters = () => {
        setFilters({
            species: "all",
            size: "all",
            gender: "all",
            location: "",
        })
        setSortBy("recent")
        handleSearch()
    }

    const handleUseLocation = () => {
        if (!navigator.geolocation) {
            toast.error("Geolocalização não suportada pelo seu navegador.")
            return
        }

        setIsLocating(true)
        navigator.geolocation.getCurrentPosition(
            (position) => {
                setUserLocation({
                    lat: position.coords.latitude,
                    lon: position.coords.longitude,
                })
                setSortBy("distance")
                setIsLocating(false)
                toast.success("Localização atualizada!")
            },
            (error) => {
                console.error(error)
                setIsLocating(false)
                toast.error("Não foi possível obter sua localização. Verifique as permissões.")
            }
        )
    }

    // Filter Logic
    const filteredPets = useMemo(() => {
        let result = [...PETS]

        // 1. Text Filters
        if (filters.species !== "all") {
            result = result.filter((p) => p.species === filters.species)
        }
        if (filters.size !== "all") {
            result = result.filter((p) => p.size === filters.size)
        }

        // 2. Location Filter (Simple String Match or Coordinates)
        // Note: For this MVP, we are not doing geocoding on the input text, 
        // just simple string matching if user didn't use "Use my location" button logic for sorting.
        // However, if we want to filter by city name typed in input:
        if (filters.location) {
            const term = filters.location.toLowerCase()
            result = result.filter(p =>
                p.city.toLowerCase().includes(term) ||
                p.state.toLowerCase().includes(term)
            )
        }

        // 3. Sorting
        if (sortBy === "distance" && userLocation) {
            result.sort((a, b) => {
                const distA = calculateDistance(userLocation.lat, userLocation.lon, a.lat, a.lon)
                const distB = calculateDistance(userLocation.lat, userLocation.lon, b.lat, b.lon)
                return distA - distB
            })
        } else {
            // Default: Recent (createdAt desc)
            result.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
        }

        return result
    }, [filters, sortBy, userLocation])

    const hasActiveFilters = filters.species !== "all" || filters.size !== "all" || filters.location !== ""

    return (
        <div className="min-h-screen flex flex-col">
            <SiteHeader />

            <main className="flex-1">
                <HeroSearch />

                {/* Mobile Filter Sheet Removed as per request - SearchPanel should be visible */}
                {/* <div className="container py-4 lg:hidden flex justify-end">
                    <SearchSheet
                        filters={filters}
                        onFilterChange={handleFilterChange}
                        onSearch={handleSearch}
                    />
                </div> */}

                <Section id="pets" className="py-12 md:py-16">
                    <Container>
                        <div className="flex flex-col gap-8">
                            <SearchPanel
                                filters={filters}
                                onFilterChange={handleFilterChange}
                                onSearch={handleSearch}
                                onUseLocation={handleUseLocation}
                                isLocating={isLocating}
                            />

                            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                                <SectionHeader
                                    title="Novos amigos perto de você"
                                    subtitle="Confira os pets que acabaram de chegar."
                                    align="left"
                                    className="mb-0" // Reset standard margin because this is in a flex container
                                />

                                <div className="flex items-center gap-4">
                                    {hasActiveFilters && (
                                        <Button variant="ghost" onClick={handleClearFilters} className="text-muted-foreground hover:text-foreground">
                                            <X className="mr-2 h-4 w-4" />
                                            Limpar filtros
                                        </Button>
                                    )}

                                    <div className="w-[200px]">
                                        <Select value={sortBy} onValueChange={(v: any) => setSortBy(v)}>
                                            <SelectTrigger>
                                                <SelectValue placeholder="Ordenar por" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="recent">Mais recentes</SelectItem>
                                                <SelectItem value="distance" disabled={!userLocation}>Mais próximos {(!userLocation) && "(Requer Loc.)"}</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                </div>
                            </div>

                            <PetGrid pets={filteredPets} loading={loading} userLocation={userLocation} />
                        </div>
                    </Container>
                </Section>

                <HowToAdopt />

                <MetricsBand />

                <SocialProof />

                <FaqAccordion />
            </main>

            <SiteFooter />
        </div>
    )
}
