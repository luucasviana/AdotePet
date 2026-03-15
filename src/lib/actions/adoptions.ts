import { supabase } from "@/lib/supabase"

// ─── Types ─────────────────────────────────────────────────────────────────────

export type AdoptionStatus = "interview" | "visit_scheduled" | "adopted" | "cancelled"

export interface Adoption {
  id: string
  pet_id: string
  adopter_user_id: string
  owner_account_id: string
  status: AdoptionStatus
  created_at: string
  updated_at: string
  created_by_user_id: string
  updated_by_user_id: string | null
  cancel_reason: string | null
  finished_at: string | null
}

export interface AdoptionWithDetails extends Adoption {
  pet: {
    id: string
    name: string
    species: string
    photos: { file_url: string; is_primary: boolean }[]
  }
  adopter: {
    id: string
    full_name: string | null
    email: string
  }
  owner: {
    id: string
    full_name: string | null
    email: string
    company_name: string | null
  }
}

// ─── Helpers ───────────────────────────────────────────────────────────────────

export const ADOPTION_STATUS_LABEL: Record<AdoptionStatus, string> = {
  interview:       "Entrevista",
  visit_scheduled: "Visita agendada",
  adopted:         "Adotado",
  cancelled:       "Cancelado",
}

export const ADOPTION_STATUS_TRANSITIONS: Record<AdoptionStatus, AdoptionStatus[]> = {
  interview:       ["visit_scheduled", "adopted", "cancelled"],
  visit_scheduled: ["adopted", "cancelled"],
  adopted:         [],
  cancelled:       [],
}

// ─── Actions ───────────────────────────────────────────────────────────────────

/**
 * Expressa interesse em adotar um pet.
 * Cria uma linha em `adoptions` com status 'interview'.
 * Retorna { success, alreadyExists, error }
 */
export async function expressAdoptionInterest(petId: string): Promise<{
  success: boolean
  alreadyExists?: boolean
  whatsappPhone?: string
  error?: string
}> {
  const { data: { user }, error: userError } = await supabase.auth.getUser()
  if (userError || !user) return { success: false, error: "Usuário não autenticado." }

  // Busca o pet e o perfil do responsável (telefone para WhatsApp)
  const { data: pet, error: petError } = await supabase
    .from("pets")
    .select("id, name, status, responsible_profile_id, created_by_profile_id")
    .eq("id", petId)
    .single()

  if (petError || !pet) return { success: false, error: "Pet não encontrado." }
  if (pet.status !== "available") return { success: false, error: "Este pet não está disponível para adoção." }

  // Buscar telefone do responsável (use maybeSingle para evitar 406 caso RLS bloqueie)
  const { data: responsibleProfile } = await supabase
    .from("profiles")
    .select("phone")
    .eq("id", pet.responsible_profile_id)
    .maybeSingle()

  // Verificar se o usuário atual já tem adoção ativa para este pet
  const { data: existingAdoption } = await supabase
    .from("adoptions")
    .select("id, status")
    .eq("pet_id", petId)
    .eq("adopter_user_id", user.id)
    .in("status", ["interview", "visit_scheduled"])
    .maybeSingle()

  if (existingAdoption) {
    return {
      success: true,
      alreadyExists: true,
      whatsappPhone: responsibleProfile?.phone ?? undefined,
    }
  }

  // owner_account_id = responsible_profile_id do pet
  const { error: insertError } = await supabase
    .from("adoptions")
    .insert({
      pet_id:             petId,
      adopter_user_id:    user.id,
      owner_account_id:   pet.responsible_profile_id,
      status:             "interview",
      created_by_user_id: user.id,
    })

  if (insertError) {
    // Constraint de duplicidade → tratado como alreadyExists
    if (insertError.code === "23505") {
      return { success: true, alreadyExists: true, whatsappPhone: responsibleProfile?.phone ?? undefined }
    }
    return { success: false, error: "Não foi possível registrar o interesse. Tente novamente." }
  }

  return {
    success: true,
    alreadyExists: false,
    whatsappPhone: responsibleProfile?.phone ?? undefined,
  }
}

/**
 * Busca adoções para a conta PJ logada, com detalhes de pet e adotante.
 */
export async function fetchAdoptionsForOwner(): Promise<{
  data: AdoptionWithDetails[]
  error?: string
}> {
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { data: [], error: "Não autenticado." }

  const { data, error } = await supabase
    .from("adoptions")
    .select(`
      *,
      pet:pets(id, name, species, photos:pet_photos(file_url, is_primary)),
      adopter:profiles!adopter_user_id(id, full_name, email),
      owner:profiles!owner_account_id(id, full_name, email, company_name)
    `)
    .eq("owner_account_id", user.id)
    .order("created_at", { ascending: false })

  if (error) return { data: [], error: "Erro ao carregar adoções." }

  return { data: (data ?? []) as AdoptionWithDetails[] }
}

/**
 * Busca adoções ativas (interview | visit_scheduled) para a Home PJ.
 */
export async function fetchActiveAdoptionsForOwner(): Promise<{
  data: AdoptionWithDetails[]
  error?: string
}> {
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { data: [], error: "Não autenticado." }

  const { data, error } = await supabase
    .from("adoptions")
    .select(`
      *,
      pet:pets(id, name, species, photos:pet_photos(file_url, is_primary)),
      adopter:profiles!adopter_user_id(id, full_name, email),
      owner:profiles!owner_account_id(id, full_name, email, company_name)
    `)
    .eq("owner_account_id", user.id)
    .in("status", ["interview", "visit_scheduled"])
    .order("created_at", { ascending: false })
    .limit(5)

  if (error) return { data: [], error: "Erro ao carregar adoções." }

  return { data: (data ?? []) as AdoptionWithDetails[] }
}

/**
 * Atualiza o status de uma adoção.
 */
export async function updateAdoptionStatus(
  adoptionId: string,
  newStatus: AdoptionStatus,
  cancelReason?: string
): Promise<{ success: boolean; error?: string }> {
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { success: false, error: "Não autenticado." }

  const payload: Record<string, unknown> = {
    status:             newStatus,
    updated_by_user_id: user.id,
  }
  if (cancelReason) payload.cancel_reason = cancelReason

  const { error } = await supabase
    .from("adoptions")
    .update(payload)
    .eq("id", adoptionId)

  if (error) return { success: false, error: "Erro ao atualizar status." }
  return { success: true }
}

// ─── Public Pet Listing (Quero Adotar) ─────────────────────────────────────

export interface AvailablePetFilters {
  species?: string
  sex?: string
  size?: string
  search?: string
  sortBy?: "recent" | "nearest"
}

export interface AvailablePet {
  id: string
  name: string
  species: string
  sex: string
  size: string
  breed: string
  age_range: string
  status: string
  city: string | null
  address_state: string | null
  created_at: string
  primary_photo: string | null
}

/**
 * Busca pets disponíveis para adoção de forma pública.
 * Usado pela tela "Quero Adotar" (PF).
 */
export async function fetchAvailablePets(
  filters: AvailablePetFilters = {},
  page = 1,
  pageSize = 12
): Promise<{ data: AvailablePet[]; total: number; error?: string }> {
  let query = supabase
    .from("pets")
    .select(
      `id, name, species, sex, size, breed, age_range, status, city, address_state, created_at,
       pet_photos(file_url, is_primary, sort_order)`,
      { count: "exact" }
    )
    .eq("status", "available")

  if (filters.species && filters.species !== "all") {
    query = query.eq("species", filters.species)
  }
  if (filters.sex && filters.sex !== "all") {
    query = query.eq("sex", filters.sex)
  }
  if (filters.size && filters.size !== "all") {
    query = query.eq("size", filters.size)
  }
  if (filters.search?.trim()) {
    query = query.ilike("name", `%${filters.search.trim()}%`)
  }

  // Ordenação
  query = query.order("created_at", { ascending: false })

  // Paginação
  const from = (page - 1) * pageSize
  query = query.range(from, from + pageSize - 1)

  const { data, error, count } = await query

  if (error) return { data: [], total: 0, error: "Erro ao carregar pets disponíveis." }

  const mapped: AvailablePet[] = (data ?? []).map((p: any) => {
    const photos: any[] = p.pet_photos ?? []
    const primaryPhoto =
      photos.find((ph) => ph.is_primary) ??
      photos.sort((a: any, b: any) => (a.sort_order ?? 99) - (b.sort_order ?? 99))[0] ??
      null
    return {
      id: p.id,
      name: p.name,
      species: p.species,
      sex: p.sex,
      size: p.size,
      breed: p.breed,
      age_range: p.age_range,
      status: p.status,
      city: p.city ?? null,
      address_state: p.address_state ?? null,
      created_at: p.created_at,
      primary_photo: primaryPhoto?.file_url ?? null,
    }
  })

  return { data: mapped, total: count ?? 0 }
}
