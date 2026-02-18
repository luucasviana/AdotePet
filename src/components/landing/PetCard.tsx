import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardFooter } from "@/components/ui/card"
import type { Pet } from "@/data/pets"
import { MapPin } from "lucide-react"

interface PetCardProps {
    pet: Pet
    distance?: string
}

export function PetCard({ pet, distance }: PetCardProps) {
    return (
        <Card className="group overflow-hidden border-none shadow-md transition-shadow hover:shadow-xl">
            <div className="relative h-[140px] md:aspect-square w-full overflow-hidden bg-muted">
                <img
                    src={pet.photoUrl}
                    alt={`Foto de ${pet.name}`}
                    className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                    loading="lazy"
                />
                <div className="absolute right-2 top-2 flex flex-col gap-1 md:right-3 md:top-3 md:gap-2">
                    {pet.badges.map(badge => (
                        <Badge key={badge} variant="secondary" className="backdrop-blur-md bg-white/80 text-[10px] px-1.5 py-0.5 md:text-xs md:px-2.5 md:py-0.5">{badge}</Badge>
                    ))}
                </div>
            </div>

            <CardContent className="p-3 md:p-4">
                <div className="flex justify-between items-start">
                    <div className="min-w-0 pr-1"> {/* prevent overflow in small cards */}
                        <h3 className="text-base font-bold text-foreground truncate md:text-xl">{pet.name}</h3>
                        <p className="text-xs text-muted-foreground truncate md:text-sm">{pet.breed} • {pet.size}</p>
                    </div>
                    <Badge variant="outline" className="capitalize text-[10px] px-1.5 h-5 md:text-xs md:px-2.5 md:h-auto">{pet.gender}</Badge>
                </div>

                <div className="mt-2 flex items-center gap-1 text-xs text-muted-foreground md:mt-4 md:gap-2 md:text-sm">
                    <MapPin className="h-3 w-3 shrink-0 md:h-4 md:w-4" />
                    <span className="truncate">{pet.city}, {pet.state}</span>
                    {distance && <span className="font-medium text-primary ml-auto md:ml-0">• {distance}</span>}
                </div>
            </CardContent>

            <CardFooter className="p-3 pt-0 md:p-4 md:pt-0">
                <button className="flex w-full items-center justify-center rounded-md bg-primary/10 py-1.5 text-xs font-semibold text-primary transition-colors hover:bg-primary/20 md:rounded-lg md:py-2.5 md:text-sm">
                    Ver detalhes
                </button>
            </CardFooter>
        </Card>
    )
}
