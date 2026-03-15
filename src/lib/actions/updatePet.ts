import { supabase } from "@/lib/supabase"

interface UpdatePetPayload {
  petId: string
  name: string
  species: "dog" | "cat" | "bird" | "reptile"
  sex: "male" | "female"
  size: "mini" | "small" | "medium" | "large"
  breed: string
  age_range: "up_to_1_year" | "from_1_to_3_years" | "from_3_to_6_years" | "over_6_years"
  neutered_status: "yes" | "no" | "unknown"
  description?: string
  photos: {
    file_url: string
    sort_order: number
    is_primary: boolean
  }[]
  color_ids: string[]
  trait_ids: string[]
}

export async function updatePet(payload: UpdatePetPayload) {
  const { data: { session } } = await supabase.auth.getSession()
  if (!session) throw new Error("Usuário não autenticado.")

  const { petId, photos, color_ids, trait_ids, ...petData } = payload

  // 1. Verificar permissão usando a mesma lógica (quem criou a ONG ou o usuário se for pessoa física)
  const { data: rpcData, error: rpcError } = await supabase.rpc("resolve_responsible_profile")
  if (rpcError || !rpcData?.responsible_id) {
    throw new Error("Não foi possível verificar as permissões.")
  }

  // Checar se o pet de fato pertence ao responsible_id da sessão
  const { data: currentPet, error: checkError } = await supabase
    .from("pets")
    .select("responsible_profile_id")
    .eq("id", petId)
    .single()

  if (checkError || !currentPet) {
    throw new Error("Pet não encontrado.")
  }
  if (currentPet.responsible_profile_id !== rpcData.responsible_id) {
    throw new Error("Sem permissão para atualizar este pet.")
  }

  // 2. Atualizar tabela `pets`
  const { error: updateError } = await supabase
    .from("pets")
    .update(petData)
    .eq("id", petId)
    .eq("status", "available") // Assuming edits are for available pets typically, but allow it to succeed basically. We'll omit this constraint if they edit adopted ones. 
    // Actually, let's just update by ID.
    
  if (updateError) {
    console.error("updateError", updateError)
    throw new Error("Erro ao salvar dados principais do pet.")
  }

  // 3. Atualizar Fotos (Deleta antigas / Insere Novas)
  // Como as fotos do bucket vão sobrar, numa app real precisaríamos de limpeza de storage. 
  // Por simplicidade: delete todas do banco e re-insere (ou mantemos a URL antiga se passada adiante).
  const { error: deletePhotosError } = await supabase.from("pet_photos").delete().eq("pet_id", petId)
  if (deletePhotosError) throw new Error("Erro ao atualizar fotos do pet.")

  const { error: insertPhotosError } = await supabase.from("pet_photos").insert(
    photos.map(p => ({ pet_id: petId, ...p }))
  )
  if (insertPhotosError) throw new Error("Erro ao salvar as novas fotos do pet.")

  // 4. Atualizar Cores (M-N mapping)
  await supabase.from("pet_color_assignments").delete().eq("pet_id", petId)
  if (color_ids.length > 0) {
    const { error: colorsError } = await supabase.from("pet_color_assignments").insert(
      color_ids.map(id => ({ pet_id: petId, color_id: id }))
    )
    if (colorsError) throw new Error("Erro ao atualizar as cores do pet.")
  }

  // 5. Atualizar Traços (M-N mapping)
  await supabase.from("pet_trait_assignments").delete().eq("pet_id", petId)
  if (trait_ids.length > 0) {
    const { error: traitsError } = await supabase.from("pet_trait_assignments").insert(
      trait_ids.map(id => ({ pet_id: petId, trait_id: id }))
    )
    if (traitsError) throw new Error("Erro ao atualizar os traços de personalidade.")
  }

  return { petId }
}
