import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Container } from "@/components/layout/Container"
import { Section } from "@/components/layout/Section"
import { Link } from "react-router-dom"

export function CadastroPage() {
    return (
        <Container>
            <Section className="flex justify-center">
                <Card className="w-full max-w-md">
                    <CardHeader>
                        <CardTitle>Crie sua conta</CardTitle>
                        <CardDescription>Comece sua jornada de adoção.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="space-y-2">
                            <label htmlFor="name" className="text-sm font-medium">Nome completo</label>
                            <Input id="name" placeholder="Seu nome" />
                        </div>
                        <div className="space-y-2">
                            <label htmlFor="email" className="text-sm font-medium">Email</label>
                            <Input id="email" type="email" placeholder="seu@email.com" />
                        </div>
                        <div className="space-y-2">
                            <label htmlFor="password" className="text-sm font-medium">Senha</label>
                            <Input id="password" type="password" />
                        </div>
                    </CardContent>
                    <CardFooter className="flex flex-col gap-4">
                        <Button className="w-full">Cadastrar</Button>
                        <div className="text-center text-sm">
                            Já tem conta? <Link to="/login" className="font-medium text-primary hover:underline">Entrar</Link>
                        </div>
                    </CardFooter>
                </Card>
            </Section>
        </Container>
    )
}
