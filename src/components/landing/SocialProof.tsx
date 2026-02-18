import { Container } from "@/components/layout/Container"
import { Section } from "@/components/layout/Section"
import { TestimonialsMarquee } from "./TestimonialsMarquee"
import { SectionHeader } from "./SectionHeader"

export function SocialProof() {
    return (
        <Section id="historias" className="py-10 scroll-mt-24">
            <Container>
                <SectionHeader className="text-center"
                    title="Histórias Felizes"
                    subtitle="Veja quem já encontrou seu novo melhor amigo."
                />
            </Container>

            <TestimonialsMarquee />
        </Section>
    )
}
