import { Link, useMatch, useResolvedPath } from "react-router-dom"
import type { LucideIcon } from "lucide-react"
import { cn } from "@/lib/utils"
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip"

interface SidebarNavItemProps {
  to: string
  icon: LucideIcon
  label: string
  end?: boolean
  isCollapsed?: boolean
}

/**
 * Item de navegação reutilizável da sidebar.
 * No modo expandido: largura total.
 * No modo recolhido: 1:1 perfeitamente quadrado e centralizado.
 */
export function SidebarNavItem({ to, icon: Icon, label, end, isCollapsed }: SidebarNavItemProps) {
  const resolved = useResolvedPath(to)
  const match = useMatch({ path: resolved.pathname, end: end ?? false })
  const isActive = !!match

  const content = (
    <Link
      to={to}
      aria-label={label}
      className={cn(
        "flex items-center rounded-lg transition-colors duration-150 overflow-hidden",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#3B0270]/50 focus-visible:ring-offset-1",
        isCollapsed ? "justify-center w-10 h-10 p-0" : "gap-3 px-3 h-10 min-h-10 w-full",
        isActive
          ? "bg-[#3B0270]/10 text-[#3B0270]"
          : "text-muted-foreground hover:bg-[#3B0270]/6 hover:text-[#3B0270]"
      )}
    >
      <Icon className="h-4 w-4 shrink-0" aria-hidden="true" />
      {!isCollapsed && <span className="whitespace-nowrap flex-1 truncate text-sm font-semibold">{label}</span>}
    </Link>
  )

  if (isCollapsed) {
    return (
      <Tooltip delayDuration={0}>
        <TooltipTrigger asChild>{content}</TooltipTrigger>
        <TooltipContent side="right" className="font-semibold" sideOffset={16}>{label}</TooltipContent>
      </Tooltip>
    )
  }

  return content
}

