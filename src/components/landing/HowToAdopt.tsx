import { Container } from "@/components/layout/Container"
import { Section } from "@/components/layout/Section"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { SectionHeader } from "./SectionHeader"
import { Search, User, MessageCircle, Home } from "lucide-react"

const STEPS = [
    {
        icon: Search,
        title: "Encontre o pet",
        description: "Navegue pelos nossos amigos peludos e ache o match perfeito."
    },
    {
        icon: User,
        title: "Faça seu cadastro",
        description: "Crie um perfil rápido para facilitar a comunicação com os abrigos."
    },
    {
        icon: MessageCircle,
        title: "Fale com o tutor",
        description: "Tire dúvidas e combine uma visita para conhecer o pet."
    },
    {
        icon: Home,
        title: "Leve para casa",
        description: "Com tudo certo, adote e transforme a vida do seu novo amigo."
    }
]

export function HowToAdopt() {
    return (
        <Section id="como-adotar" className="bg-background py-10 scroll-mt-24">
            <Container>
                <SectionHeader
                    title="Como Adotar"
                    subtitle="Um processo simples, seguro e cheio de amor em cada etapa."
                />

                <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
                    {STEPS.map((step, index) => {
                        const Icon = step.icon
                        return (
                            <Card
                                key={index}
                                className="group relative border-none shadow-none hover:shadow-lg transition-all duration-300 rounded-2xl overflow-hidden ring-1 ring-border/50 hover:ring-primary/20"
                            >
                                <CardContent className="flex flex-col items-center text-center p-6 h-full bg-card">
                                    {/* Decorative line for desktop - rendered only once or handled differently if needed. 
                      For now, keeping it simple as requested: cards with icons. 
                      The "connector" was optional/decorative. Focusing on clean cards. */}

                                    <div className="mb-6 rounded-full bg-primary/5 p-4 group-hover:bg-primary/10 group-hover:scale-110 transition-all duration-300">
                                        <Icon className="h-8 w-8 text-primary" />
                                    </div>

                                    <Badge variant="secondary" className="mb-4 px-3 py-1 text-xs font-normal bg-primary/5 text-primary">
                                        Passo {index + 1}
                                    </Badge>

                                    <h3 className="mb-3 text-xl font-bold text-foreground group-hover:text-primary transition-colors">
                                        {step.title}
                                    </h3>

                                    <p className="text-muted-foreground text-sm leading-relaxed">
                                        {step.description}
                                    </p>
                                </CardContent>
                            </Card>
                        )
                    })}
                </div>
            </Container>
        </Section>
    )
}
