import { supabase } from "@/lib/supabase"

// ─── Types ────────────────────────────────────────────────────────────────────

export interface PublishedPartner {
  id: string
  account_id: string
  slug: string
  logo_image_url: string | null
  headline: string | null
  description: string | null
  services: string[] | null
  phone: string | null
  whatsapp: string | null
  instagram: string | null
  website: string | null
  city: string | null
  state: string | null
  display_order: number
  // Joined from profiles
  org_type: string | null
  company_name: string | null
  fantasy_name: string | null
}

export interface PartnerProfile extends PublishedPartner {
  cover_image_url: string | null
}

export interface PartnerCategory {
  org_type: string
  count: number
}

// ─── Actions ──────────────────────────────────────────────────────────────────

/**
 * Busca parceiros publicados, opcionalmente filtrados por org_type (categoria).
 */
export async function fetchPublishedPartners(categoria?: string): Promise<{
  data: PublishedPartner[]
  error?: string
}> {
  let query = supabase
    .from("partner_public_profiles")
    .select(`
      id, account_id, slug, logo_image_url, headline, description,
      services, phone, whatsapp, instagram, website, city, state, display_order,
      profiles!account_id(org_type, company_name, fantasy_name)
    `)
    .order("display_order", { ascending: true })

  const { data, error } = await query

  if (error) return { data: [], error: "Não foi possível carregar os parceiros." }

  const mapped: PublishedPartner[] = (data ?? []).map((row: any) => ({
    id: row.id,
    account_id: row.account_id,
    slug: row.slug,
    logo_image_url: row.logo_image_url,
    headline: row.headline,
    description: row.description,
    services: Array.isArray(row.services) ? row.services : null,
    phone: row.phone,
    whatsapp: row.whatsapp,
    instagram: row.instagram,
    website: row.website,
    city: row.city,
    state: row.state,
    display_order: row.display_order,
    org_type: row.profiles?.org_type ?? null,
    company_name: row.profiles?.company_name ?? null,
    fantasy_name: row.profiles?.fantasy_name ?? null,
  }))

  // Filtrar por categoria no client se informada (evita complexidade de join no RLS)
  const filtered = categoria
    ? mapped.filter((p) => p.org_type?.toLowerCase() === categoria.toLowerCase())
    : mapped

  return { data: filtered }
}

/**
 * Busca perfil completo de um parceiro pelo slug.
 */
export async function fetchPartnerBySlug(slug: string): Promise<{
  data: PartnerProfile | null
  error?: string
}> {
  const { data, error } = await supabase
    .from("partner_public_profiles")
    .select(`
      id, account_id, slug, cover_image_url, logo_image_url, headline, description,
      services, phone, whatsapp, instagram, website, city, state, display_order,
      profiles!account_id(org_type, company_name, fantasy_name)
    `)
    .eq("slug", slug)
    .single()

  if (error || !data) return { data: null, error: "Parceiro não encontrado." }

  const row: any = data
  return {
    data: {
      id: row.id,
      account_id: row.account_id,
      slug: row.slug,
      cover_image_url: row.cover_image_url,
      logo_image_url: row.logo_image_url,
      headline: row.headline,
      description: row.description,
      services: Array.isArray(row.services) ? row.services : null,
      phone: row.phone,
      whatsapp: row.whatsapp,
      instagram: row.instagram,
      website: row.website,
      city: row.city,
      state: row.state,
      display_order: row.display_order,
      org_type: row.profiles?.org_type ?? null,
      company_name: row.profiles?.company_name ?? null,
      fantasy_name: row.profiles?.fantasy_name ?? null,
    },
  }
}

/**
 * Busca categorias distintas de parceiros publicados.
 * Retorna apenas org_types que existem em partner_public_profiles.
 */
export async function fetchPartnerCategories(): Promise<{
  data: PartnerCategory[]
  error?: string
}> {
  // Busca todos os parceiros publicados com seus org_types para derivar categorias
  const { data, error } = await supabase
    .from("partner_public_profiles")
    .select(`
      id,
      profiles!account_id(org_type)
    `)

  if (error) return { data: [], error: "Não foi possível carregar as categorias." }

  // Agrupar por org_type e contar
  const counts: Record<string, number> = {}
  ;(data ?? []).forEach((row: any) => {
    const type = row.profiles?.org_type
    if (type) counts[type] = (counts[type] ?? 0) + 1
  })

  const categories: PartnerCategory[] = Object.entries(counts).map(([org_type, count]) => ({
    org_type,
    count,
  }))

  return { data: categories }
}
