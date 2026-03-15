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
  const { data: updateData, error: updateError } = await supabase
    .from("pets")
    .update(petData)
    .eq("id", petId)
    .select()
    
  if (updateError || !updateData || updateData.length === 0) {
    if (updateError) console.error("updateError", updateError)
    throw new Error("Erro ao salvar dados principais do pet ou pet não encontrado.")
  }

  // 3. Atualizar Fotos (Deleta antigas / Upsert Novas)
  // Como as fotos do bucket vão sobrar, numa app real precisaríamos de limpeza de storage. 
  // Limpamos do banco explicitamente as antigas. Usamos um Upsert (ON CONFLICT) na inserção para evitar 409
  // (Caso o delete anterior não tenha committado a tempo ou o banco trave por causa da unique uq_pet_photos_sort_order)
  
  const { error: deletePhotosError } = await supabase.from("pet_photos").delete().eq("pet_id", petId)
  if (deletePhotosError) throw new Error("Erro ao limpar fotos antigas do pet.")

  const { error: insertPhotosError } = await supabase.from("pet_photos").upsert(
    photos.map(p => ({ 
        pet_id: petId, 
        file_url: p.file_url,
        sort_order: p.sort_order,
        is_primary: p.is_primary 
    })),
    { onConflict: "pet_id,sort_order" }
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
