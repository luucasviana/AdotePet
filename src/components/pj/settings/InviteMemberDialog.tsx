import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { Mail, Shield } from "lucide-react"
import { toast } from "sonner"

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

const inviteSchema = z.object({
  email: z.string().email("Por favor, insira um e-mail válido"),
  role: z.string().min(1, "Selecione o papel do membro"),
})

type InviteFormValues = z.infer<typeof inviteSchema>

interface InviteMemberDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onInvite?: (data: InviteFormValues) => Promise<void>
}

/**
 * Dialog/Modal para enviar convites a novos membros.
 */
export function InviteMemberDialog({ open, onOpenChange, onInvite }: InviteMemberDialogProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)

  const {
    register,
    handleSubmit,
    setValue,
    reset,
    formState: { errors },
  } = useForm<InviteFormValues>({
    resolver: zodResolver(inviteSchema),
    defaultValues: {
      email: "",
      role: "member",
    },
  })

  // Handle dialog open/close properly reset the form
  const handleOpenChange = (isOpen: boolean) => {
    if (!isOpen) {
      reset()
    }
    onOpenChange(isOpen)
  }

  const onSubmit = async (data: InviteFormValues) => {
    if (!open) return
    setIsSubmitting(true)
    try {
      if (onInvite) {
        await onInvite(data)
      } else {
        // Fallback for V1 (mock behavior)
        await new Promise(resolve => setTimeout(resolve, 800))
        console.log("Mock enviou convite", data)
      }
      toast.success("Convite enviado com sucesso para " + data.email)
      handleOpenChange(false)
    } catch (e) {
      toast.error("Erro ao enviar o convite. Tente novamente.")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-[425px] rounded-2xl">
        <DialogHeader>
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center">
              <Mail className="w-5 h-5 text-foreground" />
            </div>
            <div>
              <DialogTitle className="font-sans">Convidar Membro</DialogTitle>
              <DialogDescription className="font-sans mt-0.5">
                Envie um convite para acesso à organização.
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <form id="invite-member-form" onSubmit={handleSubmit(onSubmit)} className="space-y-4 py-2">
          <div className="space-y-2">
            <Label htmlFor="email" className="font-sans font-medium text-sm">
              E-mail do convidado
            </Label>
            <Input
              id="email"
              type="email"
              autoComplete="off"
              className="h-10 rounded-lg font-sans w-full"
              placeholder="exemplo@gmail.com"
              aria-invalid={!!errors.email}
              aria-describedby={errors.email ? "email-error" : undefined}
              {...register("email")}
            />
            {errors.email && (
              <p id="email-error" className="text-xs text-destructive font-sans" role="alert">
                {errors.email.message}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="role" className="font-sans font-medium text-sm">
              Papel na organização
            </Label>
            <Select defaultValue="member" onValueChange={(val) => setValue("role", val)}>
              <SelectTrigger id="role" className="w-full h-10 rounded-lg font-sans">
                <SelectValue placeholder="Selecione o papel" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="admin">Administrador (Acesso total)</SelectItem>
                <SelectItem value="member">Membro (Operacional)</SelectItem>
              </SelectContent>
            </Select>
            {errors.role && (
              <p className="text-xs text-destructive font-sans" role="alert">
                {errors.role.message}
              </p>
            )}
            <p className="text-xs text-muted-foreground flex items-center gap-1.5 mt-1 font-sans">
              <Shield className="w-3 h-3" />
              Membros podem gerenciar adoções e pets. Administradores podem gerenciar configurações gerais e faturamento.
            </p>
          </div>
        </form>

        <DialogFooter className="mt-2">
          <Button
            type="button"
            variant="outline"
            onClick={() => handleOpenChange(false)}
            className="rounded-lg h-10 font-sans"
            disabled={isSubmitting}
          >
            Cancelar
          </Button>
          <Button
            type="submit"
            form="invite-member-form"
            className="rounded-lg h-10 bg-[#3B0270] hover:bg-[#2d0254] text-white font-sans"
            disabled={isSubmitting}
          >
            {isSubmitting ? "Enviando..." : "Enviar Convite"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
