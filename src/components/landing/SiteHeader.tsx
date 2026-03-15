import { Button } from "@/components/ui/button"
import { Container } from "@/components/layout/Container"
import { Link } from "react-router-dom"


export function SiteHeader() {
    return (
        <header className="sticky top-0 z-40 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
            <Container className="flex h-16 items-center justify-between">
                <a href="/" className="flex items-center">
                    <img src="/logo%20principal.png" alt="AdotePet" className="h-10 w-auto object-contain" />
                </a>

                <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-muted-foreground">
                    <a href="#como-adotar" className="hover:text-foreground transition-colors">Como Adotar</a>
                    <a href="#historias" className="hover:text-foreground transition-colors">Histórias</a>
                    <a href="#duvidas" className="hover:text-foreground transition-colors">Dúvidas</a>
                </nav>

                <div className="flex items-center gap-4">
                    <Button variant="ghost" asChild className="hidden sm:inline-flex">
                        <Link to="/login">Entrar</Link>
                    </Button>
                    <Button asChild>
                        <Link to="/cadastro">Cadastrar</Link>
                    </Button>
                </div>
            </Container>
        </header>
    )
}
