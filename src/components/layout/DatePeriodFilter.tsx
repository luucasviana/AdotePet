import { useState } from "react"
import { CalendarDays } from "lucide-react"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

export type DatePeriod =
  | "today"
  | "this_week"
  | "this_month"
  | "this_year"
  | "all_time"

const PERIOD_OPTIONS: { value: DatePeriod; label: string }[] = [
  { value: "today",      label: "Hoje" },
  { value: "this_week",  label: "Esta semana" },
  { value: "this_month", label: "Este mês" },
  { value: "this_year",  label: "Este ano" },
  { value: "all_time",   label: "Todo o período" },
]

interface DatePeriodFilterProps {
  value?: DatePeriod
  defaultValue?: DatePeriod
  onChange?: (period: DatePeriod) => void
}

/**
 * Filtro de período de data reutilizável para o cabeçalho de páginas autenticadas.
 * Baseado em shadcn/ui Select com períodos pré-definidos.
 * A lógica funcional de filtragem pode ser conectada via `onChange`.
 */
export function DatePeriodFilter({
  value,
  defaultValue = "this_month",
  onChange,
}: DatePeriodFilterProps) {
  const [internalValue, setInternalValue] = useState<DatePeriod>(defaultValue)
  const controlled = value !== undefined
  const current = controlled ? value : internalValue

  const handleChange = (v: string) => {
    const period = v as DatePeriod
    if (!controlled) setInternalValue(period)
    onChange?.(period)
  }

  return (
    <Select value={current} onValueChange={handleChange}>
      <SelectTrigger
        className="h-10 w-[172px] rounded-lg border border-border bg-white text-sm font-semibold text-foreground gap-2 focus:ring-2 focus:ring-[#3B0270]/40 focus:ring-offset-1"
        aria-label="Filtrar por período"
      >
        <CalendarDays className="h-4 w-4 shrink-0 text-[#3B0270]" aria-hidden="true" />
        <SelectValue />
      </SelectTrigger>
      <SelectContent className="rounded-lg">
        {PERIOD_OPTIONS.map((opt) => (
          <SelectItem
            key={opt.value}
            value={opt.value}
            className="rounded-lg text-sm font-semibold cursor-pointer"
          >
            {opt.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  )
}
