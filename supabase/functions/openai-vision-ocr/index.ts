import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import OpenAI from "https://deno.land/x/openai@v4.65.0/mod.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const OPENAI_API_KEY = Deno.env.get('OPENAI_API_KEY');
const ASSISTANT_ID = Deno.env.get('ASSISTANT_ID');

// Basic text extraction from image bytes (mock implementation)
async function extractBasicText(bytes: Uint8Array): Promise<string> {
  // For now, return empty string - in production you'd use a lightweight OCR
  // or check image metadata/filename
  return "";
}

// Direct Myhrvold parser (simplified for Edge Function)
async function parseMyhrvoldDirectly(file: File): Promise<any> {
  // Return null to force fallback to GPT-Vision for now
  // This would implement the actual Myhrvold parsing logic
  return null;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log('OpenAI Assistant OCR request started');
    
    if (!OPENAI_API_KEY) {
      console.error('OPENAI_API_KEY is not configured');
      throw new Error('OPENAI_API_KEY is not configured');
    }

    if (!ASSISTANT_ID) {
      console.error('ASSISTANT_ID is not configured');
      throw new Error('ASSISTANT_ID is not configured');
    }

    console.log('Parsing request body...');
    const { imageBase64 } = await req.json();
    
    if (!imageBase64) {
      console.error('No image data provided');
      throw new Error('No image data provided');
    }
    
    console.log('Image data received, length:', imageBase64.length);

    // Initialize OpenAI client
    const openai = new OpenAI({ apiKey: OPENAI_API_KEY });

    try {
      // 1. Convert base64 to blob and upload to OpenAI
      console.log('Converting base64 to blob...');
      const binaryString = atob(imageBase64);
      const bytes = new Uint8Array(binaryString.length);
      for (let i = 0; i < binaryString.length; i++) {
        bytes[i] = binaryString.charCodeAt(i);
      }
      
      const blob = new Blob([bytes], { type: 'image/jpeg' });
      const file = new File([blob], 'invoice.jpg', { type: 'image/jpeg' });

      console.log('Uploading file to OpenAI...');
      const uploadResponse = await openai.files.create({
        file: file,
        purpose: 'assistants'
      });

      console.log('File uploaded successfully:', uploadResponse.id);

      // 2. Create thread and run with assistant
      console.log('Creating thread...');
      const thread = await openai.beta.threads.create({
        messages: [{
          role: 'user',
          content: 'Extract invoice data from this T. Myhrvold invoice image.',
          attachments: [{
            file_id: uploadResponse.id,
            tools: [{ type: 'code_interpreter' }]
          }]
        }]
      });

      console.log('Thread created:', thread.id);

      // 3. Create and poll run with timeout
      console.log('Creating run with assistant...');
      const runPromise = openai.beta.threads.runs.createAndPoll(
        thread.id,
        { 
          assistant_id: ASSISTANT_ID,
          timeout: 30000 // 30 second timeout
        }
      );

      // Add timeout wrapper
      const timeoutPromise = new Promise((_, reject) => {
        setTimeout(() => reject(new Error('Assistant timeout after 30 seconds')), 30000);
      });

      console.log('Waiting for assistant response...');
      const run = await Promise.race([runPromise, timeoutPromise]);

      if (run.status !== 'completed') {
        throw new Error(`Assistant run failed with status: ${run.status}`);
      }

      console.log('Run completed successfully');

      // 4. Get the latest message from the thread
      console.log('Fetching assistant response...');
      const messages = await openai.beta.threads.messages.list(
        thread.id,
        { order: 'desc', limit: 1 }
      );

      if (!messages.data || messages.data.length === 0) {
        throw new Error('No response from assistant');
      }

      const assistantMessage = messages.data[0];
      if (!assistantMessage.content || assistantMessage.content.length === 0) {
        throw new Error('Empty response from assistant');
      }

      const messageContent = assistantMessage.content[0];
      if (messageContent.type !== 'text') {
        throw new Error('Assistant response is not text');
      }

      const responseText = messageContent.text.value;
      console.log('Assistant response received:', responseText.substring(0, 200) + '...');

      // 5. Parse JSON response
      console.log('Parsing JSON from assistant response...');
      let extractedData;
      try {
        // Try to extract JSON from response (assistant might include extra text)
        const jsonMatch = responseText.match(/\{[\s\S]*\}/);
        const jsonText = jsonMatch ? jsonMatch[0] : responseText;
        extractedData = JSON.parse(jsonText);
        console.log('Successfully parsed JSON:', extractedData);
      } catch (e) {
        console.error('JSON parsing failed:', e);
        console.error('Raw assistant response:', responseText);
        throw new Error(`Failed to parse assistant response as JSON: ${e.message}`);
      }

      // 6. Clean up uploaded file
      try {
        await openai.files.del(uploadResponse.id);
        console.log('Cleaned up uploaded file');
      } catch (cleanupError) {
        console.warn('Failed to cleanup uploaded file:', cleanupError);
      }

      return new Response(
        JSON.stringify({ 
          success: true, 
          data: extractedData,
          source: 'assistant',
          rawText: responseText 
        }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );

    } catch (assistantError) {
      console.error('Assistant API error:', assistantError);
      
      // Fallback to direct Vision API if assistant fails
      console.log('🔄 Falling back to Vision API...');
      
      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${OPENAI_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'gpt-4o',
          response_format: { type: 'json_object' },
          messages: [
            {
              role: 'user',
              content: [
                { 
                  type: 'text', 
                  text: `Extract T. Myhrvold invoice data as JSON:
{
  "invoiceNumber": "string",
  "invoiceDate": "DD.MM.YYYY", 
  "customerName": "T. Myhrvold AS",
  "productName": "string",
  "technician": "string",
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

Rules: workCost=T1 lines, partsCost=non-T1/RT1/KM lines, pure numbers only.`
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

      if (!response.ok) {
        throw new Error(`Vision API fallback failed: ${response.status}`);
      }

      const result = await response.json();
      const extractedText = result.choices[0].message.content;
      const extractedData = JSON.parse(extractedText);

      return new Response(
        JSON.stringify({ 
          success: true, 
          data: extractedData,
          source: 'vision_fallback',
          rawText: extractedText 
        }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

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