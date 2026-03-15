import { useEffect, useState } from "react"
import { AuthPageHeader } from "@/components/layout/AuthPageHeader"
import { OrganizationProfileForm } from "@/components/pj/settings/OrganizationProfileForm"
import { UserProfileForm } from "@/components/pf/settings/UserProfileForm"
import { useProfile } from "@/hooks/useProfile"
import { supabase } from "@/lib/supabase"
import { Loader2 } from "lucide-react"

export function UserProfilePage() {
  const { profile } = useProfile()
  const [loading, setLoading] = useState(true)
  const [orgData, setOrgData] = useState<Record<string, unknown> | null>(null)

  useEffect(() => {
    async function fetchOrg() {
      if (!profile?.id) return

      try {
        const { data, error } = await supabase
          .from("profiles")
          .select("*")
          .eq("id", profile.id)
          .single()

        if (!error && data) {
          setOrgData(data as Record<string, unknown>)
        } else if (error) {
          console.error("Erro ao buscar perfil:", error)
        }
      } catch (err) {
        console.error("Exceção ao buscar perfil:", err)
      } finally {
        setLoading(false)
      }
    }

    fetchOrg()
  }, [profile?.id])

  if (loading) {
    return (
      <div className="flex flex-1 items-center justify-center h-full">
        <Loader2 className="w-8 h-8 animate-spin text-[#3B0270]" />
      </div>
    )
  }

  // Parse to Form Model
  const isPF = profile?.user_type === "PF" || !profile?.user_type

  const orgFormValues = orgData && !isPF
    ? {
        cnpj: (orgData.cnpj as string),
        nomeOrganizacao: (orgData.company_name as string),
        nomeFantasia: (orgData.fantasy_name as string) || "",
        tipoOrganizacao: (orgData.org_type as string),
        email: (orgData.email as string),
        telefone: (orgData.phone as string) || "",
        logoUrl: (orgData.logo_url as string) || "",
        // Address
        cep: (orgData.cep as string) || "",
        addressState: (orgData.address_state as string) || "",
        city: (orgData.city as string) || "",
        neighborhood: (orgData.neighborhood as string) || "",
        street: (orgData.street as string) || "",
        addressNumber: (orgData.address_number as string) || "",
        complement: (orgData.complement as string) || "",
      }
    : undefined

  const pfFormValues = orgData && isPF
    ? {
        fullName: (orgData.full_name as string) || "",
        socialName: (orgData.social_name as string) || "",
        email: (orgData.email as string),
        phone: (orgData.phone as string) || "",
        avatarUrl: (orgData.avatar_url as string) || "",
        // Address
        cep: (orgData.cep as string) || "",
        addressState: (orgData.address_state as string) || "",
        city: (orgData.city as string) || "",
        neighborhood: (orgData.neighborhood as string) || "",
        street: (orgData.street as string) || "",
        addressNumber: (orgData.address_number as string) || "",
        complement: (orgData.complement as string) || "",
      }
    : undefined

  const handleSaveOrgProfile = async (data: Record<string, string>) => {
    if (!orgData) return
    const { error } = await supabase
      .from("profiles")
      .update({
        fantasy_name: data.nomeFantasia,
        phone: data.telefone,
        logo_url: data.logoUrl || null,
        // Address fields
        cep: data.cep?.replace(/\D/g, "") || null,
        address_state: data.addressState || null,
        city: data.city || null,
        neighborhood: data.neighborhood || null,
        street: data.street || null,
        address_number: data.addressNumber || null,
        complement: data.complement || null,
      })
      .eq("id", orgData.id as string)

    if (!error) {
      setOrgData({
        ...orgData,
        fantasy_name: data.nomeFantasia,
        phone: data.telefone,
        logo_url: data.logoUrl || null,
        cep: data.cep?.replace(/\D/g, "") || null,
        address_state: data.addressState || null,
        city: data.city || null,
        neighborhood: data.neighborhood || null,
        street: data.street || null,
        address_number: data.addressNumber || null,
        complement: data.complement || null,
      })
    } else {
      throw error
    }
  }

  const handleSavePFProfile = async (data: Record<string, string>) => {
    if (!orgData) return
    const { error } = await supabase
      .from("profiles")
      .update({
        full_name: data.fullName,
        social_name: data.socialName || null,
        phone: data.phone,
        avatar_url: data.avatarUrl || null,
        // Address fields
        cep: data.cep?.replace(/\D/g, "") || null,
        address_state: data.addressState || null,
        city: data.city || null,
        neighborhood: data.neighborhood || null,
        street: data.street || null,
        address_number: data.addressNumber || null,
        complement: data.complement || null,
      })
      .eq("id", orgData.id as string)

    if (!error) {
      setOrgData({
        ...orgData,
        full_name: data.fullName,
        social_name: data.socialName || null,
        phone: data.phone,
        avatar_url: data.avatarUrl || null,
        cep: data.cep?.replace(/\D/g, "") || null,
        address_state: data.addressState || null,
        city: data.city || null,
        neighborhood: data.neighborhood || null,
        street: data.street || null,
        address_number: data.addressNumber || null,
        complement: data.complement || null,
      })
    } else {
      throw error
    }
  }

  return (
    <div className="flex flex-1 flex-col h-full bg-slate-50/50">
      <AuthPageHeader
        title={isPF ? "Dados do usuário" : "Perfil da organização"}
        subtitle={isPF ? "Gerencie suas informações pessoais e de contato." : "Gerencie as informações públicas e de contato da sua organização."}
      />

      <div className="flex flex-1 flex-col p-6 md:p-8 overflow-y-auto">
        <div className="flex flex-col flex-1 max-w-[1000px] w-full mx-auto">
          {orgData ? (
            isPF ? (
              <UserProfileForm
                userId={profile!.id}
                initialData={pfFormValues}
                onSave={handleSavePFProfile}
              />
            ) : (
              <OrganizationProfileForm
                userId={profile!.id}
                initialData={orgFormValues}
                onSave={handleSaveOrgProfile}
              />
            )
          ) : (
            <div className="p-8 text-center bg-white rounded-2xl border border-border">
              <p className="text-muted-foreground font-sans">Perfil não encontrado para esta conta.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
