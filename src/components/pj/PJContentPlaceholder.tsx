import { Construction } from "lucide-react"

interface PJContentPlaceholderProps {
  title?: string
  description?: string
}

/**
 * Placeholder para áreas de conteúdo ainda não implementadas na área PJ.
 * Será substituído progressivamente pelas páginas reais.
 */
export function PJContentPlaceholder({
  title = "Em construção",
  description = "Esta área será implementada em breve.",
}: PJContentPlaceholderProps) {
  return (
    <div className="flex flex-1 h-full items-center justify-center p-8">
      <div className="flex flex-col items-center gap-4 text-center max-w-xs">
        <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-[#3B0270]/8">
          <Construction className="h-8 w-8 text-[#3B0270]/60" aria-hidden="true" />
        </div>
        <div className="flex flex-col gap-2">
          <h2 className="text-base font-bold text-foreground">{title}</h2>
          <p className="text-sm text-muted-foreground leading-relaxed">{description}</p>
        </div>
      </div>
    </div>
  )
}
