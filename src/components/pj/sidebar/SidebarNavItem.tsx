import { NavLink } from "react-router-dom"
import type { LucideIcon } from "lucide-react"
import { cn } from "@/lib/utils"

interface SidebarNavItemProps {
  to: string
  icon: LucideIcon
  label: string
  end?: boolean
}

/**
 * Item de navegação reutilizável da sidebar PJ.
 * Aplica estilo ativo, hover e focus baseados na cor primária #3B0270.
 * O ícone herda a cor do texto via currentColor.
 */
export function SidebarNavItem({ to, icon: Icon, label, end }: SidebarNavItemProps) {
  return (
    <NavLink
      to={to}
      end={end}
      aria-label={label}
      className={({ isActive }) =>
        cn(
          "flex items-center gap-3 rounded-lg px-3 h-10 min-h-10 w-full text-sm font-semibold transition-colors duration-150",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#3B0270]/50 focus-visible:ring-offset-1",
          isActive
            ? "bg-[#3B0270]/10 text-[#3B0270]"
            : "text-muted-foreground hover:bg-[#3B0270]/6 hover:text-[#3B0270]"
        )
      }
    >
      <Icon className="h-4 w-4 shrink-0" aria-hidden="true" />
      <span>{label}</span>
    </NavLink>
  )
}

