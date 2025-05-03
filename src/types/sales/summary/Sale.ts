export interface Sale {
    id: number;
    local_id?: number; // ID réel stocké en base de données
    date: string;
    object: string;
    quantity: number;
    price: number;
    stock: string;
}