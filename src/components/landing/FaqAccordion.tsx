import {
    Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger,
} from "@/components/ui/accordion"
import { Container } from "@/components/layout/Container"
import { Section } from "@/components/layout/Section"
import { SectionHeader } from "./SectionHeader"

const FAQS = [
    {
        question: "Como funciona a adoção?",
        answer: "Você escolhe o pet, entra em contato com o responsável e agenda uma visita. Se tudo der certo, você preenche o termo de adoção e leva seu novo amigo para casa."
    },
    {
        question: "Preciso pagar alguma taxa?",
        answer: "A adoção em si é gratuita. Algumas ONGs podem solicitar uma taxa simbólica ou doação de ração para ajudar a manter o abrigo."
    },
    {
        question: "O que preciso para adotar?",
        answer: "Ser maior de 18 anos, apresentar documento com foto e comprovante de residência. Alguns abrigos podem pedir fotos do local onde o pet vai morar."
    },
    {
        question: "E se o pet não se adaptar?",
        answer: "Todo processo de adaptação leva tempo. Se mesmo assim não funcionar, você pode devolver o pet para o responsável, garantindo a segurança dele."
    },
    {
        question: "Os animais são vacinados?",
        answer: "A maioria dos animais adultos já é entregue castrada e vacinada. Filhotes podem precisar completar o ciclo de vacinação."
    },
    {
        question: "Posso adotar se moro em apartamento?",
        answer: "Sim! Muitos animais se adaptam super bem a apartamentos. Verifique o porte e nível de energia do pet na descrição."
    },
    {
        question: "Como funcionam as visitas?",
        answer: "As visitas são combinadas diretamente com o protetor ou abrigo. É o momento ideal para conhecer a personalidade do animal."
    },
    {
        question: "Vocês entregam o animal?",
        answer: "Depende de cada caso. Alguns protetores levam o animal até a nova casa para verificar as condições de segurança."
    }
]

export function FaqAccordion() {
    return (
        <Section id="duvidas" className="py-10 scroll-mt-24">
            <Container className="max-w-3xl">
                <SectionHeader
                    title="Dúvidas Frequentes"
                    subtitle="Tudo o que você precisa saber antes de adotar."
                />

                <Accordion type="single" collapsible className="w-full">
                    {FAQS.map((faq, index) => (
                        <AccordionItem key={index} value={`item-${index}`}>
                            <AccordionTrigger>{faq.question}</AccordionTrigger>
                            <AccordionContent>{faq.answer}</AccordionContent>
                        </AccordionItem>
                    ))}
                </Accordion>
            </Container>
        </Section>
    )
}
