import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { Dog, Heart, CalendarClock, CheckCircle2 } from "lucide-react"

interface HomeIndicatorsProps {
  isLoading?: boolean
  data?: {
    totalPets: number
    available: number
    inProgress: number
    completed: number
  }
}

export function HomeIndicators({ isLoading, data }: HomeIndicatorsProps) {
  if (isLoading || !data) {
    return (
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Card key={i} className="rounded-2xl">
            <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
              <Skeleton className="h-4 w-1/2" />
              <Skeleton className="h-4 w-4 rounded-full" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-8 w-16 mb-1" />
              <Skeleton className="h-3 w-3/4" />
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  const items = [
    {
      title: "Pets cadastrados",
      value: data.totalPets,
      description: "Total na organização",
      icon: Dog,
      color: "text-primary",
    },
    {
      title: "Disponíveis",
      value: data.available,
      description: "Aguardando um lar",
      icon: Heart,
      color: "text-emerald-500",
    },
    {
      title: "Em andamento",
      value: data.inProgress,
      description: "Processos ativos",
      icon: CalendarClock,
      color: "text-amber-500",
    },
    {
      title: "Concluídas",
      value: data.completed,
      description: "Adoções finalizadas",
      icon: CheckCircle2,
      color: "text-blue-500",
    },
  ]

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {items.map((item, index) => (
        <Card key={index} className="rounded-2xl border-border shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium text-muted-foreground font-sans">
              {item.title}
            </CardTitle>
            <item.icon className={`h-4 w-4 ${item.color}`} />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold font-sans">{item.value}</div>
            <p className="text-xs text-muted-foreground font-sans">
              {item.description}
            </p>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
