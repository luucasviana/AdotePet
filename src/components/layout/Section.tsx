import { cn } from "@/lib/utils"

export function Section({ className, ...props }: React.ComponentProps<"section">) {
    return <section className={cn("py-8 md:py-16", className)} {...props} />
}
