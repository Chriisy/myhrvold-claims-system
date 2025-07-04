import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { Resend } from "npm:resend@2.0.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface SupplierEmailRequest {
  claimId: string;
  language: 'no' | 'en';
  supplierEmail: string;
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
    return {
      subject: `Reklamasjon - ${claim.claim_number} - ${claim.product_name}`,
      html: `
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

          ${claim.supplier_notes ? `
          <div style="background-color: #e2e3e5; padding: 15px; margin: 20px 0; border-left: 4px solid #d6d8db;">
            <h3 style="margin: 0 0 10px 0; color: #333;">Leverandørnotater</h3>
            <p>${claim.supplier_notes}</p>
          </div>
          ` : ''}

          <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #dee2e6;">
            <p style="color: #6c757d; font-size: 12px;">
              Denne e-posten er sendt automatisk fra vårt reklamasjonssystem.<br>
              Reklamasjonsnummer: ${claim.claim_number}<br>
              Sendt: ${new Date().toLocaleDateString('nb-NO')}
            </p>
          </div>
        </div>
      `
    };
  } else {
    return {
      subject: `Warranty Claim - ${claim.claim_number} - ${claim.product_name}`,
      html: `
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

          ${claim.supplier_notes ? `
          <div style="background-color: #e2e3e5; padding: 15px; margin: 20px 0; border-left: 4px solid #d6d8db;">
            <h3 style="margin: 0 0 10px 0; color: #333;">Supplier Notes</h3>
            <p>${claim.supplier_notes}</p>
          </div>
          ` : ''}

          <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #dee2e6;">
            <p style="color: #6c757d; font-size: 12px;">
              This email was sent automatically from our warranty claim system.<br>
              Claim Number: ${claim.claim_number}<br>
              Sent: ${new Date().toLocaleDateString('en-GB')}
            </p>
          </div>
        </div>
      `
    };
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

    const { claimId, language, supplierEmail }: SupplierEmailRequest = await req.json();

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

    // Generate email template
    const template = getEmailTemplate(claim, language);

    // Send email
    const { data, error } = await resend.emails.send({
      from: 'Reklamasjon <noreply@yourdomain.com>',
      to: [supplierEmail],
      subject: template.subject,
      html: template.html,
    });

    if (error) {
      console.error('Error sending email:', error);
      throw error;
    }

    // Update claim with email sent date
    const { error: updateError } = await supabaseAdmin
      .from('claims')
      .update({ 
        supplier_email_sent_date: new Date().toISOString(),
        status: 'sent_supplier'
      })
      .eq('id', claimId);

    if (updateError) {
      console.error('Error updating claim:', updateError);
    }

    console.log('Email sent successfully:', data);

    return new Response(
      JSON.stringify({ success: true, emailId: data?.id }),
      {
        status: 200,
        headers: {
          "Content-Type": "application/json",
          ...corsHeaders,
        },
      }
    );
  } catch (error: any) {
    console.error('Error in send-supplier-email function:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
});