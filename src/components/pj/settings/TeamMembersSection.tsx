import { useState } from "react"
import { Users, UserPlus, MoreVertical, ShieldAlert } from "lucide-react"

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

import { InviteMemberDialog } from "./InviteMemberDialog"

export interface TeamMember {
  id: string
  name: string
  email: string
  role: "admin" | "member"
  status: "active" | "invited"
  avatar?: string
}

interface TeamMembersSectionProps {
  isLoading?: boolean
  members?: TeamMember[]
}

/**
 * TeamMembersSection
 * Seção que lista os membros da equipe e permite convidar novos (Dialog encadeado).
 */
export function TeamMembersSection({ isLoading, members = [] }: TeamMembersSectionProps) {
  const [isInviteOpen, setIsInviteOpen] = useState(false)

  return (
    <Card className="rounded-2xl border-border shadow-sm flex flex-col h-full">
      <CardHeader className="pb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <CardTitle className="text-base font-semibold font-sans flex items-center gap-2">
            <Users className="w-5 h-5 text-[#3B0270]" />
            Equipe da Organização
          </CardTitle>
          <CardDescription className="font-sans mt-1">
            Gerencie quem tem acesso aos dados da ONG
          </CardDescription>
        </div>
        <Button 
          onClick={() => setIsInviteOpen(true)} 
          className="h-9 rounded-lg bg-slate-100 hover:bg-slate-200 text-foreground w-fit shrink-0 font-sans"
          variant="secondary"
        >
          <UserPlus className="w-4 h-4 mr-2" />
          Convidar Membro
        </Button>
      </CardHeader>

      <CardContent className="flex-1 p-0">
        <div className="divide-y divide-border">
          {isLoading ? (
             Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="flex items-center justify-between p-6">
                  <div className="flex items-center gap-4">
                    <Skeleton className="w-10 h-10 rounded-full" />
                    <div className="space-y-2">
                      <Skeleton className="h-4 w-32" />
                      <Skeleton className="h-3 w-48" />
                    </div>
                  </div>
                </div>
            ))
          ) : members.length === 0 ? (
            <div className="p-8 text-center flex flex-col items-center justify-center text-muted-foreground font-sans">
              <Users className="w-8 h-8 opacity-20 mb-3" />
              <p className="font-medium text-sm text-foreground">Nenhum membro encontrado.</p>
              <p className="text-xs mt-1 max-w-[250px]">
                Convide membros para a equipe para que possam ajudar na gestão das adoções.
              </p>
            </div>
          ) : (
            members.map((member) => (
              <div key={member.id} className="flex items-center justify-between p-4 sm:p-6 hover:bg-slate-50/50 transition-colors">
                <div className="flex items-center gap-3 sm:gap-4 overflow-hidden">
                  <Avatar className="w-10 h-10 border border-border shrink-0">
                    <AvatarImage src={member.avatar} alt={member.name} />
                    <AvatarFallback className="bg-slate-100 text-slate-600 font-sans font-medium text-sm">
                      {member.name ? member.name.charAt(0).toUpperCase() : member.email.charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  
                  <div className="overflow-hidden">
                    <div className="flex items-center gap-2">
                      <p className="font-sans font-medium text-sm text-foreground truncate">
                        {member.name || member.email}
                      </p>
                      {member.role === "admin" && (
                         <div className="bg-[#3B0270]/10 text-[#3B0270] rounded-[4px] px-1.5 py-0.5 mt-0.5">
                           <ShieldAlert className="w-3 h-3" />
                         </div>
                      )}
                    </div>
                    <p className="font-sans text-xs text-muted-foreground truncate max-w-[200px] sm:max-w-[300px]">
                      {member.name ? member.email : "Pendente Cadastro"}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3 shrink-0">
                  <div className="hidden sm:block">
                     {member.status === "invited" ? (
                       <Badge variant="outline" className="font-sans rounded-md text-amber-600 border-amber-200 bg-amber-50">
                         Convite Pendente
                       </Badge>
                     ) : (
                       <Badge variant="secondary" className="font-sans rounded-md bg-emerald-100 text-emerald-800 hover:bg-emerald-100">
                         Ativo
                       </Badge>
                     )}
                  </div>
                  
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" className="h-8 w-8 p-0 rounded-lg">
                        <span className="sr-only">Abrir menu</span>
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-[180px] rounded-xl font-sans">
                      <DropdownMenuLabel className="font-normal text-xs text-muted-foreground">
                        Ações
                      </DropdownMenuLabel>
                      <DropdownMenuSeparator />
                      
                      {member.status === "invited" && (
                         <DropdownMenuItem className="focus:bg-slate-50 cursor-pointer">
                           Reenviar Convite
                         </DropdownMenuItem>
                      )}
                      
                      <DropdownMenuItem className="focus:bg-slate-50 cursor-pointer">
                         Editar Papel
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem className="focus:bg-destructive/10 focus:text-destructive text-destructive cursor-pointer">
                        Remover Membro
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>
            ))
          )}
        </div>
      </CardContent>

      <InviteMemberDialog 
         open={isInviteOpen} 
         onOpenChange={setIsInviteOpen} 
      />
    </Card>
  )
}
