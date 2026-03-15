import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs))
}

/**
 * Normaliza um número de telefone e gera o link do WhatsApp com DDI (55)
 * se não houver um código de país detectado.
 */
export function getWhatsAppLink(phone: string | null | undefined, message?: string): string | null {
  if (!phone) return null
  
  const sanitized = phone.replace(/\D/g, "")
  
  // Número muito curto para ser válido no Brasil (DDD + 8 dígitos = 10 mín)
  if (sanitized.length < 10) return null

  let finalNumber = sanitized
  // Se for padrão nacional normal de 10 ou 11 dígitos, adiciona o DDI do Brasil
  if (sanitized.length === 10 || sanitized.length === 11) {
    finalNumber = `55${sanitized}`
  } 

  let url = `https://wa.me/${finalNumber}`
  if (message) {
    url += `?text=${encodeURIComponent(message)}`
  }
  return url
}
