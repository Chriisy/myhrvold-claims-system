import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const OPENAI_API_KEY = Deno.env.get('OPENAI_API_KEY');

// Fast detection for Myhrvold invoices from base64 image
function isMyhrvoldInternal(imageBase64: string): boolean {
  // Simple heuristic: decode part of the base64 to check if it's likely a Myhrvold invoice
  // This is a placeholder - in practice you'd need OCR or other detection
  try {
    const decoded = atob(imageBase64.substring(0, 1000));
    return decoded.includes('T.MYHRVOLD') || decoded.includes('MYHRVOLD AS');
  } catch {
    return false;
  }
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log('OpenAI Vision OCR request started');
    
    if (!OPENAI_API_KEY) {
      console.error('OPENAI_API_KEY is not configured');
      throw new Error('OPENAI_API_KEY is not configured');
    }

    console.log('Parsing request body...');
    const { imageBase64 } = await req.json();
    
    if (!imageBase64) {
      console.error('No image data provided');
      throw new Error('No image data provided');
    }
    
    console.log('Image data received, length:', imageBase64.length);

    // Prepare the enhanced prompt for Norwegian T. Myhrvold invoices
    const prompt = `
Du er ekspert på å analysere norske T. Myhrvold fakturaer. Analyser dette bildet nøye og trekk ut følgende informasjon. 

VIKTIG: Returner kun gyldig JSON uten ekstra tekst eller formatering:

{
  "invoiceNumber": "7-8 siffer fakturanummer (finn nummer nærmest 'Faktura' eller øverst)",
  "invoiceDate": "fakturadato i DD.MM.YYYY format",
  "customerName": "T. Myhrvold AS (alltid dette for T. Myhrvold fakturaer)",
  "customerNumber": "kundenummer hvis synlig",
  "customerOrgNumber": "organisasjonsnummer (9 siffer) hvis synlig",
  "productName": "produktnavn fra 'Oppdrag:' linjen eller første produktlinje",
  "serviceNumber": "service nr hvis synlig",
  "projectNumber": "prosjekt nr hvis synlig",
  "technician": "tekniker/montør navn hvis synlig",
  "technicianHours": "antall timer for 'T1' eller 'Time service' (kun tall)",
  "hourlyRate": "timesats/pris per time for T1 (kun tall)",
  "workCost": "total arbeidskostnad for T1/timer (kun tall)",
  "travelTimeHours": "reisetimer hvis synlig (kun tall)",
  "travelTimeCost": "reisekostnad hvis synlig (kun tall)",
  "vehicleKm": "kjøretøy km hvis synlig (kun tall)",
  "vehicleCost": "kjøretøy kostnad hvis synlig (kun tall)",
  "partsCost": "sum av alle deler/materialer som IKKE er T1/RT1/KM (kun tall)",
  "totalAmount": "totalbeløp/ordresum nederst på fakturaen (kun tall)",
  "confidence": "din konfidens 0-100 basert på hvor klart teksten er"
}

KRITISKE REGLER:
- Alle tall skal være rene tall uten 'kr', mellomrom eller komma som tusenskilletegn
- Bruk punktum som desimalskilletegn (eks: 1234.50)
- Hvis felt ikke finnes, bruk null
- Totalbeløp er vanligvis nederst på fakturaen som "Ordresum" eller "Sum eks mva"
- T1 = timeservice/arbeid, andre koder = deler/materialer
- Vær spesielt nøye med totalbeløp og arbeidskostnader`;

    console.log('Calling OpenAI Vision API...');
    // Call OpenAI Vision API with JSON response format
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${OPENAI_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o',
        response_format: { type: 'json_object' }, // 🎯 KRITISK FIX - tvinger ren JSON
        messages: [
          {
            role: 'user',
            content: [
              { 
                type: 'text', 
                text: `Return ONLY valid JSON with Norwegian T. Myhrvold invoice data:
{
  "invoiceNumber": "7-8 digit number",
  "invoiceDate": "DD.MM.YYYY", 
  "customerName": "T. Myhrvold AS",
  "customerNumber": "customer number if visible",
  "customerOrgNumber": "9 digit org number if visible",
  "productName": "product from Oppdrag line",
  "serviceNumber": "service nr if visible", 
  "projectNumber": "prosjekt nr if visible",
  "technician": "technician name if visible",
  "technicianHours": 0,
  "hourlyRate": 0,
  "workCost": 0,
  "travelTimeHours": 0,
  "travelTimeCost": 0,
  "vehicleKm": 0,
  "vehicleCost": 0,
  "partsCost": 0,
  "totalAmount": 0,
  "confidence": 85
}

CRITICAL CLASSIFICATION RULES:
- workCost = ONLY lines with code "T1" (labor/service hours)
- partsCost = ALL other lines EXCEPT T1, RT1, KM (materials/parts)
- travelTimeCost = lines with "RT1" code (travel time)
- vehicleCost = lines with "KM" code (vehicle/mileage)
- totalAmount = "Ordresum" or bottom total on invoice

All numbers as pure numbers without currency or spaces. Use null for missing fields.`
              },
              {
                type: 'image_url',
                image_url: {
                  url: `data:image/jpeg;base64,${imageBase64}`,
                  detail: 'high'
                }
              }
            ]
          }
        ],
        max_tokens: 1000,
        temperature: 0
      })
    });

    console.log('OpenAI response status:', response.status);

    if (!response.ok) {
      const error = await response.text();
      console.error('OpenAI API error:', error);
      throw new Error(`OpenAI API error (${response.status}): ${error}`);
    }

    console.log('Parsing OpenAI response...');
    const result = await response.json();
    const extractedText = result.choices[0].message.content;
    console.log('OpenAI extracted text:', extractedText.substring(0, 200) + '...');

    // Parse JSON response (response_format garanterer ren JSON)
    console.log('Parsing JSON from OpenAI response...');
    let extractedData;
    try {
      extractedData = JSON.parse(extractedText); // Ren JSON nå - ingen markdown!
      console.log('Successfully parsed JSON:', extractedData);
    } catch (e) {
      console.error('JSON parsing failed:', e);
      console.error('Raw OpenAI response:', extractedText);
      throw new Error(`Failed to parse OpenAI response as JSON: ${e.message}`);
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        data: extractedData,
        rawText: extractedText 
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );

  } catch (error) {
    console.error('Error in openai-vision-ocr:', error);
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error.message 
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});