import { supabase } from "@/integrations/supabase/client";

const MAX_RETRIES = 5;
const INITIAL_SEQUENCE = 1;

export const generateInvoiceNumber = async (shopId: string): Promise<string> => {
  let retryCount = 0;
  
  while (retryCount < MAX_RETRIES) {
    try {
      console.log(`Attempt ${retryCount + 1} to generate invoice number for shop:`, shopId);
      
      // Get the current date
      const now = new Date();
      const year = now.getFullYear().toString().slice(-2);
      const month = (now.getMonth() + 1).toString().padStart(2, '0');
      const day = now.getDate().toString().padStart(2, '0');
      const datePrefix = `${year}${month}${day}`;
      
      console.log("Current date components:", { year, month, day });

      // Get all invoice numbers for today for this specific shop
      const { data: todayInvoices, error: fetchError } = await supabase
        .from('invoices')
        .select('invoice_number')
        .eq('shop_id', shopId)
        .ilike('invoice_number', `INV-${shopId.slice(0, 4)}-${datePrefix}-%`)
        .order('invoice_number', { ascending: false });

      if (fetchError) {
        throw fetchError;
      }

      // Find the highest sequence number
      let maxSequence = 0;
      if (todayInvoices && todayInvoices.length > 0) {
        for (const invoice of todayInvoices) {
          const match = invoice.invoice_number.match(/\d+$/);
          if (match) {
            const sequence = parseInt(match[0]);
            if (sequence > maxSequence) {
              maxSequence = sequence;
            }
          }
        }
      }

      // Generate new sequence number
      const sequence = maxSequence + 1;
      console.log("Generated sequence number:", sequence);

      // Format: INV-SHOP-YYMMDD-XXXX where:
      // SHOP is first 4 chars of shop_id
      // YYMMDD is the date
      // XXXX is a 4-digit sequence number
      const invoiceNumber = `INV-${shopId.slice(0, 4)}-${datePrefix}-${sequence.toString().padStart(4, '0')}`;
      console.log("Generated invoice number:", invoiceNumber);

      // Double-check the invoice number doesn't exist
      const { data: existingInvoice, error: checkError } = await supabase
        .from('invoices')
        .select('id')
        .eq('invoice_number', invoiceNumber)
        .single();

      if (checkError && checkError.code !== 'PGRST116') {
        throw checkError;
      }

      if (existingInvoice) {
        console.log("Invoice number already exists, retrying...");
        retryCount++;
        continue;
      }

      return invoiceNumber;
    } catch (error) {
      console.error(`Error on attempt ${retryCount + 1}:`, error);
      retryCount++;
      
      if (retryCount === MAX_RETRIES) {
        throw new Error('Erreur lors de la génération du numéro de facture après plusieurs tentatives');
      }
    }
  }

  throw new Error('Erreur lors de la génération du numéro de facture');
}; 