import { cn } from "@/lib/utils"

export function Stack({ className, ...props }: React.ComponentProps<"div">) {
    return <div className={cn("flex flex-col gap-4", className)} {...props} />
}
