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
        // Initialiser Tesseract avec le français
        const worker = await createWorker('fra');

        // Extraire le texte de l'image
        const { data: { text } } = await worker.recognize(imagePath);

        // Terminer le worker Tesseract
        await worker.terminate();

        // Initialiser l'objet de retour
        const receiptData: ReceiptData = {};

        // Analyser le texte ligne par ligne
        const lines = text.split('\n');

        // Expression régulière pour trouver la date (formats communs en France)
        const dateRegex = /(\d{2}[/.]\d{2}[/.]\d{2,4})|(\d{2}[-]\d{2}[-]\d{2,4})/;

        // Expression régulière pour trouver le total
        const totalRegex = /total.*?(\d+[.,]\d{2})/i;

        // Expression régulière pour trouver les montants TVA
        const tvaRegex = /tva.*?(\d+[.,]\d{1,2}).*?(%)/i;

        // Chercher la date
        for (const line of lines) {
            const dateMatch = line.match(dateRegex);
            if (dateMatch) {
                receiptData.date = dateMatch[0];
                break;
            }
        }

        // Chercher le total
        for (const line of lines) {
            const totalMatch = line.match(totalRegex);
            if (totalMatch) {
                receiptData.total = parseFloat(totalMatch[1].replace(',', '.'));
                break;
            }
        }

        // Chercher le nom du commerçant (généralement dans les premières lignes)
        receiptData.merchant = lines[0].trim();

        // Chercher les taux de TVA
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

        // Essayer de trouver les articles
        receiptData.items = [];
        for (const line of lines) {
            // Chercher les lignes qui contiennent un prix
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
        console.error('Erreur lors de l\'analyse de la facture:', error);
        throw new Error('Échec de l\'analyse de la facture');
    }
}

export async function processReceipt(imagePath: string): Promise<ReceiptData> {
    try {
        const result = await scanReceipt(imagePath);
        console.log('Données extraites:', JSON.stringify(result, null, 2));
        return result;
    } catch (error) {
        console.error('Erreur:', error);
        throw error;
    }
}