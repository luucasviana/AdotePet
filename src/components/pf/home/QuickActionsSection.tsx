import { useNavigate } from "react-router-dom"
import { PawPrint, Heart } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"

interface QuickAction {
  icon: React.ElementType
  title: string
  description: string
  href: string
  ariaLabel: string
}

const ACTIONS: QuickAction[] = [
  {
    icon: PawPrint,
    title: "Cadastrar um pet",
    description: "Coloque um pet disponível para adoção e encontre um lar para ele.",
    href: "/home/pets/novo",
    ariaLabel: "Ir para cadastro de pet",
  },
  {
    icon: Heart,
    title: "Quero adotar",
    description: "Encontre seu novo melhor amigo entre os pets disponíveis perto de você.",
    href: "/home/quero-adotar",
    ariaLabel: "Ir para busca de pets para adoção",
  },
]

/**
 * Seção de ações rápidas da Home PF.
 * 2 cards grandes clicáveis: Cadastrar pet e Quero adotar.
 * Mobile: empilhados (flex-col). Desktop: lado a lado (grid-cols-2).
 */
export function QuickActionsSection() {
  const navigate = useNavigate()

  return (
    <section aria-label="Ações rápidas">
      <h2 className="mb-4 text-base font-bold font-sans text-foreground">
        O que você quer fazer?
      </h2>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        {ACTIONS.map((action) => {
          const Icon = action.icon
          return (
            <Card
              key={action.href}
              role="button"
              tabIndex={0}
              aria-label={action.ariaLabel}
              className="group cursor-pointer rounded-2xl border border-border bg-white shadow-sm transition-all hover:shadow-md hover:border-primary/30 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
              onClick={() => navigate(action.href)}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault()
                  navigate(action.href)
                }
              }}
            >
              <CardContent className="flex items-start gap-4 p-6">
                {/* Icon */}
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-primary/10 transition-colors group-hover:bg-primary/15">
                  <Icon className="h-6 w-6 text-primary" aria-hidden="true" />
                </div>

                {/* Text */}
                <div className="flex flex-col gap-1 min-w-0">
                  <p className="text-sm font-bold font-sans text-foreground leading-tight">
                    {action.title}
                  </p>
                  <p className="text-xs font-sans text-muted-foreground leading-relaxed">
                    {action.description}
                  </p>
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>
    </section>
  )
}
