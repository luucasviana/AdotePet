import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import {
    Sheet,
    SheetContent,
    SheetDescription,
    SheetHeader,
    SheetTitle,
    SheetTrigger,
    SheetFooter,
    SheetClose
} from "@/components/ui/sheet"
import { SlidersHorizontal } from "lucide-react"
import type { SearchFilters } from "./SearchPanel"

interface SearchSheetProps {
    filters: SearchFilters
    onFilterChange: (key: keyof SearchFilters, value: string) => void
    onSearch: () => void
}

export function SearchSheet({ filters, onFilterChange, onSearch }: SearchSheetProps) {
    return (
        <Sheet>
            <SheetTrigger asChild>
                <Button variant="outline" size="icon" className="lg:hidden">
                    <SlidersHorizontal className="h-4 w-4" />
                </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-[300px] sm:w-[400px]">
                <SheetHeader>
                    <SheetTitle>Filtros</SheetTitle>
                    <SheetDescription>
                        Refine sua busca para encontrar o pet ideal.
                    </SheetDescription>
                </SheetHeader>

                <div className="grid gap-4 py-4">
                    <div className="space-y-2">
                        <label className="text-sm font-medium">Espécie</label>
                        <Select
                            value={filters.species}
                            onValueChange={(val) => onFilterChange("species", val)}
                        >
                            <SelectTrigger>
                                <SelectValue placeholder="Qualquer" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">Qualquer</SelectItem>
                                <SelectItem value="Cachorro">Cachorro</SelectItem>
                                <SelectItem value="Gato">Gato</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-medium">Porte</label>
                        <Select
                            value={filters.size}
                            onValueChange={(val) => onFilterChange("size", val)}
                        >
                            <SelectTrigger>
                                <SelectValue placeholder="Qualquer" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">Qualquer</SelectItem>
                                <SelectItem value="Pequeno">Pequeno</SelectItem>
                                <SelectItem value="Médio">Médio</SelectItem>
                                <SelectItem value="Grande">Grande</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-medium">Localização</label>
                        <Input
                            placeholder="Cidade ou Estado"
                            value={filters.location}
                            onChange={(e) => onFilterChange("location", e.target.value)}
                        />
                    </div>
                </div>

                <SheetFooter>
                    <SheetClose asChild>
                        <Button onClick={onSearch} className="w-full">Aplicar Filtros</Button>
                    </SheetClose>
                </SheetFooter>
            </SheetContent>
        </Sheet>
    )
}
