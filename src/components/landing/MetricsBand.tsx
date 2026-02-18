import { Container } from "@/components/layout/Container"
import { useEffect, useState } from "react"

function Counter({ end, label }: { end: number; label: string }) {
    const [count, setCount] = useState(0)

    useEffect(() => {
        let start = 0
        const duration = 2000
        const stepTime = Math.abs(Math.floor(duration / end))
        const timer = setInterval(() => {
            start += 1
            setCount(start)
            if (start === end) clearInterval(timer)
        }, stepTime)
        return () => clearInterval(timer)
    }, [end])

    return (
        <div className="flex flex-col items-center justify-center p-4">
            <div className="text-4xl font-extrabold text-primary md:text-5xl tracking-tight">{count}+</div>
            <div className="mt-2 text-sm font-medium text-muted-foreground uppercase tracking-wider">{label}</div>
        </div>
    )
}

export function MetricsBand() {
    return (
        <div className="w-full border-y bg-primary/5">
            <Container>
                <div className="flex flex-col md:flex-row divide-y md:divide-y-0 md:divide-x divide-primary/10 md:py-8">
                    <div className="flex-1 py-6 md:py-0">
                        <Counter end={150} label="Animais Adotados" />
                    </div>
                    <div className="flex-1 py-6 md:py-0">
                        <Counter end={45} label="ONGs Parceiras" />
                    </div>
                    <div className="flex-1 py-6 md:py-0">
                        <Counter end={30} label="Pedidos em Andamento" />
                    </div>
                </div>
            </Container>
        </div>
    )
}
