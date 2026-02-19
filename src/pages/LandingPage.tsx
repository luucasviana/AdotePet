import { useState, useMemo, useEffect } from "react"
import { SiteHeader } from "@/components/landing/SiteHeader"
import { HeroSearch } from "@/components/landing/HeroSearch"
import { SearchPanel } from "@/components/landing/SearchPanel"
// import { SearchSheet } from "@/components/landing/SearchSheet"
import { PetGrid } from "@/components/landing/PetGrid"
import { Pagination } from "@/components/landing/Pagination"
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
import { mapSpeciesToCanonical, mapSizeToCanonical, mapGenderToCanonical } from "@/lib/filters"
import type { SearchFilters } from "@/components/landing/SearchPanel"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { X } from "lucide-react"

const PAGE_SIZE = 8

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
    const [currentPage, setCurrentPage] = useState(1)

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

    const handlePageChange = (page: number) => {
        setCurrentPage(page)
        // Optionally scroll to top of grid
        const gridElement = document.getElementById('pets')
        if (gridElement) {
            const headerOffset = 100
            const elementPosition = gridElement.getBoundingClientRect().top
            const offsetPosition = elementPosition + window.pageYOffset - headerOffset

            window.scrollTo({
                top: offsetPosition,
                behavior: "smooth"
            })
        }
    }

    // Filter Logic
    const filteredPets = useMemo(() => {
        let result = [...PETS]

        // 1. Text Filters & Strict Normalization
        if (filters.species !== "all") {
            const canonicalSpecies = mapSpeciesToCanonical(filters.species)
            if (canonicalSpecies !== "all") {
                result = result.filter((p) => p.species === canonicalSpecies)
            }
        }
        if (filters.size !== "all") {
            const canonicalSize = mapSizeToCanonical(filters.size)
            if (canonicalSize !== "all") {
                result = result.filter((p) => p.size === canonicalSize)
            }
        }
        if (filters.gender !== "all") {
            const canonicalGender = mapGenderToCanonical(filters.gender)
            if (canonicalGender !== "all") {
                result = result.filter((p) => p.gender === canonicalGender)
            }
        }

        // 2. Location Filter (Simple String Match or Coordinates)
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

    // Reset page logic
    useEffect(() => {
        setCurrentPage(1)
    }, [filters, sortBy, userLocation])

    // Pagination Logic
    const totalResults = filteredPets.length
    const totalPages = Math.ceil(totalResults / PAGE_SIZE)
    const startIndex = (currentPage - 1) * PAGE_SIZE
    const endIndex = Math.min(startIndex + PAGE_SIZE, totalResults)
    const pagePets = filteredPets.slice(startIndex, startIndex + PAGE_SIZE)

    const hasActiveFilters = filters.species !== "all" || filters.size !== "all" || filters.location !== ""

    return (
        <div className="min-h-screen flex flex-col">
            <SiteHeader />

            <main className="flex-1">
                <HeroSearch />
                <MetricsBand />

                <Section id="pets" className="py-12 md:py-16">
                    <Container>
                        <div className="flex flex-col gap-6">
                            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                                <SectionHeader
                                    title="Novos amigos perto de você"
                                    subtitle="Confira os pets que acabaram de chegar."
                                    align="left"
                                    className="mb-0"
                                />

                                {hasActiveFilters && (
                                    <Button variant="ghost" onClick={handleClearFilters} className="text-muted-foreground hover:text-foreground">
                                        <X className="mr-2 h-4 w-4" />
                                        Limpar filtros
                                    </Button>
                                )}
                            </div>

                            <SearchPanel
                                filters={filters}
                                onFilterChange={handleFilterChange}
                                onSearch={handleSearch}
                                onUseLocation={handleUseLocation}
                                isLocating={isLocating}
                                sortBy={sortBy}
                                onSortChange={setSortBy}
                            />
                            <PetGrid pets={pagePets} loading={loading} userLocation={userLocation} />

                            {totalPages > 1 && (
                                <>
                                    <Separator className="mt-4" />
                                    <Pagination
                                        currentPage={currentPage}
                                        totalPages={totalPages}
                                        onPageChange={handlePageChange}
                                        startIndex={startIndex}
                                        endIndex={endIndex}
                                        totalResults={totalResults}
                                    />
                                </>
                            )}
                        </div>
                    </Container>
                </Section>

                <HowToAdopt />



                <SocialProof />

                <FaqAccordion />
            </main>

            <SiteFooter />
        </div >
    )
}

