export type Species = "Cachorro" | "Gato";
export type Size = "Pequeno" | "Médio" | "Grande";
export type Gender = "Macho" | "Fêmea";

export interface Pet {
    id: string;
    name: string;
    species: Species;
    breed: string;
    size: Size;
    color: string;
    gender: Gender;
    city: string;
    state: string;
    lat: number;
    lon: number;
    photoUrl: string;
    badges: string[];
    createdAt: string; // ISO Display
}

export const PETS: Pet[] = [
    {
        id: "1",
        name: "Thor",
        species: "Cachorro",
        breed: "Vira-lata",
        size: "Médio",
        color: "Preto",
        gender: "Macho",
        city: "São Paulo",
        state: "SP",
        lat: -23.5505,
        lon: -46.6333,
        photoUrl: "https://images.unsplash.com/photo-1543466835-00a7907e9de1?q=80&w=1000&auto=format&fit=crop",
        badges: ["Novo", "Vacinado"],
        createdAt: "2024-03-10T10:00:00Z",
    },
    {
        id: "2",
        name: "Luna",
        species: "Gato",
        breed: "Siamês",
        size: "Pequeno",
        color: "Branco e Marrom",
        gender: "Fêmea",
        city: "Rio de Janeiro",
        state: "RJ",
        lat: -22.9068,
        lon: -43.1729,
        photoUrl: "https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?q=80&w=1000&auto=format&fit=crop",
        badges: ["Castrado"],
        createdAt: "2024-03-08T14:30:00Z",
    },
    {
        id: "3",
        name: "Bob",
        species: "Cachorro",
        breed: "Golden Retriever",
        size: "Grande",
        color: "Dourado",
        gender: "Macho",
        city: "Belo Horizonte",
        state: "MG",
        lat: -19.9167,
        lon: -43.9345,
        photoUrl: "https://images.unsplash.com/photo-1552053831-71594a27632d?q=80&w=1000&auto=format&fit=crop",
        badges: ["Vacinado", "Amigo de crianças"],
        createdAt: "2024-03-05T09:15:00Z",
    },
    {
        id: "4",
        name: "Mel",
        species: "Cachorro",
        breed: "Poodle",
        size: "Pequeno",
        color: "Branco",
        gender: "Fêmea",
        city: "Curitiba",
        state: "PR",
        lat: -25.4244,
        lon: -49.2654,
        photoUrl: "https://images.unsplash.com/photo-1583511655857-d19b40a7a54e?q=80&w=1000&auto=format&fit=crop",
        badges: [],
        createdAt: "2024-03-01T11:20:00Z",
    },
    {
        id: "5",
        name: "Simba",
        species: "Gato",
        breed: "Persa",
        size: "Médio",
        color: "Cinza",
        gender: "Macho",
        city: "São Paulo",
        state: "SP",
        lat: -23.5505,
        lon: -46.6333,
        photoUrl: "https://images.unsplash.com/photo-1513360371669-4adf3dd7dff8?q=80&w=1000&auto=format&fit=crop",
        badges: ["Novo"],
        createdAt: "2024-03-12T08:00:00Z",
    },
    {
        id: "6",
        name: "Kyra",
        species: "Cachorro",
        breed: "Husky",
        size: "Grande",
        color: "Preto e Branco",
        gender: "Fêmea",
        city: "Porto Alegre",
        state: "RS",
        lat: -30.0346,
        lon: -51.2177,
        photoUrl: "https://images.unsplash.com/photo-1588126743936-cb5671c6d379?q=80&w=1000&auto=format&fit=crop",
        badges: ["Vacinado", "Castrado"],
        createdAt: "2024-02-28T16:45:00Z",
    },
    {
        id: "7",
        name: "Floquinho",
        species: "Cachorro",
        breed: "Maltês",
        size: "Pequeno",
        color: "Branco",
        gender: "Macho",
        city: "Salvador",
        state: "BA",
        lat: -12.9777,
        lon: -38.5016,
        photoUrl: "https://images.unsplash.com/photo-1505628346881-b72e27f84500?q=80&w=1000&auto=format&fit=crop",
        badges: ["Apartamento"],
        createdAt: "2024-03-11T13:00:00Z",
    },
    {
        id: "8",
        name: "Nala",
        species: "Gato",
        breed: "Vira-lata",
        size: "Pequeno",
        color: "Laranja",
        gender: "Fêmea",
        city: "Recife",
        state: "PE",
        lat: -8.0476,
        lon: -34.8770,
        photoUrl: "https://images.unsplash.com/photo-1526336024174-e58f5cdd8e13?q=80&w=1000&auto=format&fit=crop",
        badges: ["Vacinado"],
        createdAt: "2024-03-09T10:10:00Z",
    }
];
