import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Card, CardContent } from "@/components/ui/card"
// import { cn } from "@/lib/utils"

const TESTIMONIALS = [
    {
        name: "Ana Silva",
        text: "Adotar o Thor foi a melhor decisão! Ele trouxe tanta alegria.",
        pet: "Thor",
        photo: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?q=80&w=150&auto=format&fit=crop"
    },
    {
        name: "Carlos Souza",
        text: "Processo simples e seguro. A equipe foi incrível.",
        pet: "Luna",
        photo: "https://images.unsplash.com/photo-1599566150163-29194dcaad36?q=80&w=150&auto=format&fit=crop"
    },
    {
        name: "Beatriz O.",
        text: "Encontrei meu companheiro de aventuras. Recomendo!",
        pet: "Max",
        photo: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=150&auto=format&fit=crop"
    },
    {
        name: "João Pedro",
        text: "Fácil encontrar um pet que combina tanto comigo.",
        pet: "Mel",
        photo: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=150&auto=format&fit=crop"
    },
    {
        name: "Fernanda C.",
        text: "Achei um gatinho perto de casa. Adorei a plataforma!",
        pet: "Mimi",
        photo: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?q=80&w=150&auto=format=crop"
    },
    {
        name: "Ricardo M.",
        text: "O processo de adoção é muito transparente e sério.",
        pet: "Bob",
        photo: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?q=80&w=150&auto=format&fit=crop"
    }
]

export function TestimonialsMarquee() {
    return (
        <div
            className="group relative flex w-full overflow-hidden py-10"
            style={{ "--marquee-duration": "40s" } as React.CSSProperties}
        >
            <div className="flex animate-marquee group-hover:paused min-w-full shrink-0 gap-6 px-3">
                {[...TESTIMONIALS, ...TESTIMONIALS, ...TESTIMONIALS].map((t, i) => (
                    <TestimonialCard key={i} data={t} />
                ))}
            </div>
        </div>
    )
}

function TestimonialCard({ data }: { data: typeof TESTIMONIALS[0] }) {
    return (
        <Card className="w-[300px] shrink-0 rounded-2xl border bg-card transition-all duration-300 hover:scale-105 hover:shadow-lg hover:border-primary/30">
            <CardContent className="p-6">
                <div className="flex items-start gap-4">
                    <Avatar className="h-10 w-10 border">
                        <AvatarImage src={data.photo} alt={data.name} />
                        <AvatarFallback>{data.name[0]}</AvatarFallback>
                    </Avatar>
                    <div>
                        <p className="text-sm font-bold text-foreground">{data.name}</p>
                        <p className="text-xs font-medium text-primary">Adotou {data.pet}</p>
                    </div>
                </div>
                <p className="mt-4 text-sm text-muted-foreground leading-relaxed italic">
                    "{data.text}"
                </p>
            </CardContent>
        </Card>
    )
}
