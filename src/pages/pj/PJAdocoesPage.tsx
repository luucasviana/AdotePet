import { useEffect, useState } from "react"
import { AuthPageHeader } from "@/components/layout/AuthPageHeader"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { ScrollArea } from "@/components/ui/scroll-area"
import { toast } from "sonner"
import { MoreHorizontal, PawPrint, AlertCircle, CalendarCheck, UserCheck, XCircle, CheckCircle2 } from "lucide-react"
import {
  fetchAdoptionsForOwner,
  updateAdoptionStatus,
  ADOPTION_STATUS_LABEL,
  ADOPTION_STATUS_TRANSITIONS,
  type AdoptionWithDetails,
  type AdoptionStatus,
} from "@/lib/actions/adoptions"

// ─── Status badge colors ────────────────────────────────────────────────────

const STATUS_BADGE: Record<AdoptionStatus, string> = {
  interview:       "bg-blue-50 text-blue-700 border-blue-200",
  visit_scheduled: "bg-amber-50 text-amber-700 border-amber-200",
  adopted:         "bg-emerald-50 text-emerald-700 border-emerald-200",
  cancelled:       "bg-slate-100 text-slate-500 border-slate-200",
}

// ─── Helpers ────────────────────────────────────────────────────────────────

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("pt-BR", {
    day: "2-digit", month: "2-digit", year: "numeric",
  })
}

function getPrimaryPhoto(adoption: AdoptionWithDetails) {
  const photos = adoption.pet?.photos ?? []
  const primary = photos.find((p) => p.is_primary)
  return primary?.file_url ?? photos[0]?.file_url ?? null
}

// ─── Skeleton ───────────────────────────────────────────────────────────────

function AdoptionsSkeleton() {
  return (
    <div className="flex flex-col gap-4 p-6 md:p-8">
      {Array.from({ length: 4 }).map((_, i) => (
        <div key={i} className="flex items-center gap-4 rounded-2xl border border-border bg-white p-4">
          <Skeleton className="h-12 w-12 rounded-lg shrink-0" />
          <div className="flex-1 flex flex-col gap-2">
            <Skeleton className="h-4 w-40" />
            <Skeleton className="h-3 w-24" />
          </div>
          <Skeleton className="h-6 w-28 rounded-lg" />
          <Skeleton className="h-8 w-8 rounded-lg" />
        </div>
      ))}
    </div>
  )
}

// ─── Empty state ─────────────────────────────────────────────────────────────

function AdoptionsEmpty({ filtered }: { filtered?: boolean }) {
  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-4 py-24 text-center px-8">
      <div className="rounded-full bg-muted p-5">
        <PawPrint className="h-10 w-10 text-muted-foreground" />
      </div>
      <div className="flex flex-col gap-1">
        <p className="font-semibold font-sans text-foreground">
          {filtered ? "Nenhuma adoção nesta categoria" : "Sem adoções ainda"}
        </p>
        <p className="text-sm text-muted-foreground font-sans max-w-xs">
          {filtered
            ? "Tente verificar a outra aba para ver os processos finalizados."
            : "Quando um interessado clicar em \"Quero adotar\" num dos seus pets, o processo aparecerá aqui."}
        </p>
      </div>
    </div>
  )
}

// ─── Error state ─────────────────────────────────────────────────────────────

function AdoptionsError({ onRetry }: { onRetry: () => void }) {
  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-4 py-24 text-center px-8">
      <div className="rounded-full bg-destructive/10 p-5">
        <AlertCircle className="h-10 w-10 text-destructive" />
      </div>
      <div className="flex flex-col gap-1">
        <p className="font-semibold font-sans text-foreground">Erro ao carregar adoções</p>
        <p className="text-sm text-muted-foreground font-sans max-w-xs">
          Não foi possível carregar os processos de adoção. Verifique sua conexão e tente novamente.
        </p>
      </div>
      <Button variant="outline" onClick={onRetry} className="h-10 rounded-lg font-sans mt-2">
        Tentar novamente
      </Button>
    </div>
  )
}

// ─── Status transition icon ───────────────────────────────────────────────────

const STATUS_ICON: Record<AdoptionStatus, React.ElementType> = {
  interview:       UserCheck,
  visit_scheduled: CalendarCheck,
  adopted:         CheckCircle2,
  cancelled:       XCircle,
}

// ─── Adoption row ─────────────────────────────────────────────────────────────

function AdoptionRow({
  adoption,
  onAction,
}: {
  adoption: AdoptionWithDetails
  onAction: (adoption: AdoptionWithDetails, status: AdoptionStatus) => void
}) {
  const photo = getPrimaryPhoto(adoption)
  const adopterName = adoption.adopter?.full_name ?? adoption.adopter?.email ?? "—"
  const transitions = ADOPTION_STATUS_TRANSITIONS[adoption.status as AdoptionStatus]

  return (
    <TableRow className="hover:bg-slate-50/50">
      {/* Pet */}
      <TableCell className="px-6 py-3">
        <div className="flex items-center gap-3">
          {photo ? (
            <img
              src={photo}
              alt={`Foto de ${adoption.pet?.name}`}
              className="h-10 w-10 rounded-lg object-cover border border-border shrink-0"
              loading="lazy"
            />
          ) : (
            <div
              className="h-10 w-10 rounded-lg bg-muted border border-border flex items-center justify-center shrink-0"
              aria-label="Sem foto"
            >
              <PawPrint className="h-4 w-4 text-muted-foreground" />
            </div>
          )}
          <span className="font-medium font-sans text-sm">{adoption.pet?.name ?? "—"}</span>
        </div>
      </TableCell>

      {/* Adotante */}
      <TableCell className="px-6 py-3 text-sm font-sans text-muted-foreground">
        {adopterName}
      </TableCell>

      {/* Data */}
      <TableCell className="px-6 py-3 text-sm font-sans text-muted-foreground">
        {formatDate(adoption.created_at)}
      </TableCell>

      {/* Status */}
      <TableCell className="px-6 py-3">
        <Badge
          variant="outline"
          className={`rounded-lg text-xs font-medium font-sans ${STATUS_BADGE[adoption.status as AdoptionStatus] ?? ""}`}
        >
          {ADOPTION_STATUS_LABEL[adoption.status as AdoptionStatus] ?? adoption.status}
        </Badge>
      </TableCell>

      {/* Ações */}
      <TableCell className="px-6 py-3 text-right">
        {transitions.length > 0 ? (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                className="h-8 w-8 p-0 rounded-lg"
                aria-label="Ações de adoção"
              >
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="rounded-2xl font-sans">
              {transitions
                .filter((s) => s !== "cancelled")
                .map((nextStatus) => {
                  const Icon = STATUS_ICON[nextStatus]
                  return (
                    <DropdownMenuItem
                      key={nextStatus}
                      onClick={() => onAction(adoption, nextStatus)}
                      className="gap-2"
                    >
                      <Icon className="h-4 w-4" />
                      Mover para: {ADOPTION_STATUS_LABEL[nextStatus]}
                    </DropdownMenuItem>
                  )
                })}
              {transitions.includes("cancelled") && (
                <>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    onClick={() => onAction(adoption, "cancelled")}
                    className="gap-2 text-destructive focus:text-destructive"
                  >
                    <XCircle className="h-4 w-4" />
                    Cancelar adoção
                  </DropdownMenuItem>
                </>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        ) : (
          <span className="text-xs text-muted-foreground font-sans">—</span>
        )}
      </TableCell>
    </TableRow>
  )
}

// ─── Adoptions list ───────────────────────────────────────────────────────────

function AdoptionsList({
  adoptions,
  onAction,
}: {
  adoptions: AdoptionWithDetails[]
  onAction: (adoption: AdoptionWithDetails, status: AdoptionStatus) => void
}) {
  if (adoptions.length === 0) return <AdoptionsEmpty filtered />

  return (
    <div className="overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow className="hover:bg-transparent">
            <TableHead className="px-6 font-sans">Pet</TableHead>
            <TableHead className="px-6 font-sans">Interessado</TableHead>
            <TableHead className="px-6 font-sans">Data</TableHead>
            <TableHead className="px-6 font-sans">Status</TableHead>
            <TableHead className="px-6 font-sans text-right">Ações</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {adoptions.map((a) => (
            <AdoptionRow key={a.id} adoption={a} onAction={onAction} />
          ))}
        </TableBody>
      </Table>
    </div>
  )
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export function PJAdocoesPage() {
  const [adoptions, setAdoptions] = useState<AdoptionWithDetails[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)

  // Status update dialog
  const [pendingAction, setPendingAction] = useState<{
    adoption: AdoptionWithDetails
    status: AdoptionStatus
  } | null>(null)
  const [cancelReason, setCancelReason] = useState("")
  const [isUpdating, setIsUpdating] = useState(false)

  const load = async () => {
    setLoading(true)
    setError(false)
    const { data, error: fetchError } = await fetchAdoptionsForOwner()
    if (fetchError) {
      setError(true)
    } else {
      setAdoptions(data)
    }
    setLoading(false)
  }

  useEffect(() => { load() }, [])

  const handleAction = (adoption: AdoptionWithDetails, status: AdoptionStatus) => {
    setCancelReason("")
    setPendingAction({ adoption, status })
  }

  const handleConfirm = async () => {
    if (!pendingAction) return
    setIsUpdating(true)
    const { success, error: updateError } = await updateAdoptionStatus(
      pendingAction.adoption.id,
      pendingAction.status,
      pendingAction.status === "cancelled" ? cancelReason : undefined
    )
    if (!success) {
      toast.error(updateError ?? "Erro ao atualizar status.")
    } else {
      toast.success(`Status atualizado para "${ADOPTION_STATUS_LABEL[pendingAction.status]}"!`)
      setPendingAction(null)
      load()
    }
    setIsUpdating(false)
  }

  const activeAdoptions = adoptions.filter((a) =>
    ["interview", "visit_scheduled"].includes(a.status)
  )
  const finishedAdoptions = adoptions.filter((a) =>
    ["adopted", "cancelled"].includes(a.status)
  )

  return (
    <div className="flex flex-1 flex-col h-full bg-slate-50/50">
      <AuthPageHeader
        title="Adoções"
        subtitle="Acompanhe e gerencie os processos de adoção"
      />

      {loading ? (
        <AdoptionsSkeleton />
      ) : error ? (
        <AdoptionsError onRetry={load} />
      ) : adoptions.length === 0 ? (
        <AdoptionsEmpty />
      ) : (
        <ScrollArea className="flex-1">
          <div className="p-6 md:p-8 max-w-[1400px] mx-auto">
            <Tabs defaultValue="active" className="w-full">
              <TabsList className="h-10 rounded-lg mb-6 bg-muted">
                <TabsTrigger value="active" className="rounded-lg font-sans text-sm h-8 px-4">
                  Em andamento
                  {activeAdoptions.length > 0 && (
                    <span className="ml-2 flex items-center justify-center rounded-full bg-primary/10 text-primary text-xs font-semibold w-5 h-5">
                      {activeAdoptions.length}
                    </span>
                  )}
                </TabsTrigger>
                <TabsTrigger value="finished" className="rounded-lg font-sans text-sm h-8 px-4">
                  Finalizadas
                  {finishedAdoptions.length > 0 && (
                    <span className="ml-2 flex items-center justify-center rounded-full bg-muted-foreground/10 text-muted-foreground text-xs font-semibold w-5 h-5">
                      {finishedAdoptions.length}
                    </span>
                  )}
                </TabsTrigger>
              </TabsList>

              <TabsContent value="active" className="rounded-2xl border border-border bg-white overflow-hidden shadow-sm">
                <AdoptionsList adoptions={activeAdoptions} onAction={handleAction} />
              </TabsContent>

              <TabsContent value="finished" className="rounded-2xl border border-border bg-white overflow-hidden shadow-sm">
                <AdoptionsList adoptions={finishedAdoptions} onAction={handleAction} />
              </TabsContent>
            </Tabs>
          </div>
        </ScrollArea>
      )}

      {/* ── Dialog de confirmação de status ── */}
      <Dialog open={!!pendingAction} onOpenChange={(o) => { if (!o) setPendingAction(null) }}>
        <DialogContent className="sm:max-w-md rounded-2xl w-[90%] font-sans">
          <DialogHeader>
            <DialogTitle>Confirmar alteração de status</DialogTitle>
            <DialogDescription>
              {pendingAction && (
                <>
                  Mover adoção de <strong>{pendingAction.adoption.pet?.name}</strong> para{" "}
                  <strong>{ADOPTION_STATUS_LABEL[pendingAction.status]}</strong>.
                </>
              )}
            </DialogDescription>
          </DialogHeader>

          {pendingAction?.status === "cancelled" && (
            <div className="flex flex-col gap-2 py-2">
              <Label htmlFor="cancel-reason" className="font-sans text-sm text-muted-foreground">
                Motivo do cancelamento (opcional)
              </Label>
              <Input
                id="cancel-reason"
                placeholder="Ex.: Pet já adotado, desistência do interessado..."
                value={cancelReason}
                onChange={(e) => setCancelReason(e.target.value)}
                className="h-10 rounded-lg font-sans"
              />
            </div>
          )}

          <DialogFooter className="flex-col sm:flex-row gap-2 mt-2">
            <Button
              variant="outline"
              onClick={() => setPendingAction(null)}
              disabled={isUpdating}
              className="h-10 rounded-lg w-full sm:w-auto"
            >
              Cancelar
            </Button>
            <Button
              onClick={handleConfirm}
              disabled={isUpdating}
              className={`h-10 rounded-lg w-full sm:w-auto ${
                pendingAction?.status === "cancelled"
                  ? "bg-destructive text-destructive-foreground hover:bg-destructive/90"
                  : "bg-primary text-primary-foreground hover:bg-[#2d0254]"
              }`}
            >
              {isUpdating ? "Atualizando..." : "Confirmar"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
