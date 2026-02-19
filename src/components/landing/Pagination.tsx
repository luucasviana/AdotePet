import { Button } from "@/components/ui/button"
import { ChevronLeft, ChevronRight } from "lucide-react"

interface PaginationProps {
    currentPage: number
    totalPages: number
    onPageChange: (page: number) => void
    startIndex: number
    endIndex: number
    totalResults: number
}

export function Pagination({
    currentPage,
    totalPages,
    onPageChange,
    startIndex,
    endIndex,
    totalResults
}: PaginationProps) {
    if (totalPages <= 1) return null

    // Generate page numbers to show
    const getPageNumbers = () => {
        const pages = []

        if (totalPages <= 5) {
            for (let i = 1; i <= totalPages; i++) {
                pages.push(i)
            }
        } else {
            // Always show first
            pages.push(1)

            if (currentPage > 3) {
                pages.push("...")
            }

            // Show current and neighbors
            const start = Math.max(2, currentPage - 1)
            const end = Math.min(totalPages - 1, currentPage + 1)

            for (let i = start; i <= end; i++) {
                pages.push(i)
            }

            if (currentPage < totalPages - 2) {
                pages.push("...")
            }

            // Always show last
            pages.push(totalPages)
        }

        return pages
    }

    return (
        <div className="flex flex-col md:flex-row items-center justify-between gap-4 py-4 w-full">
            <div className="text-sm text-muted-foreground order-2 md:order-1">
                Mostrando <span className="font-medium text-foreground">{startIndex + 1}-{endIndex}</span> de <span className="font-medium text-foreground">{totalResults}</span>
            </div>

            <div className="flex items-center gap-2 order-1 md:order-2">
                <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onPageChange(currentPage - 1)}
                    disabled={currentPage === 1}
                    className="h-10 px-3 md:px-4"
                >
                    <ChevronLeft className="h-4 w-4 mr-1 md:mr-2" />
                    <span className="hidden md:inline">Anterior</span>
                </Button>

                <div className="flex items-center gap-1 md:gap-2">
                    {getPageNumbers().map((page, index) => (
                        <div key={index}>
                            {page === "..." ? (
                                <span className="px-2 text-muted-foreground">...</span>
                            ) : (
                                <Button
                                    variant={currentPage === page ? "default" : "outline"}
                                    size="sm"
                                    onClick={() => onPageChange(page as number)}
                                    className="h-10 w-10 p-0"
                                >
                                    {page}
                                </Button>
                            )}
                        </div>
                    ))}
                </div>

                <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onPageChange(currentPage + 1)}
                    disabled={currentPage === totalPages}
                    className="h-10 px-3 md:px-4"
                >
                    <span className="hidden md:inline">Próximo</span>
                    <ChevronRight className="h-4 w-4 ml-1 md:ml-2" />
                </Button>
            </div>
        </div>
    )
}
