import { Button } from "@/components/ui/button"
import { Container } from "@/components/layout/Container"
import { Section } from "@/components/layout/Section"
import { Stack } from "@/components/layout/Stack"
import { Link } from "react-router-dom"

export function LandingPage() {
    return (
        <Container>
            <Section>
                <Stack className="items-center text-center">
                    <h1 className="text-4xl font-bold text-primary">Adote Pet</h1>
                    <p className="text-xl text-muted-foreground">
                        Encontre seu novo melhor amigo.
                    </p>
                    <div className="flex gap-4 mt-4">
                        <Button asChild size="lg">
                            <Link to="/cadastro">Quero Adotar</Link>
                        </Button>
                        <Button variant="outline" size="lg" asChild>
                            <Link to="/login">Já tenho conta</Link>
                        </Button>
                    </div>
                </Stack>
            </Section>
        </Container>
    )
}
