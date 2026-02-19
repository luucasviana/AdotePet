import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Card, CardContent } from "@/components/ui/card"
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area"

const TESTIMONIALS = [
    {
        name: "Ana Silva",
        text: "Adotar o Thor foi a melhor decisão da minha vida! Ele trouxe tanta alegria para nossa casa.",
        pet: "Thor",
        photo: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?q=80&w=100&auto=format&fit=crop"
    },
    {
        name: "Carlos Souza",
        text: "O processo foi muito simples e seguro. A equipe do AdotePet foi incrível.",
        pet: "Luna",
        photo: "https://images.unsplash.com/photo-1599566150163-29194dcaad36?q=80&w=100&auto=format&fit=crop"
    },
    {
        name: "Beatriz Oliveira",
        text: "Encontrei meu companheiro de aventuras. Recomendo para todos!",
        pet: "Max",
        photo: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=100&auto=format&fit=crop"
    },
    {
        name: "João Pedro",
        text: "Nunca imaginei que seria tão fácil encontrar um pet que combina tanto comigo.",
        pet: "Mel",
        photo: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=100&auto=format&fit=crop"
    },
    {
        name: "Fernanda Costa",
        text: "A plataforma me ajudou a achar um gatinho perto de casa. Adorei!",
        pet: "Mimi",
        photo: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?q=80&w=100&auto=format=crop"
    },
]

export function HappyTails() {
    return (
        <ScrollArea className="w-full whitespace-nowrap rounded-md">
            <div className="flex w-max space-x-4 p-4">
                {TESTIMONIALS.map((t, i) => (
                    <Card key={i} className="w-[300px] shrink-0 overflow-hidden whitespace-normal">
                        <CardContent className="p-6">
                            <p className="mb-4 text-sm text-muted-foreground italic">"{t.text}"</p>
                            <div className="flex items-center gap-3">
                                <Avatar>
                                    <AvatarImage src={t.photo} alt={t.name} />
                                    <AvatarFallback>{t.name[0]}</AvatarFallback>
                                </Avatar>
                                <div>
                                    <p className="text-sm font-semibold">{t.name}</p>
                                    <p className="text-xs text-muted-foreground">Adotou {t.pet}</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>
            <ScrollBar orientation="horizontal" />
        </ScrollArea>
    )
}
