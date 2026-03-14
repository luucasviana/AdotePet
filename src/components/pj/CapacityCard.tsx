import { useState } from "react"
import { Users, Info, Edit2 } from "lucide-react"

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { toast } from "sonner"

interface CapacityData {
  totalCapacity: number
  occupiedSlots: number
}

interface CapacityCardProps {
  isLoading?: boolean
  data?: CapacityData
  editable?: boolean
  onCapacityUpdate?: (newCapacity: number) => Promise<void>
}

/**
 * CapacityCard
 * Exibe a capacidade do abrigo/ONG e a ocupação atual.
 * 
 * Props:
 * - isLoading: exibe skeleton
 * - data: { totalCapacity, occupiedSlots }
 * - editable: se true, exibe botão de editar
 * - onCapacityUpdate: callback disparado ao mudar a capacidade
 */
export function CapacityCard({
  isLoading,
  data,
  editable = false,
  onCapacityUpdate,
}: CapacityCardProps) {
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [newCapacity, setNewCapacity] = useState<number>(data?.totalCapacity || 0)
  const [isSaving, setIsSaving] = useState(false)

  if (isLoading) {
    return (
      <Card className="rounded-2xl border-border shadow-sm flex flex-col h-full">
        <CardHeader className="pb-2 flex flex-row items-start justify-between">
          <div className="space-y-2">
            <Skeleton className="h-5 w-40" />
            <Skeleton className="h-4 w-56" />
          </div>
        </CardHeader>
        <CardContent className="flex-1 flex flex-col justify-end pt-4">
          <Skeleton className="h-2 w-full rounded-full mb-4" />
          <div className="flex justify-between items-center">
            <Skeleton className="h-8 w-16" />
            <Skeleton className="h-8 w-16" />
          </div>
        </CardContent>
      </Card>
    )
  }

  // Prevenção de fallback
  const capacity = data?.totalCapacity || 0
  const occupied = data?.occupiedSlots || 0
  const available = Math.max(0, capacity - occupied)

  const percent = capacity > 0 ? Math.min(100, (occupied / capacity) * 100) : 0
  
  // Status determination
  let statusBadge = null
  let progressColor = "bg-[#3B0270]" // Brand Color

  if (percent >= 100) {
    statusBadge = <Badge variant="destructive" className="font-sans rounded-md">Lotação Máxima</Badge>
    progressColor = "bg-destructive"
  } else if (percent >= 80) {
    statusBadge = <Badge variant="secondary" className="bg-amber-100 text-amber-800 hover:bg-amber-100 font-sans rounded-md">Atenção: Limite Próximo</Badge>
    progressColor = "bg-amber-500"
  } else if (capacity > 0) {
    statusBadge = <Badge variant="secondary" className="bg-emerald-100 text-emerald-800 hover:bg-emerald-100 font-sans rounded-md">Vagas Disponíveis</Badge>
    progressColor = "bg-emerald-500"
  } else {
    statusBadge = <Badge variant="outline" className="font-sans rounded-md text-muted-foreground">Capacidade não definida</Badge>
    progressColor = "bg-muted"
  }

  const handleSave = async () => {
    if (!onCapacityUpdate) return
    if (newCapacity < occupied) {
      toast.error("A capacidade total não pode ser menor que a ocupação atual.")
      return
    }

    try {
      setIsSaving(true)
      await onCapacityUpdate(newCapacity)
      toast.success("Capacidade atualizada com sucesso.")
      setIsEditModalOpen(false)
    } catch {
      toast.error("Erro ao atualizar capacidade.")
    } finally {
      setIsSaving(false)
    }
  }

  const handleOpenEdit = () => {
    setNewCapacity(capacity)
    setIsEditModalOpen(true)
  }

  return (
    <>
      <Card className="rounded-2xl border-border shadow-sm flex flex-col h-full">
        <CardHeader className="pb-2 flex flex-row items-start justify-between">
          <div>
            <CardTitle className="text-base font-semibold font-sans flex items-center gap-2">
              <Users className="w-5 h-5 text-[#3B0270]" />
              Capacidade do Abrigo
            </CardTitle>
            <CardDescription className="font-sans mt-1">
              Acompanhe a disponibilidade de vagas na sua organização
            </CardDescription>
          </div>
          {editable && (
            <Button variant="ghost" size="icon" onClick={handleOpenEdit} className="h-8 w-8 text-muted-foreground rounded-lg">
              <Edit2 className="h-4 w-4" />
              <span className="sr-only">Editar capacidade</span>
            </Button>
          )}
        </CardHeader>
        <CardContent className="flex-1 flex flex-col justify-end pt-4">
          <div className="mb-4 flex flex-col gap-2">
            <div className="flex justify-between items-center text-sm font-sans mb-1">
              <span className="text-muted-foreground font-medium">Ocupação: {percent.toFixed(0)}%</span>
              {statusBadge}
            </div>
            
            {/* Progress Bar Container */}
            <div className="h-2 w-full bg-secondary rounded-full overflow-hidden">
              <div 
                className={`h-full transition-all duration-500 ${progressColor}`} 
                style={{ width: `${percent}%` }}
              />
            </div>
            
            <div className="flex justify-between items-center text-xs text-muted-foreground font-sans mt-2">
              <div className="flex flex-col">
                <span className="font-semibold text-foreground text-xl">{occupied}</span>
                <span>Ocupadas</span>
              </div>
              <div className="flex flex-col text-right">
                <span className="font-semibold text-foreground text-xl">{available}</span>
                <span>Disponíveis</span>
              </div>
            </div>
          </div>
          
          <div className="bg-slate-50 p-3 rounded-xl border border-border flex items-start gap-3 mt-2">
            <Info className="w-4 h-4 text-muted-foreground flex-shrink-0 mt-0.5" />
            <p className="text-xs text-muted-foreground font-sans leading-relaxed">
              A capacidade total atual é de <strong>{capacity} pets</strong>. 
              {editable ? " Você pode ajustar este número clicando em editar." : " Apenas administradores podem alterar esse limite."}
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Modal de Edição */}
      <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
        <DialogContent className="sm:max-w-[425px] rounded-2xl">
          <DialogHeader>
            <DialogTitle className="font-sans">Editar Capacidade</DialogTitle>
            <DialogDescription className="font-sans">
              Ajuste o número máximo de animais que sua organização suporta.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="flex flex-col gap-2">
              <Label htmlFor="capacity" className="text-sm font-medium font-sans">
                Capacidade Total
              </Label>
              <Input
                id="capacity"
                type="number"
                min={occupied}
                value={newCapacity}
                onChange={(e) => setNewCapacity(parseInt(e.target.value) || 0)}
                className="col-span-3 rounded-lg font-sans"
              />
              <p className="text-xs text-muted-foreground font-sans flex items-center gap-1">
                <Info className="w-3 h-3" />
                Não pode ser menor que a ocupação atual ({occupied}).
              </p>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditModalOpen(false)} className="rounded-lg font-sans h-10">
              Cancelar
            </Button>
            <Button 
              onClick={handleSave} 
              disabled={isSaving || newCapacity < occupied}
              className="rounded-lg bg-[#3B0270] hover:bg-[#2d0254] text-white font-sans h-10"
            >
              {isSaving ? "Salvando..." : "Salvar alterações"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
