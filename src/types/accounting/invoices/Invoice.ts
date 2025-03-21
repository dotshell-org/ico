export interface Invoice {
    id: number;
    title: string;
    category: string;
    issueDate: string;
    saleServiceDate: string;
    countryCode: number;
    totalAmount: number;
}