import { Container } from "@/components/layout/Container"

export function HeroSearch() {
    return (
        <section className="relative bg-gradient-to-b from-primary/10 to-transparent pt-12 pb-6 md:pt-20 md:pb-10 lg:pt-24 lg:pb-10">
            <Container>
                <div className="grid gap-8 lg:grid-cols-2 lg:gap-12 items-center">
                    <div className="space-y-6 text-center lg:text-left">
                        <h1 className="text-4xl font-extrabold tracking-tight text-primary sm:text-5xl md:text-6xl">
                            Encontre seu novo <br className="hidden lg:block" />
                            <span className="text-foreground">melhor amigo.</span>
                        </h1>
                        <p className="mx-auto max-w-[600px] text-lg text-muted-foreground lg:mx-0">
                            Centenas de animais esperam por um lar amoroso. Adotar é um ato de amor que muda vidas.
                        </p>
                    </div>

                    <div className="relative mx-auto w-full max-w-[500px] lg:max-w-none">
                        {/* Placeholder for Media/Image */}
                        <div className="aspect-video w-full rounded-2xl bg-muted/50 object-cover shadow-lg flex items-center justify-center text-muted-foreground">
                            [Foto/Vídeo Institucional]
                        </div>
                    </div>
                </div>
            </Container>
        </section>
    )
}
