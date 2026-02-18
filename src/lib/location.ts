export const FALLBACK_CITIES: Record<string, { lat: number; lon: number }> = {
    "SÃO PAULO": { lat: -23.5505, lon: -46.6333 },
    "RIO DE JANEIRO": { lat: -22.9068, lon: -43.1729 },
    "BELO HORIZONTE": { lat: -19.9167, lon: -43.9345 },
    "CURITIBA": { lat: -25.4244, lon: -49.2654 },
    "PORTO ALEGRE": { lat: -30.0346, lon: -51.2177 },
    "SALVADOR": { lat: -12.9777, lon: -38.5016 },
    "RECIFE": { lat: -8.0476, lon: -34.8770 },
    "BRASÍLIA": { lat: -15.7975, lon: -47.8919 },
    "FORTALEZA": { lat: -3.7172, lon: -38.5434 },
    "MANAUS": { lat: -3.1190, lon: -60.0217 },
    "GOIÂNIA": { lat: -16.6869, lon: -49.2648 },
};

export function normalizeCityName(city: string): string {
    return city.trim().toUpperCase();
}

export function getCoordinatesForCity(city: string) {
    return FALLBACK_CITIES[normalizeCityName(city)] || null;
}
