import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Container } from "@/components/layout/Container"
import { Section } from "@/components/layout/Section"
import { Link } from "react-router-dom"

export function ResetSenhaPage() {
    return (
        <Container>
            <Section className="flex justify-center">
                <Card className="w-full max-w-md">
                    <CardHeader>
                        <CardTitle>Recuperar Senha</CardTitle>
                        <CardDescription>Enviaremos um link para recuperar seu acesso.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="space-y-2">
                            <label htmlFor="email" className="text-sm font-medium">Email</label>
                            <Input id="email" type="email" placeholder="seu@email.com" />
                        </div>
                    </CardContent>
                    <CardFooter className="flex flex-col gap-4">
                        <Button className="w-full">Enviar Instruções</Button>
                        <Button variant="ghost" asChild>
                            <Link to="/login">Voltar para Login</Link>
                        </Button>
                    </CardFooter>
                </Card>
            </Section>
        </Container>
    )
}
