import {
  Home,
  PawPrint,
  Heart,
  Settings,
  Users,
  Building2,
  BarChart3,
} from "lucide-react"
import type { LucideIcon } from "lucide-react"
import type { UserType } from "@/hooks/useProfile"

export interface NavItem {
  to: string
  icon: LucideIcon
  label: string
  end?: boolean
}

export interface NavSection {
  /** Itens exibidos na área principal de navegação */
  main: NavItem[]
  /** Itens exibidos na área de rodapé (acima de Sair) */
  footer: NavItem[]
}

/**
 * Configuração declarativa dos itens de menu por tipo de usuário.
 * Mantém toda a lógica de navegação fora dos componentes visuais.
 */
export const NAV_CONFIG: Record<UserType, NavSection> = {
  PJ: {
    main: [
      { to: "/home",              icon: Home,    label: "Início",     end: true },
      { to: "/home/pets",         icon: PawPrint, label: "Meus pets" },
      { to: "/home/adocoes",      icon: Heart,   label: "Adoções" },
      { to: "/home/configuracoes", icon: Settings, label: "Configurações" },
    ],
    footer: [],
  },

  PF: {
    main: [
      { to: "/home",              icon: Home,      label: "Início",        end: true },
      { to: "/home/quero-adotar", icon: Heart,     label: "Quero adotar" },
      { to: "/home/parceiros",    icon: Building2, label: "Parceiros" },
    ],
    footer: [],
  },

  ADMIN: {
    main: [
      { to: "/home",              icon: Home,      label: "Início",      end: true },
      { to: "/home/usuarios",     icon: Users,     label: "Usuários" },
      { to: "/home/organizacoes", icon: Building2, label: "Organizações" },
      { to: "/home/relatorios",   icon: BarChart3, label: "Relatórios" },
      { to: "/home/configuracoes", icon: Settings, label: "Configurações" },
    ],
    footer: [],
  },
}
