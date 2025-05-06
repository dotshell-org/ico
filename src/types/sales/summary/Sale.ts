export interface Sale {
    id: number;
    local_id?: number;
    date: string;
    object: string;
    quantity: number;
    movement: number;
    price: number;
    stock: string;
}