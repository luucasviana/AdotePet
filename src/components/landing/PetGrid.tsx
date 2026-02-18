import type { Pet } from "@/data/pets"
import { PetCard } from "./PetCard"
import { formatDistance, calculateDistance } from "@/lib/geo"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { XCircle } from "lucide-react"

interface PetGridProps {
    pets: Pet[]
    loading: boolean
    userLocation: { lat: number; lon: number } | null
}

export function PetGrid({ pets, loading, userLocation }: PetGridProps) {
    if (loading) {
        return (
            <div className="grid grid-cols-2 gap-4 lg:grid-cols-3 xl:grid-cols-4">
                {Array.from({ length: 8 }).map((_, i) => (
                    <div key={i} className="flex flex-col space-y-3">
                        <Skeleton className="h-[300px] w-full rounded-xl" />
                        <div className="space-y-2">
                            <Skeleton className="h-4 w-[250px]" />
                            <Skeleton className="h-4 w-[200px]" />
                        </div>
                    </div>
                ))}
            </div>
        )
    }

    if (pets.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center py-20 text-center">
                <div className="mb-4 rounded-full bg-muted p-4">
                    <XCircle className="h-8 w-8 text-muted-foreground" />
                </div>
                <h3 className="text-xl font-bold">Nenhum pet encontrado</h3>
                <p className="mt-2 text-muted-foreground">
                    Tente ajustar seus filtros para ver mais resultados.
                </p>
                <Button variant="outline" className="mt-6" onClick={() => window.location.reload()}>
                    Limpar filtros
                </Button>
            </div>
        )
    }

    return (
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-3 xl:grid-cols-4">
            {pets.map((pet) => {
                let distanceStr
                if (userLocation) {
                    const dist = calculateDistance(userLocation.lat, userLocation.lon, pet.lat, pet.lon)
                    distanceStr = formatDistance(dist)
                }

                return <PetCard key={pet.id} pet={pet} distance={distanceStr} />
            })}
        </div>
    )
}
