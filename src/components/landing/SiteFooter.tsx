import { Container } from "@/components/layout/Container"
import { PawPrint, Instagram, Linkedin } from "lucide-react"

export function SiteFooter() {
    return (
        <footer className="border-t bg-muted/40 py-12 md:py-16">
            <Container>
                <div className="grid grid-cols-1 gap-8 md:grid-cols-4 text-center md:text-left">
                    <div className="space-y-4 flex flex-col items-center md:items-start">
                        <div className="flex items-center gap-2 font-bold text-xl text-primary">
                            <PawPrint className="h-6 w-6" />
                            <span>Adote Pet</span>
                        </div>
                        <p className="text-sm text-muted-foreground">
                            Conectando corações e patas desde 2024. Nossa missão é encontrar um lar amoroso para cada animal.
                        </p>

                        <div className="flex items-center gap-4 mt-6 justify-center md:justify-start">
                            <a
                                href="https://instagram.com/adotepet"
                                target="_blank"
                                rel="noreferrer"
                                aria-label="Instagram do Adote Pet"
                                className="flex items-center justify-center w-10 h-10 rounded-lg bg-primary/10 text-primary hover:bg-primary hover:text-white transition-colors"
                            >
                                <Instagram className="h-5 w-5" />
                            </a>
                            <a
                                href="https://linkedin.com/company/adotepet"
                                target="_blank"
                                rel="noreferrer"
                                aria-label="LinkedIn do Adote Pet"
                                className="flex items-center justify-center w-10 h-10 rounded-lg bg-primary/10 text-primary hover:bg-primary hover:text-white transition-colors"
                            >
                                <Linkedin className="h-5 w-5" />
                            </a>
                        </div>
                    </div>

                    <div>
                        <h3 className="mb-4 text-sm font-semibold">Institucional</h3>
                        <ul className="space-y-3 text-sm text-muted-foreground">
                            <li><a href="#" className="hover:text-foreground">Sobre nós</a></li>
                            <li><a href="#" className="hover:text-foreground">Parceiros</a></li>
                            <li><a href="#" className="hover:text-foreground">Carreiras</a></li>
                        </ul>
                    </div>

                    <div>
                        <h3 className="mb-4 text-sm font-semibold">Ajuda</h3>
                        <ul className="space-y-3 text-sm text-muted-foreground">
                            <li><a href="#" className="hover:text-foreground">Central de Ajuda</a></li>
                            <li><a href="#" className="hover:text-foreground">Dicas de Segurança</a></li>
                            <li><a href="#" className="hover:text-foreground">Termos de Uso</a></li>
                            <li><a href="#" className="hover:text-foreground">Privacidade</a></li>
                        </ul>
                    </div>

                    <div>
                        <h3 className="mb-4 text-sm font-semibold">Contato</h3>
                        <ul className="space-y-3 text-sm text-muted-foreground">
                            <li>contato@adotepet.com</li>
                            <li>São Paulo, SP</li>
                        </ul>
                    </div>
                </div>

                <div className="mt-12 flex flex-col items-center justify-between gap-4 border-t pt-8 text-center text-sm text-muted-foreground md:flex-row">
                    <p>&copy; 2026 Adote Pet. Todos os direitos reservados.</p>
                </div>
            </Container>
        </footer>
    )
}
