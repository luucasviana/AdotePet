import { useState, useEffect } from "react"
import { SiteHeader } from "@/components/landing/SiteHeader"
import { HeroSearch } from "@/components/landing/HeroSearch"
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
import { mapSpeciesToCanonical, mapSizeToCanonical, mapGenderToCanonical } from "@/lib/filters"
import type { SearchFilters } from "@/components/landing/SearchPanel"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { X, RefreshCcw, Activity } from "lucide-react"

import { supabase } from "@/lib/supabase"
// Temporary use of Pet until we fix PetGrid/PetCard
import type { Pet } from "@/data/pets"

const HEADER_HEIGHT = 64   // SiteHeader h-16
const PROXIMITY_THRESHOLD = 200  // px – skip scroll if already this close
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
    // Note: Since DB doesn't have lat/lon yet, we keep the userLocation state 
    // for UI compatibility but we don't use it for distance sorting server-side right now.
    const [userLocation, setUserLocation] = useState<{ lat: number; lon: number } | null>(null)
    const [isLocating, setIsLocating] = useState(false)
    
    // DB state
    const [pets, setPets] = useState<Pet[]>([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const [totalResults, setTotalResults] = useState(0)
    const [currentPage, setCurrentPage] = useState(1)

    // Handlers
    const handleFilterChange = (key: keyof SearchFilters, value: string) => {
        setFilters((prev) => ({ ...prev, [key]: value }))
        setCurrentPage(1) // Reset to page 1 on filter change
    }

    const scrollToPets = () => {
        const section = document.getElementById("pets")
        if (!section) return

        const rect = section.getBoundingClientRect()
        const distanceFromTop = Math.abs(rect.top)

        // Skip scroll if already within proximity threshold of the section
        if (distanceFromTop <= PROXIMITY_THRESHOLD) return

        const prefersReducedMotion =
            window.matchMedia("(prefers-reduced-motion: reduce)").matches

        const targetY = rect.top + window.scrollY - HEADER_HEIGHT

        window.scrollTo({
            top: targetY,
            behavior: prefersReducedMotion ? "auto" : "smooth",
        })
    }

    const handleSearch = () => {
        setCurrentPage(1) // This will trigger the useEffect to fetch data
        scrollToPets()
    }

    const handleClearFilters = () => {
        setFilters({
            species: "all",
            size: "all",
            gender: "all",
            location: "",
        })
        setSortBy("recent")
        setCurrentPage(1)
        scrollToPets()
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
                setSortBy("recent") // fallback to recent since we can't sort by distance on DB yet
                setIsLocating(false)
                toast.success("Localização atualizada! (Ordenação por distância em breve)")
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

    // Clear any stale pending redirect when landing directly on the public page
    useEffect(() => {
        localStorage.removeItem("pending_pet_redirect")
    }, [])

    // Fetch data from Supabase
    useEffect(() => {
        async function fetchPets() {
            setLoading(true)
            setError(null)
            
            try {
                let query = supabase
                    .from("pets")
                    .select(
                        `id, name, species, breed, size, age_range, sex, neutered_status,
                        city, address_state, created_at,
                        pet_photos (file_url, is_primary)`, 
                        { count: "exact" }
                    )
                    .eq("status", "available")
                
                // 1. Map Text Filters to canonical database values
                if (filters.species !== "all") {
                    const canonical = mapSpeciesToCanonical(filters.species)
                    if (canonical !== "all") query = query.eq("species", canonical)
                }

                if (filters.size !== "all") {
                    const canonical = mapSizeToCanonical(filters.size)
                    // Ensure the canonical value matches the DB enum ("mini", "small", "medium", "large")
                    if (canonical === "small") {
                        query = query.in("size", ["mini", "small"])
                    } else if (canonical !== "all") {
                        query = query.eq("size", canonical)
                    }
                }

                if (filters.gender !== "all") {
                    const canonical = mapGenderToCanonical(filters.gender)
                    if (canonical !== "all") query = query.eq("sex", canonical)
                }

                // 2. Location text search (city or state)
                if (filters.location) {
                    const term = filters.location.trim()
                    query = query.or(`city.ilike.%${term}%,address_state.ilike.%${term}%`)
                }

                // 3. Sorting (fallback everything to created_at desc since lat/lon isn't in DB)
                query = query.order("created_at", { ascending: false })

                // 4. Pagination
                const startIndex = (currentPage - 1) * PAGE_SIZE
                const endIndex = startIndex + PAGE_SIZE - 1
                query = query.range(startIndex, endIndex)

                const { data, error, count } = await query

                if (error) throw error

                // Map Supabase data to PetGrid expected format (`Pet`)
                const mappedPets: Pet[] = (data || []).map((p: any) => {
                    // Resolve primary photo
                    const photos = p.pet_photos || []
                    const primaryPhoto = photos.find((ph: any) => ph.is_primary)
                    const image = primaryPhoto 
                        ? primaryPhoto.file_url 
                        : (photos[0]?.file_url || "https://images.unsplash.com/photo-1548247416-ec66f4900b2e?w=800&q=80") // Generic fallback

                    // Map characteristics to badges (like the mocked data)
                    const badges = []
                    if (p.neutered_status === "yes") badges.push("Castrado")
                    if (p.age_range.includes("up_to_1")) badges.push("Filhote")
                    
                    return {
                        id: p.id,
                        name: p.name,
                        species: p.species, // safe mapping as sizes match
                        breed: p.breed,
                        size: p.size === "mini" ? "small" : p.size, // Normalize mini -> small for UI
                        age: p.age_range,   // UI will display the raw enum for now until a formatter is added
                        gender: p.sex,      // Map sex to gender
                        image: image,
                        location: `${p.city}, ${p.address_state}`,
                        city: p.city || "",
                        state: p.address_state || "",
                        lat: 0, // Fallback as DB does not have it yet
                        lon: 0, // Fallback as DB does not have it yet
                        description: "",
                        createdAt: p.created_at,
                        badges,
                    } as Pet
                })

                setPets(mappedPets)
                setTotalResults(count || 0)

            } catch (err: any) {
                console.error("Error fetching pets:", err)
                setError("Ocorreu um erro ao carregar os pets. Tente de novo.")
                toast.error("Erro ao carregar a lista de pets.")
            } finally {
                setLoading(false)
            }
        }

        fetchPets()
    }, [filters, currentPage, sortBy])

    // Pagination Derived Logic
    const totalPages = Math.ceil(totalResults / PAGE_SIZE)
    const startIndex = (currentPage - 1) * PAGE_SIZE
    const endIndex = Math.min(startIndex + PAGE_SIZE, totalResults)

    const hasActiveFilters = filters.species !== "all" || filters.size !== "all" || filters.gender !== "all" || filters.location !== ""

    return (
        <div className="min-h-screen flex flex-col">
            <SiteHeader />

            <main className="flex-1">
                <HeroSearch
                    filters={filters}
                    onFilterChange={handleFilterChange}
                    onSearch={handleSearch}
                    onUseLocation={handleUseLocation}
                    isLocating={isLocating}
                    sortBy={sortBy}
                    onSortChange={setSortBy}
                />
                <MetricsBand />

                <Section id="pets" className="py-12 md:py-16 scroll-mt-16">
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

                            {error ? (
                                <div className="flex flex-col items-center justify-center py-20 text-center">
                                    <div className="mb-4 rounded-full bg-destructive/10 p-4">
                                       <Activity className="h-8 w-8 text-destructive" />
                                    </div>
                                    <h3 className="text-xl font-bold">Erro ao carregar dados</h3>
                                    <p className="mt-2 text-muted-foreground">
                                        Não foi possível conectar ao servidor.
                                    </p>
                                    <Button variant="outline" className="mt-6" onClick={() => handleFilterChange("species", filters.species)}>
                                        <RefreshCcw className="mr-2 h-4 w-4" />
                                        Tentar novamente
                                    </Button>
                                </div>
                            ) : (
                                <PetGrid pets={pets} loading={loading} userLocation={userLocation} />
                            )}

                            {totalPages > 1 && !loading && !error && (
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
