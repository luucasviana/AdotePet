import { useState, useMemo } from "react"
import { CalendarDays, ChevronDown } from "lucide-react"
import { format } from "date-fns"
import { ptBR } from "date-fns/locale"
import { type DateRange } from "react-day-picker"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"

export type DatePeriod =
  | "today"
  | "this_week"
  | "this_month"
  | "this_year"
  | "all_time"
  | "custom"

const PERIOD_OPTIONS: { value: DatePeriod; label: string }[] = [
  { value: "today",      label: "Hoje" },
  { value: "this_week",  label: "Esta semana" },
  { value: "this_month", label: "Este mês" },
  { value: "this_year",  label: "Este ano" },
  { value: "all_time",   label: "Todo o período" },
  { value: "custom",     label: "Personalizado" },
]

export interface DateFilterValue {
  type: DatePeriod
  range?: DateRange
}

interface DatePeriodFilterProps {
  value?: DateFilterValue
  defaultValue?: DateFilterValue
  onChange?: (value: DateFilterValue) => void
}

/**
 * Filtro de período de data reutilizável para o cabeçalho de páginas autenticadas.
 * Suporta períodos pré-definidos e intervalo personalizado de datas.
 */
export function DatePeriodFilter({
  value,
  defaultValue = { type: "this_month" },
  onChange,
}: DatePeriodFilterProps) {
  const [internalValue, setInternalValue] = useState<DateFilterValue>(defaultValue)
  const [isOpen, setIsOpen] = useState(false)
  
  const controlled = value !== undefined
  const current = controlled ? value : internalValue

  // Handling standard preset clicks
  const handlePresetSelect = (preset: DatePeriod) => {
    const newValue: DateFilterValue = { type: preset }
    if (!controlled) setInternalValue(newValue)
    onChange?.(newValue)
    
    // Close popover if not picking custom dates
    if (preset !== "custom") {
      setIsOpen(false)
    }
  }

  // Handling calendar date range selection
  const handleDateSelect = (range: DateRange | undefined) => {
    const newValue: DateFilterValue = { type: "custom", range }
    if (!controlled) setInternalValue(newValue)
    onChange?.(newValue)
  }

  // Formatting the trigger button text
  const displayText = useMemo(() => {
    if (current.type !== "custom") {
      return PERIOD_OPTIONS.find(p => p.value === current.type)?.label ?? "Selecionar"
    }

    if (current.range?.from) {
      if (!current.range.to) {
        return format(current.range.from, "dd/MM/yyyy")
      }
      if (current.range.from.getTime() === current.range.to.getTime()) {
         return format(current.range.from, "dd/MM/yyyy")
      }
      return `${format(current.range.from, "dd/MM/yyyy")} - ${format(current.range.to, "dd/MM/yyyy")}`
    }

    return "Selecionar"
  }, [current])

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          className={cn(
            "h-10 justify-between rounded-lg border-border bg-white text-sm font-semibold text-foreground px-3 min-w-[172px] focus:ring-2 focus:ring-[#3B0270]/40 focus:ring-offset-1 focus-visible:ring-[#3B0270]/40 focus-visible:ring-offset-1",
            !current && "text-muted-foreground"
          )}
          aria-label="Filtrar por período"
        >
          <span className="flex items-center gap-2 overflow-hidden">
             <CalendarDays className="h-4 w-4 shrink-0 text-[#3B0270]" aria-hidden="true" />
             <span className="truncate">{displayText}</span>
          </span>
          <ChevronDown className="h-4 w-4 shrink-0 opacity-50 ml-2" />
        </Button>
      </PopoverTrigger>
      
      <PopoverContent className="w-auto p-0 rounded-xl" align="end">
        <div className="flex flex-col md:flex-row divide-y md:divide-y-0 md:divide-x divide-border">
          {/* Presets Sidebar */}
          <div className="flex flex-col p-2 space-y-1 w-full md:w-48 bg-slate-50/50 rounded-xl">
             {PERIOD_OPTIONS.map((opt) => (
               <button
                 key={opt.value}
                 onClick={() => handlePresetSelect(opt.value)}
                 className={cn(
                   "flex items-center w-full px-3 py-2 text-sm font-medium rounded-lg transition-colors text-left",
                   current.type === opt.value
                     ? "bg-[#3B0270] text-white"
                     : "text-foreground hover:bg-slate-200"
                 )}
               >
                 {opt.label}
               </button>
             ))}
          </div>

          {/* Calendar Picker (Only visibly active/useful when custom is focused or chosen) */}
          {current.type === "custom" && (
            <div className="p-2">
              <Calendar
                 initialFocus
                 mode="range"
                 defaultMonth={current.range?.from}
                 selected={current.range}
                 onSelect={handleDateSelect}
                 numberOfMonths={1}
                 locale={ptBR}
                 className="rounded-md"
              />
            </div>
          )}
        </div>
      </PopoverContent>
    </Popover>
  )
}
