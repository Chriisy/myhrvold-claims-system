import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const OPENAI_API_KEY = Deno.env.get('OPENAI_API_KEY');

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    if (!OPENAI_API_KEY) {
      throw new Error('OPENAI_API_KEY is not configured');
    }

    const { imageBase64 } = await req.json();
    
    if (!imageBase64) {
      throw new Error('No image data provided');
    }

    // Prepare the prompt for Norwegian invoice parsing
    const prompt = `
Analyser denne fakturaen og trekk ut følgende informasjon. Returner kun gyldig JSON uten ekstra tekst:

{
  "invoiceNumber": "fakturanummer",
  "invoiceDate": "fakturadato (DD.MM.YYYY format)",
  "customerName": "kunde navn",
  "customerNumber": "kundenummer",
  "customerOrgNumber": "organisasjonsnummer",
  "productName": "produktnavn/beskrivelse",
  "serviceNumber": "service nr",
  "projectNumber": "prosjekt nr", 
  "technician": "tekniker/montør",
  "technicianHours": "tekniske timer (kun tall)",
  "hourlyRate": "timesats (kun tall)",
  "workCost": "arbeidskostnad (kun tall)",
  "travelTimeHours": "reisetimer (kun tall)",
  "travelTimeCost": "reisekostnad (kun tall)", 
  "vehicleKm": "kjøretøy km (kun tall)",
  "vehicleCost": "kjøretøy kostnad (kun tall)",
  "partsCost": "delekostnad (kun tall)",
  "totalAmount": "totalbeløp (kun tall)",
  "confidence": "konfidens score 0-100"
}

Viktige regler:
- Alle beløp skal være tall uten valutasymbol eller mellomrom
- Datoer skal være i DD.MM.YYYY format
- Hvis et felt ikke finnes, bruk null
- Konfidens skal reflektere hvor sikker du er på dataene (0-100)
`;

    // Call OpenAI Vision API
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${OPENAI_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o',
        messages: [
          {
            role: 'user',
            content: [
              { type: 'text', text: prompt },
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

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`OpenAI API error: ${error}`);
    }

    const result = await response.json();
    const extractedText = result.choices[0].message.content;

    // Parse JSON response
    let extractedData;
    try {
      extractedData = JSON.parse(extractedText);
    } catch (e) {
      throw new Error('Failed to parse OpenAI response as JSON');
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