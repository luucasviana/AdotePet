import { MapPin, Mail, Building2, User, Heart, Loader2 } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Skeleton } from "@/components/ui/skeleton"
import { Card, CardContent } from "@/components/ui/card"

export type ResponsibleType = "PF" | "PJ" | "ADMIN"

export interface ResponsibleProfileData {
  id: string
  userType: ResponsibleType
  name: string
  orgType?: string
  avatarOrLogoUrl?: string
  email?: string
  locationShort?: string
  distanceText?: string
}

interface ResponsibleProfileCardProps {
  profile?: ResponsibleProfileData | null
  loading?: boolean
  error?: boolean
  
  // Ações do CTA
  onAdoptClick?: () => void
  isAdopting?: boolean
  hasActiveAdoption?: boolean
  canAdopt?: boolean // Controla se o botão deve ser renderizado (ex: o dono próprio não vê)
}

/**
 * Helper interno para gerar as Iniciais
 */
function getInitials(name: string): string {
  if (!name) return "??"
  const words = name.trim().split(/\s+/)
  if (words.length === 1) return words[0].slice(0, 2).toUpperCase()
  return (words[0][0] + words[1][0]).toUpperCase()
}

/**
 * Wrapper de produto: Bloco de "Responsável por este pet" + CTA ("Quero Adotar" / WhatsApp)
 */
export function ResponsibleProfileCard({
  profile,
  loading = false,
  error = false,
  onAdoptClick,
  isAdopting = false,
  hasActiveAdoption = false,
  canAdopt = false,
}: ResponsibleProfileCardProps) {

  // Loading Skeleton
  if (loading) {
    return (
      <Card className="rounded-2xl border-border shadow-sm bg-white overflow-hidden mt-6">
        <CardContent className="p-6 md:p-8 flex flex-col md:flex-row gap-6">
          <div className="flex gap-4 flex-1">
            <Skeleton className="h-16 w-16 shrink-0 rounded-2xl" />
            <div className="flex flex-col gap-2 w-full max-w-[200px]">
              <Skeleton className="h-5 w-full" />
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-4 w-1/2" />
            </div>
          </div>
          <div className="flex flex-col gap-2 w-full md:w-auto md:min-w-[250px]">
            <Skeleton className="h-12 w-full rounded-lg" />
            <Skeleton className="h-3 w-3/4 mx-auto md:ml-auto md:mr-0" />
          </div>
        </CardContent>
      </Card>
    )
  }

  // Error ou Ausência (Fallback visual)
  if (error || !profile) {
    return (
      <Card className="rounded-2xl border-border shadow-sm bg-muted/40 overflow-hidden mt-6">
        <CardContent className="p-6 md:p-8 text-center text-muted-foreground font-sans">
          <p>Informações do responsável indisponíveis no momento.</p>
        </CardContent>
      </Card>
    )
  }

  const isPJ = profile.userType === "PJ"
  const tagLabel = isPJ ? (profile.orgType || "Organização Institucional") : "Responsável pelo pet"
  
  return (
    <Card className="rounded-2xl border-border shadow-sm bg-white overflow-hidden mt-6">
      <CardContent className="p-6 md:p-8 flex flex-col md:flex-row gap-6 md:items-center md:justify-between">
        
        {/* Lado Esquerdo: Avatar/Logo + Dados */}
        <div className="flex gap-4 items-start md:items-center flex-1 min-w-0">
          <Avatar className="h-16 w-16 shrink-0 rounded-2xl border border-border">
            <AvatarImage src={profile.avatarOrLogoUrl} className="object-cover" alt={`Foto de ${profile.name}`} />
            <AvatarFallback className="rounded-2xl bg-[#3B0270]/8 text-[#3B0270] font-bold text-xl font-sans">
              {getInitials(profile.name)}
            </AvatarFallback>
          </Avatar>

          <div className="flex flex-col gap-1 min-w-0">
            <h3 className="font-bold font-sans text-lg text-foreground truncate w-full" title={profile.name}>
              {profile.name}
            </h3>
            
            <div className="flex items-center gap-2 flex-wrap mb-1">
              <Badge variant="secondary" className="font-medium text-[10px] md:text-xs">
                {isPJ ? <Building2 className="w-3 h-3 mr-1 inline-block" /> : <User className="w-3 h-3 mr-1 inline-block" />}
                {tagLabel}
              </Badge>
              {profile.distanceText && (
                <span className="text-xs font-semibold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-md">
                  A {profile.distanceText}
                </span>
              )}
            </div>

            {(profile.locationShort || profile.email) && (
              <div className="flex flex-col gap-0.5 mt-1 text-xs text-muted-foreground font-sans truncate">
                {profile.locationShort && (
                  <span className="flex items-center gap-1.5 truncate" title={profile.locationShort}>
                    <MapPin className="h-3 w-3 shrink-0" />
                    <span className="truncate">{profile.locationShort}</span>
                  </span>
                )}
                {profile.email && isPJ && (
                  <span className="flex items-center gap-1.5 truncate" title={profile.email}>
                    <Mail className="h-3 w-3 shrink-0" />
                    <span className="truncate">{profile.email}</span>
                  </span>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Lado Direito: CTA */}
        {canAdopt && (
          <div className="flex flex-col gap-2 shrink-0 w-full md:w-auto mt-2 md:mt-0 items-center md:items-end">
            <Button
              disabled={isAdopting}
              onClick={onAdoptClick}
              className="h-12 md:h-11 gap-2 rounded-lg font-sans font-bold bg-[#3B0270] hover:bg-[#2d0254] text-white w-full md:w-auto px-8 text-base shadow-sm"
            >
              {isAdopting ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Heart className="h-5 w-5" />
              )}
              {hasActiveAdoption ? "Interesse já registrado" : "Iniciar adoção"}
            </Button>
            
            {hasActiveAdoption ? (
               <p className="text-xs text-muted-foreground font-sans text-center md:text-right max-w-[280px]">
                 Processo em andamento — converse com o responsável pelo WhatsApp.
               </p>
            ) : (
              <p className="text-xs text-muted-foreground font-sans text-center md:text-right max-w-[280px] leading-relaxed">
                Você será encaminhado para o WhatsApp <br className="hidden md:block"/>do responsável para iniciar o processo.
              </p>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
