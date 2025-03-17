export interface Invoice {
    id: number;
    title: string;
    category: string;
    issueDate: string;
    saleServiceDate: string;
    countryCode: string;
    totalAmount: number;
}