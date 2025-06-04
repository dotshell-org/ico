import { createWorker } from 'tesseract.js';

interface ReceiptData {
    date?: string;
    total?: number;
    merchant?: string;
    items?: Array<{
        description: string;
        price: number;
    }>;
    tva?: Array<{
        taux: number;
        montant: number;
    }>;
}

async function scanReceipt(imagePath: string): Promise<ReceiptData> {
    try {
        // Initialize Tesseract with French language
        const worker = await createWorker('fra');

        // Extract text from image
        const { data: { text } } = await worker.recognize(imagePath);

        // Terminate Tesseract worker
        await worker.terminate();

        // Initialize return object
        const receiptData: ReceiptData = {};

        // Analyze text line by line
        const lines = text.split('\n');

        // Regular expression to find date (common formats in France)
        const dateRegex = /(\d{2}[/.]\d{2}[/.]\d{2,4})|(\d{2}[-]\d{2}[-]\d{2,4})/;

        // Regular expression to find total
        const totalRegex = /total.*?(\d+[.,]\d{2})/i;

        // Regular expression to find VAT amounts
        const tvaRegex = /tva.*?(\d+[.,]\d{1,2}).*?(%)/i;

        // Search for date
        for (const line of lines) {
            const dateMatch = line.match(dateRegex);
            if (dateMatch) {
                receiptData.date = dateMatch[0];
                break;
            }
        }

        // Search for total
        for (const line of lines) {
            const totalMatch = line.match(totalRegex);
            if (totalMatch) {
                receiptData.total = parseFloat(totalMatch[1].replace(',', '.'));
                break;
            }
        }

        // Search for merchant name (usually in first lines)
        receiptData.merchant = lines[0].trim();

        // Search for VAT rates
        receiptData.tva = [];
        for (const line of lines) {
            const tvaMatch = line.match(tvaRegex);
            if (tvaMatch) {
                receiptData.tva.push({
                    taux: parseFloat(tvaMatch[1].replace(',', '.')),
                    montant: parseFloat(tvaMatch[2].replace(',', '.'))
                });
            }
        }

        // Try to find items
        receiptData.items = [];
        for (const line of lines) {
            // Search for lines containing a price
            const priceMatch = line.match(/(\d+[.,]\d{2})\s*€?\s*$/);
            if (priceMatch) {
                const price = parseFloat(priceMatch[1].replace(',', '.'));
                const description = line.replace(priceMatch[0], '').trim();

                if (description && price) {
                    receiptData.items.push({
                        description,
                        price
                    });
                }
            }
        }

        return receiptData;

    } catch (error) {
        console.error('Error while analyzing receipt:', error);
        throw new Error('Receipt analysis failed');
    }
}

export async function processReceipt(imagePath: string): Promise<ReceiptData> {
    try {
        const result = await scanReceipt(imagePath);
        return result;
    } catch (error) {
        console.error('Error:', error);
        throw error;
    }
}