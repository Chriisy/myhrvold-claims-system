import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.50.2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface ScannedInvoiceData {
  invoiceNumber: string;
  customerName: string;
  customerOrgNumber: string;
  productName: string;
  productModel: string;
  laborCost: number;
  partsCost: number;
  totalAmount: number;
  evaticJobNumber?: string;
  invoiceDate: string;
  confidence: number;
}

// Norwegian Visma invoice patterns
const vismaPatterns = {
  invoiceNumber: /(?:Faktura\s*nr\.?|Invoice\s*no\.?)\s*[:.]?\s*(\d+)/i,
  customerOrg: /(?:Org\.?\s*nr\.?|Org\.?\s*no\.?)\s*[:.]?\s*([\d\s]+)/i,
  amount: /(?:Sum|Total|Totalt?)\s*[:.]?\s*(?:kr\.?|NOK)?\s*([\d\s,.]+)/i,
  laborLine: /(?:Timer?|Arbeid|Labour?)\s*[:.]?\s*(?:kr\.?|NOK)?\s*([\d\s,.]+)/i,
  partsLine: /(?:Deler?|Parts?|Reservedeler?)\s*[:.]?\s*(?:kr\.?|NOK)?\s*([\d\s,.]+)/i,
  evaticJob: /(?:Jobb\s*nr\.?|Job\s*no\.?|Evatic)\s*[:.]?\s*([A-Z0-9\-]+)/i,
  customerName: /(?:Kunde|Customer|Kundenavn)\s*[:.]?\s*([A-ZÆØÅa-zæøå\s\-\.]+)/i,
  productName: /(?:Produkt|Product|Artikkel)\s*[:.]?\s*([A-ZÆØÅa-zæøå0-9\s\-\.]+)/i,
  date: /(?:Dato|Date)\s*[:.]?\s*(\d{1,2}[.\-\/]\d{1,2}[.\-\/]\d{2,4})/i,
};

function parseVismaInvoice(text: string): ScannedInvoiceData {
  console.log('Parsing invoice text:', text.substring(0, 200) + '...');
  
  const extractValue = (pattern: RegExp, defaultValue: any = '') => {
    const match = text.match(pattern);
    return match ? match[1].trim() : defaultValue;
  };

  const parseAmount = (amountStr: string): number => {
    if (!amountStr) return 0;
    // Remove spaces, replace comma with dot for decimal
    const cleaned = amountStr.replace(/\s/g, '').replace(',', '.');
    const parsed = parseFloat(cleaned);
    return isNaN(parsed) ? 0 : parsed;
  };

  const invoiceNumber = extractValue(vismaPatterns.invoiceNumber);
  const customerName = extractValue(vismaPatterns.customerName);
  const customerOrgNumber = extractValue(vismaPatterns.customerOrg);
  const productName = extractValue(vismaPatterns.productName);
  const laborCostStr = extractValue(vismaPatterns.laborLine);
  const partsCostStr = extractValue(vismaPatterns.partsLine);
  const totalAmountStr = extractValue(vismaPatterns.amount);
  const evaticJobNumber = extractValue(vismaPatterns.evaticJob);
  const invoiceDate = extractValue(vismaPatterns.date);

  const laborCost = parseAmount(laborCostStr);
  const partsCost = parseAmount(partsCostStr);
  const totalAmount = parseAmount(totalAmountStr);

  // Calculate confidence based on how many fields we found
  const foundFields = [invoiceNumber, customerName, totalAmountStr].filter(Boolean).length;
  const confidence = Math.min(foundFields / 3, 1);

  return {
    invoiceNumber,
    customerName,
    customerOrgNumber,
    productName,
    productModel: '', // Will be extracted separately if needed
    laborCost,
    partsCost,
    totalAmount,
    evaticJobNumber,
    invoiceDate,
    confidence
  };
}

async function processOCRWithVision(imageBase64: string): Promise<string> {
  const apiKey = Deno.env.get('GOOGLE_CLOUD_API_KEY');
  if (!apiKey) {
    throw new Error('Google Cloud API key not configured');
  }

  const url = `https://vision.googleapis.com/v1/images:annotate?key=${apiKey}`;
  
  const requestBody = {
    requests: [{
      image: {
        content: imageBase64
      },
      features: [{
        type: 'TEXT_DETECTION',
        maxResults: 1
      }],
      imageContext: {
        languageHints: ['no', 'en']
      }
    }]
  };

  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(requestBody)
  });

  if (!response.ok) {
    const error = await response.text();
    console.error('Google Vision API error:', error);
    throw new Error(`Google Vision API error: ${response.status}`);
  }

  const result = await response.json();
  
  if (result.responses?.[0]?.error) {
    throw new Error(`Vision API error: ${result.responses[0].error.message}`);
  }

  return result.responses?.[0]?.fullTextAnnotation?.text || '';
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { imageBase64, userId, claimId } = await req.json();
    
    if (!imageBase64) {
      return new Response(
        JSON.stringify({ error: 'No image provided' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
      );
    }

    const startTime = Date.now();
    
    // Process OCR with Google Vision
    console.log('Starting OCR processing...');
    const extractedText = await processOCRWithVision(imageBase64);
    
    // Parse the extracted text
    const parsedData = parseVismaInvoice(extractedText);
    const processingTime = Date.now() - startTime;

    console.log('OCR completed:', {
      confidence: parsedData.confidence,
      processingTime,
      extractedFields: Object.keys(parsedData).filter(key => parsedData[key as keyof ScannedInvoiceData])
    });

    // Track OCR usage
    if (userId) {
      const supabase = createClient(
        Deno.env.get('SUPABASE_URL') ?? '',
        Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
      );

      await supabase.from('ocr_analytics').insert({
        user_id: userId,
        claim_id: claimId,
        success: parsedData.confidence > 0.3,
        confidence_score: parsedData.confidence,
        processing_time_ms: processingTime,
        fields_extracted: parsedData
      });
    }

    return new Response(
      JSON.stringify({
        success: true,
        data: parsedData,
        rawText: extractedText.substring(0, 500), // First 500 chars for debugging
        processingTime
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error: any) {
    console.error('OCR processing error:', error);
    
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message || 'OCR processing failed',
        fallback: true
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    );
  }
});