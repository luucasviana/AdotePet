export type Species = "dog" | "cat"
export type Size = "small" | "medium" | "large"
export type Gender = "male" | "female"

// Normalization Helpers
export function normalizeText(text: string): string {
    return text.toLowerCase().trim().normalize("NFD").replace(/[\u0300-\u036f]/g, "")
}

// Mapping Display -> Canonical
export function mapSpeciesToCanonical(value: string): Species | "all" {
    const normalized = normalizeText(value)
    if (normalized === "cachorro" || normalized === "dog") return "dog"
    if (normalized === "gato" || normalized === "cat") return "cat"
    return "all"
}

export function mapSizeToCanonical(value: string): Size | "all" {
    const normalized = normalizeText(value)
    if (normalized.includes("pequeno") || normalized === "small") return "small"
    if (normalized.includes("medio") || normalized === "medium") return "medium"
    if (normalized.includes("grande") || normalized === "large") return "large"
    return "all"
}

export function mapGenderToCanonical(value: string): Gender | "all" {
    const normalized = normalizeText(value)
    if (normalized === "macho" || normalized === "male") return "male"
    if (normalized === "femea" || normalized === "female") return "female"
    return "all"
}

// Mapping Canonical -> Display (PT-BR)
export function displaySpecies(value: string): string {
    if (value === "dog") return "Cachorro"
    if (value === "cat") return "Gato"
    return value
}

export function displaySize(value: string): string {
    if (value === "small") return "Pequeno"
    if (value === "medium") return "Médio"
    if (value === "large") return "Grande"
    return value
}

export function displayGender(value: string): string {
    if (value === "male") return "Macho"
    if (value === "female") return "Fêmea"
    return value
}
