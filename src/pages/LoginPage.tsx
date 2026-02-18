import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Container } from "@/components/layout/Container"
import { Section } from "@/components/layout/Section"
import { Link } from "react-router-dom"

export function LoginPage() {
    return (
        <Container>
            <Section className="flex justify-center">
                <Card className="w-full max-w-md">
                    <CardHeader>
                        <CardTitle>Login</CardTitle>
                        <CardDescription>Entre na sua conta para continuar.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
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
                        <Button className="w-full">Entrar</Button>
                        <Button variant="link" asChild>
                            <Link to="/reset-senha">Esqueci minha senha</Link>
                        </Button>
                        <div className="text-center text-sm">
                            Não tem conta? <Link to="/cadastro" className="font-medium text-primary hover:underline">Cadastre-se</Link>
                        </div>
                    </CardFooter>
                </Card>
            </Section>
        </Container>
    )
}
