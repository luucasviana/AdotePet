import { supabase } from "@/lib/supabase"

// ─── Tipos de entrada ───────────────────────────────────────────────────────

export interface PetPhotoInput {
  /** URL pública do arquivo já enviado ao Storage */
  file_url: string
  sort_order: number
  is_primary: boolean
}

export interface RegisterPetInput {
  name: string
  species: "dog" | "cat" | "bird" | "reptile"
  sex: "male" | "female"
  size: "mini" | "small" | "medium" | "large"
  breed: string
  age_range:
    | "up_to_1_year"
    | "from_1_to_3_years"
    | "from_3_to_6_years"
    | "over_6_years"
  neutered_status: "yes" | "no" | "unknown"
  description?: string

  /** Mínimo 3, máximo 5 fotos. Exatamente 1 com is_primary = true. */
  photos: PetPhotoInput[]

  /** Mínimo 1 cor. IDs da tabela public.pet_colors. */
  color_ids: string[]

  /** Mínimo 1, máximo 6 traits. IDs da tabela public.pet_traits. */
  trait_ids: string[]
}

// ─── Tipos de saída ──────────────────────────────────────────────────────────

export interface PetColor {
  id: string
  key: string
  label: string
  hex: string
}

export interface PetTrait {
  id: string
  key: string
  label: string
}

export interface PetPhoto {
  id: string
  file_url: string
  sort_order: number
  is_primary: boolean
}

export interface ResponsibleProfile {
  id: string
  user_type: string
  company_name: string | null
  fantasy_name: string | null
  email: string | null
}

export interface RegisteredPet {
  id: string
  created_by_profile_id: string
  responsible_profile_id: string
  name: string
  species: string
  sex: string
  size: string
  breed: string
  age_range: string
  neutered_status: string
  description: string | null
  status: string
  // Snapshot de endereço
  cep: string | null
  address_state: string | null
  city: string | null
  neighborhood: string | null
  street: string | null
  address_number: string | null
  complement: string | null
  created_at: string
  updated_at: string
  // Relações
  photos: PetPhoto[]
  primary_photo: PetPhoto | null
  colors: PetColor[]
  traits: PetTrait[]
  responsible: ResponsibleProfile
}

export interface RegisterPetResult {
  pet: RegisteredPet
}

// ─── Erros customizados ────────────────────────────────────────────────────

export class PetValidationError extends Error {
  constructor(message: string) {
    super(message)
    this.name = "PetValidationError"
  }
}

export class PetAuthError extends Error {
  constructor(message: string) {
    super(message)
    this.name = "PetAuthError"
  }
}

// ─── Constantes de validação ───────────────────────────────────────────────

const VALID_SPECIES = ["dog", "cat", "bird", "reptile"] as const
const VALID_SEX = ["male", "female"] as const
const VALID_SIZE = ["mini", "small", "medium", "large"] as const
const VALID_AGE_RANGE = [
  "up_to_1_year",
  "from_1_to_3_years",
  "from_3_to_6_years",
  "over_6_years",
] as const
const VALID_NEUTERED_STATUS = ["yes", "no", "unknown"] as const

// ─── Validação do payload ─────────────────────────────────────────────────

function validateInput(input: RegisterPetInput): void {
  if (!input.name || input.name.trim().length === 0) {
    throw new PetValidationError("O nome do pet é obrigatório.")
  }
  if (!VALID_SPECIES.includes(input.species as never)) {
    throw new PetValidationError(`Espécie inválida: ${input.species}. Use: dog, cat, bird ou reptile.`)
  }
  if (!VALID_SEX.includes(input.sex as never)) {
    throw new PetValidationError(`Sexo inválido: ${input.sex}. Use 'male' ou 'female'.`)
  }
  if (!VALID_SIZE.includes(input.size as never)) {
    throw new PetValidationError(`Porte inválido: ${input.size}.`)
  }
  if (!input.breed || input.breed.trim().length === 0) {
    throw new PetValidationError("A raça é obrigatória. Informe SRD se não souber.")
  }
  if (!VALID_AGE_RANGE.includes(input.age_range as never)) {
    throw new PetValidationError(`Faixa etária inválida: ${input.age_range}.`)
  }
  if (!VALID_NEUTERED_STATUS.includes(input.neutered_status as never)) {
    throw new PetValidationError(`Status de castração inválido: ${input.neutered_status}.`)
  }

  // Fotos
  if (!input.photos || input.photos.length < 3) {
    throw new PetValidationError("São necessárias no mínimo 3 fotos.")
  }
  if (input.photos.length > 5) {
    throw new PetValidationError("São permitidas no máximo 5 fotos.")
  }
  const primaryPhotos = input.photos.filter((p) => p.is_primary)
  if (primaryPhotos.length !== 1) {
    throw new PetValidationError("Deve haver exatamente 1 foto principal (is_primary = true).")
  }
  for (const photo of input.photos) {
    if (!photo.file_url || photo.file_url.trim().length === 0) {
      throw new PetValidationError("Todas as fotos devem ter uma URL válida.")
    }
  }

  // Cores
  if (!input.color_ids || input.color_ids.length === 0) {
    throw new PetValidationError("Selecione pelo menos 1 cor.")
  }
  const uniqueColors = new Set(input.color_ids)
  if (uniqueColors.size !== input.color_ids.length) {
    throw new PetValidationError("Cores duplicadas não são permitidas.")
  }

  // Traits
  if (!input.trait_ids || input.trait_ids.length === 0) {
    throw new PetValidationError("Selecione pelo menos 1 traço de personalidade.")
  }
  if (input.trait_ids.length > 6) {
    throw new PetValidationError("São permitidos no máximo 6 traços de personalidade.")
  }
  const uniqueTraits = new Set(input.trait_ids)
  if (uniqueTraits.size !== input.trait_ids.length) {
    throw new PetValidationError("Traços duplicados não são permitidos.")
  }
}

// ─── Action principal ──────────────────────────────────────────────────────

/**
 * Cadastra um pet de forma transacional aplicando a regra de responsabilidade:
 *
 * - PF independente → `responsible_profile_id = created_by_profile_id`
 * - PF vinculada a uma PJ via `team_members` → `responsible_profile_id = pj_id`
 * - A própria PJ → `responsible_profile_id = created_by_profile_id`
 *
 * O endereço salvo no pet é um snapshot copiado do perfil responsável.
 */
export async function registerPet(input: RegisterPetInput): Promise<RegisterPetResult> {
  // ── 1. Validar o payload antes de qualquer chamada à rede ────────────────
  validateInput(input)

  // ── 2. Chamar RPC para resolver o perfil responsável ─────────────────────────
  const { data: responsibleData, error: resolveError } = await supabase
    .rpc("resolve_responsible_profile")

  if (resolveError || !responsibleData) {
    console.error("RPC resolve_responsible_profile error:", resolveError)
    throw new PetAuthError(
      resolveError?.message || "Não foi possível resolver o perfil responsável."
    )
  }

  const createdByProfileId = responsibleData.creator_id
  const responsibleProfileId = responsibleData.responsible_id
  const responsibleProfile = responsibleData


  // ── 6. Criar o registro principal em public.pets ──────────────────────────
  const { data: pet, error: petError } = await supabase
    .from("pets")
    .insert({
      created_by_profile_id: createdByProfileId,
      responsible_profile_id: responsibleProfileId,
      name: input.name.trim(),
      species: input.species,
      sex: input.sex,
      size: input.size,
      breed: input.breed.trim(),
      age_range: input.age_range,
      neutered_status: input.neutered_status,
      description: input.description?.trim() ?? null,
      status: "available",
      // Snapshot do endereço
      cep: responsibleProfile.cep ?? null,
      address_state: responsibleProfile.address_state ?? null,
      city: responsibleProfile.city ?? null,
      neighborhood: responsibleProfile.neighborhood ?? null,
      street: responsibleProfile.street ?? null,
      address_number: responsibleProfile.address_number ?? null,
      complement: responsibleProfile.complement ?? null,
    })
    .select("*")
    .single()

  if (petError || !pet) {
    throw new Error(`Erro ao criar pet: ${petError?.message ?? "desconhecido"}`)
  }

  const petId: string = pet.id

  // ── 7. Inserir fotos ──────────────────────────────────────────────────────
  const photosPayload = input.photos.map((p) => ({
    pet_id: petId,
    file_url: p.file_url,
    sort_order: p.sort_order,
    is_primary: p.is_primary,
  }))

  const { data: insertedPhotos, error: photosError } = await supabase
    .from("pet_photos")
    .insert(photosPayload)
    .select("id, file_url, sort_order, is_primary")

  if (photosError) {
    throw new Error(`Erro ao salvar fotos: ${photosError.message}`)
  }

  // ── 8. Inserir vínculos de cor ─────────────────────────────────────────────
  const colorsPayload = input.color_ids.map((colorId) => ({
    pet_id: petId,
    color_id: colorId,
  }))

  const { data: insertedColorAssignments, error: colorsError } = await supabase
    .from("pet_color_assignments")
    .insert(colorsPayload)
    .select("color_id")

  if (colorsError) {
    throw new Error(`Erro ao salvar cores: ${colorsError.message}`)
  }

  // ── 9. Inserir vínculos de trait ───────────────────────────────────────────
  const traitsPayload = input.trait_ids.map((traitId) => ({
    pet_id: petId,
    trait_id: traitId,
  }))

  const { data: insertedTraitAssignments, error: traitsError } = await supabase
    .from("pet_trait_assignments")
    .insert(traitsPayload)
    .select("trait_id")

  if (traitsError) {
    throw new Error(`Erro ao salvar traços: ${traitsError.message}`)
  }

  // ── 10. Buscar detalhes das cores (para retorno enriquecido) ───────────────
  const colorIds = insertedColorAssignments?.map((a) => a.color_id) ?? []
  const { data: colorsData } = await supabase
    .from("pet_colors")
    .select("id, key, label, hex")
    .in("id", colorIds)

  // ── 11. Buscar detalhes dos traits ─────────────────────────────────────────
  const traitIds = insertedTraitAssignments?.map((a) => a.trait_id) ?? []
  const { data: traitsData } = await supabase
    .from("pet_traits")
    .select("id, key, label")
    .in("id", traitIds)

  // ── 12. Criar evento pet_created ───────────────────────────────────────────
  await supabase.from("pet_events").insert({
    pet_id: petId,
    event_type: "pet_created",
    actor_profile_id: createdByProfileId,
    metadata: {
      pet_name: pet.name,
      responsible_profile_id: responsibleProfileId,
    },
  })

  // ── 13. Montar e retornar o resultado ──────────────────────────────────────
  const photos: PetPhoto[] = insertedPhotos ?? []
  const primaryPhoto = photos.find((p) => p.is_primary) ?? null

  const registeredPet: RegisteredPet = {
    id: pet.id,
    created_by_profile_id: pet.created_by_profile_id,
    responsible_profile_id: pet.responsible_profile_id,
    name: pet.name,
    species: pet.species,
    sex: pet.sex,
    size: pet.size,
    breed: pet.breed,
    age_range: pet.age_range,
    neutered_status: pet.neutered_status,
    description: pet.description ?? null,
    status: pet.status,
    cep: pet.cep ?? null,
    address_state: pet.address_state ?? null,
    city: pet.city ?? null,
    neighborhood: pet.neighborhood ?? null,
    street: pet.street ?? null,
    address_number: pet.address_number ?? null,
    complement: pet.complement ?? null,
    created_at: pet.created_at,
    updated_at: pet.updated_at,
    photos,
    primary_photo: primaryPhoto,
    colors: (colorsData ?? []) as PetColor[],
    traits: (traitsData ?? []) as PetTrait[],
    responsible: {
      id: responsibleProfile.responsible_id,
      user_type: responsibleProfile.user_type,
      company_name: responsibleProfile.company_name ?? null,
      fantasy_name: responsibleProfile.fantasy_name ?? null,
      email: responsibleProfile.email ?? null,
    },
  }

  return { pet: registeredPet }
}
