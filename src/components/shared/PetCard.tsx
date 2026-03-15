import { Card, CardContent, CardFooter } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { PawPrint, MapPin } from "lucide-react"
import { displaySpecies, displaySize, displayGender } from "@/lib/filters"
import { cn } from "@/lib/utils"
import { useAuth } from "@/context/AuthContext"
import { useNavigate } from "react-router-dom"

export interface PetCardData {
  id: string
  name: string
  species: string
  sex: string
  size: string
  breed: string
  age: string
  status?: string | null
  city?: string | null
  state?: string | null
  photoUrl: string | null
}

export interface PetCardProps {
  pet: PetCardData
  context: "public" | "authenticated"
  distance?: string
  // Optional override for navigation if the parent wants to handle it
  onNavigate?: () => void
}

function displayAge(value: string): string {
  if (value === "up_to_1_year") return "Até 1 ano"
  if (value === "from_1_to_3_years") return "1–3 anos"
  if (value === "from_3_to_6_years") return "3–6 anos"
  if (value === "over_6_years") return "Mais de 6 anos"
  return value
}

function displayStatusText(value: string): string {
  if (value === "available") return "Disponível"
  if (value === "adopted") return "Adotado"
  if (value === "removed") return "Removido"
  return value
}

export function PetCard({ pet, context, distance, onNavigate }: PetCardProps) {
  const { user } = useAuth()
  const navigate = useNavigate()

  const placeholderImg = `https://placehold.co/400x300/f1f5f9/94a3b8?text=${encodeURIComponent(pet.name)}`
  const imgSrc = pet.photoUrl || placeholderImg

  const handleViewDetails = () => {
    if (onNavigate) {
      onNavigate()
      return
    }

    if (context === "authenticated") {
      navigate(`/home/pets/${pet.id}`)
    } else {
      if (user) {
        navigate(`/home/pets/${pet.id}`)
      } else {
        localStorage.setItem("pending_pet_redirect", pet.id)
        navigate("/login")
      }
    }
  }

  return (
    <Card className="group flex h-full flex-col overflow-hidden rounded-2xl border border-border bg-white shadow-sm transition-shadow hover:shadow-md">
      {/* Photo */}
      <div className="relative h-40 w-full shrink-0 overflow-hidden bg-muted">
        <img
          src={imgSrc}
          alt={`Foto de ${pet.name}`}
          className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
          loading="lazy"
          onError={(e) => {
            ;(e.currentTarget as HTMLImageElement).src = placeholderImg
          }}
        />
        {/* Status badge */}
        {pet.status && (
          <div className="absolute left-2 top-2">
            <span
              className={cn(
                "inline-flex items-center rounded-lg border px-2.5 py-0.5 font-sans text-xs font-medium backdrop-blur-sm transition-colors",
                pet.status === "available"
                  ? "border-emerald-200 bg-white/90 text-emerald-700 hover:border-emerald-600 hover:bg-emerald-600 hover:text-white"
                  : pet.status === "adopted"
                    ? "border-sky-200 bg-white/90 text-sky-700 hover:border-sky-600 hover:bg-sky-600 hover:text-white"
                    : "border-border bg-white/90 text-muted-foreground hover:bg-muted hover:text-foreground"
              )}
            >
              {displayStatusText(pet.status)}
            </span>
          </div>
        )}
      </div>

      <CardContent className="flex flex-1 flex-col p-4">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <h3 className="truncate font-sans text-base font-bold leading-tight text-foreground">
              {pet.name}
            </h3>
            <p className="mt-0.5 truncate font-sans text-xs text-muted-foreground">
              {pet.breed} · {displaySize(pet.size)}
            </p>
          </div>
          <Badge variant="outline" className="h-6 shrink-0 rounded-lg font-sans text-xs">
            {displayGender(pet.sex)}
          </Badge>
        </div>

        <div className="mt-3 flex flex-col gap-1.5">
          <div className="flex items-center gap-1.5 font-sans text-xs text-muted-foreground">
            <PawPrint className="h-3.5 w-3.5 shrink-0" />
            <span className="truncate">
              {displaySpecies(pet.species)} • {displayAge(pet.age)}
            </span>
          </div>
          {(pet.city || pet.state) && (
            <div className="flex items-center gap-1.5 font-sans text-xs text-muted-foreground">
              <MapPin className="h-3.5 w-3.5 shrink-0" />
              <span className="truncate">
                {[pet.city, pet.state].filter(Boolean).join(", ")}
              </span>
              {distance && <span className="ml-auto font-medium text-primary md:ml-0">• {distance}</span>}
            </div>
          )}
        </div>
      </CardContent>

      <CardFooter className="mt-auto shrink-0 p-4 pt-0">
        <button
          onClick={handleViewDetails}
          className="flex w-full items-center justify-center rounded-lg bg-primary/10 py-2 font-sans text-xs font-semibold text-primary transition-colors hover:bg-primary/20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
          aria-label={`Ver detalhes de ${pet.name}`}
        >
          Ver detalhes
        </button>
      </CardFooter>
    </Card>
  )
}
