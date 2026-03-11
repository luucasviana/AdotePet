import { Button } from "@/components/ui/button"
import { Plus } from "lucide-react"

interface SidebarNavButtonProps {
  onClick?: () => void
}

/**
 * Botão de ação principal da sidebar PJ.
 * Exibe "+ Cadastrar pet" com maior destaque que os itens de navegação.
 */
export function SidebarNavButton({ onClick }: SidebarNavButtonProps) {
  return (
    <Button
      onClick={onClick}
      className="w-full h-10 rounded-lg gap-2 bg-[#3B0270] text-white font-bold hover:bg-[#3B0270]/90 focus-visible:ring-2 focus-visible:ring-[#3B0270]/50 focus-visible:ring-offset-1 shadow-sm transition-all duration-150"
      aria-label="Cadastrar novo pet"
    >
      <Plus className="h-4 w-4 shrink-0" aria-hidden="true" />
      Cadastrar pet
    </Button>
  )
}
