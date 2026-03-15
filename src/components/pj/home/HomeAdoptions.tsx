import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { PawPrint } from "lucide-react"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { ADOPTION_STATUS_LABEL, type AdoptionWithDetails, type AdoptionStatus } from "@/lib/actions/adoptions"

const STATUS_BADGE: Record<AdoptionStatus, string> = {
  interview:       "bg-blue-100 text-blue-700",
  visit_scheduled: "bg-amber-100 text-amber-700",
  adopted:         "bg-emerald-100 text-emerald-700",
  cancelled:       "bg-slate-100 text-slate-500",
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("pt-BR", {
    day: "2-digit", month: "2-digit", year: "numeric",
  })
}

function getPrimaryPhoto(adoption: AdoptionWithDetails) {
  const photos = adoption.pet?.photos ?? []
  const primary = photos.find((p) => p.is_primary)
  return primary?.file_url ?? photos[0]?.file_url ?? null
}

interface HomeAdoptionsProps {
  isLoading?: boolean
  data?: AdoptionWithDetails[]
}

export function HomeAdoptions({ isLoading, data }: HomeAdoptionsProps) {
  if (isLoading) {
    return (
      <Card className="rounded-2xl border-border shadow-sm flex flex-col h-full">
        <CardHeader className="pb-4">
          <Skeleton className="h-5 w-48 mb-1" />
          <Skeleton className="h-4 w-64" />
        </CardHeader>
        <CardContent className="flex-1">
          <div className="space-y-4">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="flex justify-between items-center gap-4">
                <div className="flex items-center gap-3">
                  <Skeleton className="h-10 w-10 rounded-lg shrink-0" />
                  <div className="space-y-2">
                    <Skeleton className="h-4 w-32" />
                    <Skeleton className="h-3 w-20" />
                  </div>
                </div>
                <Skeleton className="h-6 w-28 rounded-lg" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    )
  }

  if (!data || data.length === 0) {
    return (
      <Card className="rounded-2xl border-border shadow-sm flex flex-col h-full">
        <CardHeader className="pb-4">
          <CardTitle className="text-base font-semibold font-sans">Adoções em Andamento</CardTitle>
          <CardDescription className="font-sans">Acompanhe os processos ativos</CardDescription>
        </CardHeader>
        <CardContent className="flex-1 flex flex-col items-center justify-center py-8">
          <div className="text-center space-y-2">
            <PawPrint className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
            <p className="text-sm font-medium text-muted-foreground font-sans">
              Nenhuma adoção em andamento no momento.
            </p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="rounded-2xl border-border shadow-sm flex flex-col h-full">
      <CardHeader className="pb-4">
        <CardTitle className="text-base font-semibold font-sans">Adoções em Andamento</CardTitle>
        <CardDescription className="font-sans">Acompanhe os processos ativos</CardDescription>
      </CardHeader>
      <CardContent className="flex-1 p-0">
        <Table>
          <TableHeader>
            <TableRow className="hover:bg-transparent">
              <TableHead className="font-sans px-6">Pet / Interessado</TableHead>
              <TableHead className="font-sans">Início</TableHead>
              <TableHead className="font-sans px-6 text-right">Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.slice(0, 5).map((item) => {
              const photo = getPrimaryPhoto(item)
              const adopterName = item.adopter?.full_name ?? item.adopter?.email ?? "—"
              return (
                <TableRow key={item.id} className="hover:bg-slate-50/50">
                  <TableCell className="px-6 py-3">
                    <div className="flex items-center gap-3">
                      {photo ? (
                        <img
                          src={photo}
                          alt={`Foto de ${item.pet?.name}`}
                          className="h-8 w-8 rounded-lg object-cover border border-border shrink-0"
                          loading="lazy"
                        />
                      ) : (
                        <div
                          className="h-8 w-8 rounded-lg bg-muted border border-border flex items-center justify-center shrink-0"
                          aria-label="Sem foto"
                        >
                          <PawPrint className="h-3 w-3 text-muted-foreground" />
                        </div>
                      )}
                      <div>
                        <div className="font-medium font-sans text-sm">{item.pet?.name ?? "—"}</div>
                        <div className="text-xs text-muted-foreground font-sans">{adopterName}</div>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="py-3 text-sm text-muted-foreground font-sans">
                    {formatDate(item.created_at)}
                  </TableCell>
                  <TableCell className="px-6 py-3 text-right">
                    <Badge
                      variant="secondary"
                      className={`rounded-lg font-normal text-xs border-transparent ${STATUS_BADGE[item.status as AdoptionStatus] ?? ""}`}
                    >
                      {ADOPTION_STATUS_LABEL[item.status as AdoptionStatus] ?? item.status}
                    </Badge>
                  </TableCell>
                </TableRow>
              )
            })}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  )
}
