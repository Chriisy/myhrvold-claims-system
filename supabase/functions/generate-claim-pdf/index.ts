import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import puppeteer from "https://deno.land/x/puppeteer@16.2.0/mod.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface GeneratePDFRequest {
  claimId: string;
  language: 'no' | 'en';
}

const getEmailTemplate = (claim: any, language: 'no' | 'en') => {
  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'Ikke oppgitt / Not specified';
    return new Date(dateString).toLocaleDateString(language === 'no' ? 'nb-NO' : 'en-GB');
  };

  const formatCurrency = (amount: number | null) => {
    if (!amount) return '0,00 kr';
    return new Intl.NumberFormat(language === 'no' ? 'nb-NO' : 'en-GB', {
      style: 'currency',
      currency: 'NOK'
    }).format(amount);
  };

  if (language === 'no') {
    return `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <h2 style="color: #333; border-bottom: 2px solid #007acc; padding-bottom: 10px;">
          Reklamasjonssak - ${claim.claim_number}
        </h2>
        
        <div style="background-color: #f8f9fa; padding: 15px; margin: 20px 0; border-left: 4px solid #007acc;">
          <h3 style="margin: 0 0 10px 0; color: #333;">Produktinformasjon</h3>
          <p><strong>Produkt:</strong> ${claim.product_name}</p>
          ${claim.product_model ? `<p><strong>Modell:</strong> ${claim.product_model}</p>` : ''}
          ${claim.serial_number ? `<p><strong>Serienummer:</strong> ${claim.serial_number}</p>` : ''}
          ${claim.purchase_date ? `<p><strong>Kjøpsdato:</strong> ${formatDate(claim.purchase_date)}</p>` : ''}
          ${claim.warranty_period ? `<p><strong>Garantiperiode:</strong> ${claim.warranty_period}</p>` : ''}
        </div>

        <div style="background-color: #fff3cd; padding: 15px; margin: 20px 0; border-left: 4px solid #ffc107;">
          <h3 style="margin: 0 0 10px 0; color: #333;">Feilbeskrivelse</h3>
          <p>${claim.issue_description}</p>
          ${claim.detailed_description ? `<p><strong>Detaljert beskrivelse:</strong> ${claim.detailed_description}</p>` : ''}
        </div>

        <div style="background-color: #d1ecf1; padding: 15px; margin: 20px 0; border-left: 4px solid #bee5eb;">
          <h3 style="margin: 0 0 10px 0; color: #333;">Kundeinformasjon</h3>
          <p><strong>Kunde:</strong> ${claim.customer_name}</p>
          ${claim.customer_contact ? `<p><strong>Kontaktperson:</strong> ${claim.customer_contact}</p>` : ''}
          ${claim.customer_email ? `<p><strong>E-post:</strong> ${claim.customer_email}</p>` : ''}
          ${claim.customer_phone ? `<p><strong>Telefon:</strong> ${claim.customer_phone}</p>` : ''}
          ${claim.customer_address ? `<p><strong>Adresse:</strong> ${claim.customer_address}</p>` : ''}
        </div>

        <div style="background-color: #d4edda; padding: 15px; margin: 20px 0; border-left: 4px solid #c3e6cb;">
          <h3 style="margin: 0 0 10px 0; color: #333;">Utført arbeid</h3>
          <p><strong>Tekniker:</strong> ${claim.technician_name}</p>
          ${claim.work_hours ? `<p><strong>Arbeidstimer:</strong> ${claim.work_hours} timer (${formatCurrency(claim.work_hours * claim.hourly_rate)})</p>` : ''}
          ${claim.travel_hours ? `<p><strong>Reisetid:</strong> ${claim.travel_hours} timer</p>` : ''}
          ${claim.travel_distance_km ? `<p><strong>Reiseavstand:</strong> ${claim.travel_distance_km} km (${formatCurrency(claim.travel_distance_km * claim.vehicle_cost_per_km)})</p>` : ''}
          ${claim.parts_cost ? `<p><strong>Delekostnad:</strong> ${formatCurrency(claim.parts_cost)}</p>` : ''}
          ${claim.consumables_cost ? `<p><strong>Forbruksmateriell:</strong> ${formatCurrency(claim.consumables_cost)}</p>` : ''}
          ${claim.external_services_cost ? `<p><strong>Eksterne tjenester:</strong> ${formatCurrency(claim.external_services_cost)}</p>` : ''}
        </div>

        <div style="background-color: #f8d7da; padding: 15px; margin: 20px 0; border-left: 4px solid #f5c6cb;">
          <h3 style="margin: 0 0 10px 0; color: #333;">Kostnadsoversikt</h3>
          <p><strong>Total kostnad:</strong> ${formatCurrency(claim.total_cost)}</p>
          <p><strong>Forventet refusjon:</strong> ${formatCurrency(claim.expected_refund)}</p>
        </div>

        <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #dee2e6;">
          <p style="color: #6c757d; font-size: 12px;">
            Denne PDF-en er generert automatisk fra vårt reklamasjonssystem.<br>
            Reklamasjonsnummer: ${claim.claim_number}<br>
            Generert: ${new Date().toLocaleDateString('nb-NO')}
          </p>
        </div>
      </div>
    `;
  } else {
    return `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <h2 style="color: #333; border-bottom: 2px solid #007acc; padding-bottom: 10px;">
          Warranty Claim - ${claim.claim_number}
        </h2>
        
        <div style="background-color: #f8f9fa; padding: 15px; margin: 20px 0; border-left: 4px solid #007acc;">
          <h3 style="margin: 0 0 10px 0; color: #333;">Product Information</h3>
          <p><strong>Product:</strong> ${claim.product_name}</p>
          ${claim.product_model ? `<p><strong>Model:</strong> ${claim.product_model}</p>` : ''}
          ${claim.serial_number ? `<p><strong>Serial Number:</strong> ${claim.serial_number}</p>` : ''}
          ${claim.purchase_date ? `<p><strong>Purchase Date:</strong> ${formatDate(claim.purchase_date)}</p>` : ''}
          ${claim.warranty_period ? `<p><strong>Warranty Period:</strong> ${claim.warranty_period}</p>` : ''}
        </div>

        <div style="background-color: #fff3cd; padding: 15px; margin: 20px 0; border-left: 4px solid #ffc107;">
          <h3 style="margin: 0 0 10px 0; color: #333;">Issue Description</h3>
          <p>${claim.issue_description}</p>
          ${claim.detailed_description ? `<p><strong>Detailed Description:</strong> ${claim.detailed_description}</p>` : ''}
        </div>

        <div style="background-color: #d1ecf1; padding: 15px; margin: 20px 0; border-left: 4px solid #bee5eb;">
          <h3 style="margin: 0 0 10px 0; color: #333;">Customer Information</h3>
          <p><strong>Customer:</strong> ${claim.customer_name}</p>
          ${claim.customer_contact ? `<p><strong>Contact Person:</strong> ${claim.customer_contact}</p>` : ''}
          ${claim.customer_email ? `<p><strong>Email:</strong> ${claim.customer_email}</p>` : ''}
          ${claim.customer_phone ? `<p><strong>Phone:</strong> ${claim.customer_phone}</p>` : ''}
          ${claim.customer_address ? `<p><strong>Address:</strong> ${claim.customer_address}</p>` : ''}
        </div>

        <div style="background-color: #d4edda; padding: 15px; margin: 20px 0; border-left: 4px solid #c3e6cb;">
          <h3 style="margin: 0 0 10px 0; color: #333;">Work Performed</h3>
          <p><strong>Technician:</strong> ${claim.technician_name}</p>
          ${claim.work_hours ? `<p><strong>Work Hours:</strong> ${claim.work_hours} hours (${formatCurrency(claim.work_hours * claim.hourly_rate)})</p>` : ''}
          ${claim.travel_hours ? `<p><strong>Travel Time:</strong> ${claim.travel_hours} hours</p>` : ''}
          ${claim.travel_distance_km ? `<p><strong>Travel Distance:</strong> ${claim.travel_distance_km} km (${formatCurrency(claim.travel_distance_km * claim.vehicle_cost_per_km)})</p>` : ''}
          ${claim.parts_cost ? `<p><strong>Parts Cost:</strong> ${formatCurrency(claim.parts_cost)}</p>` : ''}
          ${claim.consumables_cost ? `<p><strong>Consumables:</strong> ${formatCurrency(claim.consumables_cost)}</p>` : ''}
          ${claim.external_services_cost ? `<p><strong>External Services:</strong> ${formatCurrency(claim.external_services_cost)}</p>` : ''}
        </div>

        <div style="background-color: #f8d7da; padding: 15px; margin: 20px 0; border-left: 4px solid #f5c6cb;">
          <h3 style="margin: 0 0 10px 0; color: #333;">Cost Summary</h3>
          <p><strong>Total Cost:</strong> ${formatCurrency(claim.total_cost)}</p>
          <p><strong>Expected Refund:</strong> ${formatCurrency(claim.expected_refund)}</p>
        </div>

        <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #dee2e6;">
          <p style="color: #6c757d; font-size: 12px;">
            This PDF was generated automatically from our warranty claim system.<br>
            Claim Number: ${claim.claim_number}<br>
            Generated: ${new Date().toLocaleDateString('en-GB')}
          </p>
        </div>
      </div>
    `;
  }
};

const generatePDF = async (htmlContent: string): Promise<Uint8Array> => {
  const browser = await puppeteer.launch({
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
  });
  
  try {
    const page = await browser.newPage();
    await page.setContent(htmlContent, { waitUntil: 'networkidle0' });
    
    const pdfBuffer = await page.pdf({
      format: 'A4',
      printBackground: true,
      margin: {
        top: '20mm',
        right: '15mm',
        bottom: '20mm',
        left: '15mm',
      },
    });
    
    return new Uint8Array(pdfBuffer);
  } finally {
    await browser.close();
  }
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false,
        },
      }
    );

    const { claimId, language }: GeneratePDFRequest = await req.json();

    // Get claim details
    const { data: claim, error: claimError } = await supabaseAdmin
      .from('claims')
      .select('*')
      .eq('id', claimId)
      .single();

    if (claimError || !claim) {
      console.error('Error fetching claim:', claimError);
      throw new Error('Claim not found');
    }

    // Generate HTML content
    const htmlContent = getEmailTemplate(claim, language);

    // Generate PDF
    console.log('Generating PDF...');
    const pdfBuffer = await generatePDF(htmlContent);
    console.log('PDF generated successfully');

    const filename = `reklamasjon-${claim.claim_number}-${language}.pdf`;

    return new Response(pdfBuffer, {
      status: 200,
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="${filename}"`,
        ...corsHeaders,
      },
    });
  } catch (error: any) {
    console.error('Error in generate-claim-pdf function:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
});