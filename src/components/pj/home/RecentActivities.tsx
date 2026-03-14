import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { Clock } from "lucide-react"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"

export interface PetActivity {
  id: string
  petName: string
  action: string
  relatedPerson?: string
  date: string
}

interface RecentActivitiesProps {
  isLoading?: boolean
  data?: PetActivity[]
  /** Se context for 'pet', a coluna Pet não é exibida */
  context?: "global" | "pet"
}

export function RecentActivities({ isLoading, data, context = "global" }: RecentActivitiesProps) {
  if (isLoading) {
    return (
      <Card className="rounded-2xl border-border shadow-sm flex flex-col h-full">
        <CardHeader className="pb-4">
          <Skeleton className="h-5 w-48 mb-1" />
          <Skeleton className="h-4 w-64" />
        </CardHeader>
        <CardContent className="flex-1">
          <div className="space-y-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="flex justify-between items-center py-2">
                <div className="flex gap-3">
                  <div className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center">
                    <Clock className="w-4 h-4 text-muted-foreground" />
                  </div>
                  <div className="space-y-2">
                    <Skeleton className="h-4 w-40" />
                    <Skeleton className="h-3 w-24" />
                  </div>
                </div>
                <Skeleton className="h-4 w-16" />
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
          <CardTitle className="text-base font-semibold font-sans">Atividades Recentes</CardTitle>
          <CardDescription className="font-sans">Acontecimentos da operação</CardDescription>
        </CardHeader>
        <CardContent className="flex-1 flex flex-col items-center justify-center py-8">
          <div className="text-center space-y-2">
            <p className="text-sm font-medium text-muted-foreground font-sans">
              Nenhuma atividade registrada hoje.
            </p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="rounded-2xl border-border shadow-sm flex flex-col h-full">
      <CardHeader className="pb-4">
        <CardTitle className="text-base font-semibold font-sans">Atividades Recentes</CardTitle>
        <CardDescription className="font-sans">Acontecimentos da operação</CardDescription>
      </CardHeader>
      <CardContent className="flex-1 p-0">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="hover:bg-transparent">
                {context === "global" && <TableHead className="font-sans px-6">Pet</TableHead>}
                <TableHead className="font-sans px-6">Atividade</TableHead>
                <TableHead className="font-sans px-6">Interessado</TableHead>
                <TableHead className="font-sans px-6 text-right">Data</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.slice(0, 5).map((item) => (
                <TableRow key={item.id} className="hover:bg-slate-50/50">
                  {context === "global" && (
                    <TableCell className="px-6 py-3 font-medium font-sans text-sm">
                      {item.petName}
                    </TableCell>
                  )}
                  <TableCell className="px-6 py-3 text-sm text-foreground font-sans">
                    {item.action}
                  </TableCell>
                  <TableCell className="px-6 py-3 text-sm text-muted-foreground font-sans">
                    {item.relatedPerson || "—"}
                  </TableCell>
                  <TableCell className="px-6 py-3 text-xs text-muted-foreground font-sans text-right">
                    {item.date}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  )
}
