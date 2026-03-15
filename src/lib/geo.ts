/**
 * Calculates the distance between two coordinates in kilometers using the Haversine formula.
 */
export function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
    const R = 6371; // Radius of the earth in km
    const dLat = deg2rad(lat2 - lat1);
    const dLon = deg2rad(lon2 - lon1);
    const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) *
        Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const d = R * c; // Distance in km
    return d;
}

function deg2rad(deg: number): number {
    return deg * (Math.PI / 180);
}

export function formatDistance(distanceKm: number): string {
    if (distanceKm < 1) {
        return `${Math.round(distanceKm * 1000)} mt ${distanceKm < 0.05 ? "(Mto. Perto)" : ""}`;
    }
    return `${distanceKm.toFixed(1).replace('.', ',')} km`;
}

/**
 * Retorna logradouro resumido usando cidade, estado e opcionalmente bairro.
 * @example "Bela Vista, São Paulo - SP"
 * @example "Rio de Janeiro - RJ"
 */
export function formatLocationShort(city?: string | null, state?: string | null, neighborhood?: string | null): string {
    const parts = [neighborhood, city].filter(Boolean) as string[];
    let formatted = parts.join(", ");
    if (state) {
        formatted += formatted ? ` - ${state}` : state;
    }
    return formatted || "Localização não informada";
}
