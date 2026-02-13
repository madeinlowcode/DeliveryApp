// TASK-043: Login page
// AIDEV-NOTE: Public login page for user authentication

import { Metadata } from "next"
import Link from "next/link"
import { redirect } from "next/navigation"
import { Store } from "lucide-react"

import { createClient } from "@/lib/supabase/server"
import { LoginForm } from "@/components/features/auth/login-form"

export const metadata: Metadata = {
  title: "Login | Delivery",
  description: "Entre na sua conta para acessar o painel de controle",
}

export default async function LoginPage() {
  // AIDEV-NOTE: Redirect to dashboard if already authenticated
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (user) {
    redirect("/dashboard")
  }

  return (
    <div className="container relative flex min-h-screen flex-col items-center justify-center md:grid lg:max-w-none lg:grid-cols-2 lg:px-0">
      {/* AIDEV-NOTE: Left side - Branding panel */}
      <div className="bg-muted relative hidden h-full flex-col p-10 text-white lg:flex dark:border-r">
        <div className="absolute inset-0 bg-zinc-900" />

        {/* Logo and branding */}
        <div className="relative z-20 flex items-center text-lg font-medium">
          <Store className="mr-2 size-6" />
          Delivery
        </div>

        {/* Feature highlights */}
        <div className="relative z-20 mt-auto">
          <blockquote className="space-y-2">
            <p className="text-lg">
              &ldquo;Gerencie seus pedidos em tempo real com nosso painel Kanban intuitivo.
              Acompanhe cada etapa do processo de entrega.&rdquo;
            </p>
            <footer className="text-sm text-zinc-400">
              Sistema de Gestao de Delivery
            </footer>
          </blockquote>
        </div>

        {/* Background pattern */}
        <div
          className="absolute inset-0 z-10 opacity-10"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.4'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
          }}
        />
      </div>

      {/* AIDEV-NOTE: Right side - Login form */}
      <div className="lg:p-8">
        <div className="mx-auto flex w-full flex-col justify-center space-y-6 sm:w-[350px]">
          {/* Header */}
          <div className="flex flex-col space-y-2 text-center">
            {/* Mobile logo */}
            <div className="mb-4 flex items-center justify-center lg:hidden">
              <Store className="mr-2 size-6" />
              <span className="text-lg font-medium">Delivery</span>
            </div>

            <h1 className="text-2xl font-semibold tracking-tight">
              Bem-vindo de volta
            </h1>
            <p className="text-muted-foreground text-sm">
              Entre com seu email para acessar o painel
            </p>
          </div>

          {/* Login form */}
          <LoginForm />

          {/* Terms and privacy */}
          <p className="text-muted-foreground px-8 text-center text-xs">
            Ao continuar, voce concorda com nossos{" "}
            <Link
              href="/terms"
              className="hover:text-primary underline underline-offset-4"
            >
              Termos de Servico
            </Link>{" "}
            e{" "}
            <Link
              href="/privacy"
              className="hover:text-primary underline underline-offset-4"
            >
              Politica de Privacidade
            </Link>
            .
          </p>
        </div>
      </div>
    </div>
  )
}
