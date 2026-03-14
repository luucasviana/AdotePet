import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"

export interface AdoptionProcess {
  id: string
  petName: string
  adopterName: string
  startDate: string
  status: "Entrevista" | "Análise de Documentos" | "Visita Agendada" | "Pendente"
}

interface HomeAdoptionsProps {
  isLoading?: boolean
  data?: AdoptionProcess[]
}

const statusColors: Record<string, string> = {
  "Entrevista": "bg-blue-100 text-blue-700 hover:bg-blue-200",
  "Análise de Documentos": "bg-purple-100 text-purple-700 hover:bg-purple-200",
  "Visita Agendada": "bg-amber-100 text-amber-700 hover:bg-amber-200",
  "Pendente": "bg-slate-100 text-slate-700 hover:bg-slate-200",
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
              <div key={i} className="flex justify-between items-center">
                <div className="space-y-2">
                  <Skeleton className="h-4 w-32" />
                  <Skeleton className="h-3 w-20" />
                </div>
                <Skeleton className="h-6 w-24 rounded-full" />
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
            {data.slice(0, 5).map((item) => (
              <TableRow key={item.id} className="hover:bg-slate-50/50">
                <TableCell className="px-6 py-3">
                  <div className="font-medium font-sans text-sm">{item.petName}</div>
                  <div className="text-xs text-muted-foreground font-sans">{item.adopterName}</div>
                </TableCell>
                <TableCell className="py-3 text-sm text-muted-foreground font-sans">
                  {item.startDate}
                </TableCell>
                <TableCell className="px-6 py-3 text-right">
                  <Badge 
                    variant="secondary" 
                    className={`rounded-lg font-normal text-xs border-transparent ${statusColors[item.status] || statusColors["Pendente"]}`}
                  >
                    {item.status}
                  </Badge>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  )
}
