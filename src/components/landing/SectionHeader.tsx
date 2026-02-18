import { cn } from "@/lib/utils"

interface SectionHeaderProps {
    title: string
    subtitle?: string
    align?: "left" | "center" | "right"
    className?: string
}

export function SectionHeader({ title, subtitle, align = "center", className }: SectionHeaderProps) {
    return (
        <div className={cn("mb-8", className, {
            "text-center": align === "center",
            "text-left": align === "left",
            "text-right": align === "right",
        })}>
            <h2 className="text-2xl font-bold tracking-tight text-primary md:text-3xl">
                {title}
            </h2>
            {subtitle && (
                <p className="mt-4 text-base text-muted-foreground md:text-lg max-w-2xl mx-auto">
                    {subtitle}
                </p>
            )}
        </div>
    )
}
