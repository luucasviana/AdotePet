import { supabase } from "@/lib/supabase"

// ─── Types ────────────────────────────────────────────────────────────────────

export interface PartnerBanner {
  id: string
  title: string | null
  image_url: string
  mobile_image_url: string | null
  link_url: string | null
  link_type: string
  cta_label: string | null
  display_order: number
}

// ─── Actions ──────────────────────────────────────────────────────────────────

/**
 * Busca banners ativos para a home pública PF.
 * Respeita vigência (starts_at / ends_at) via RLS + ordenação por display_order.
 */
export async function fetchActiveBanners(): Promise<{
  data: PartnerBanner[]
  error?: string
}> {
  const { data, error } = await supabase
    .from("partner_banners")
    .select("id, title, image_url, mobile_image_url, link_url, link_type, cta_label, display_order")
    .order("display_order", { ascending: true })

  if (error) return { data: [], error: "Não foi possível carregar os banners." }
  return { data: (data ?? []) as PartnerBanner[] }
}
