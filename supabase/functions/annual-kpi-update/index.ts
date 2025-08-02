import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.50.2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface SSBApiResponse {
  dataset: {
    dimension: {
      id: string[];
      size: number[];
    };
    value: number[];
  };
}

interface AgreementUpdateResult {
  id: string;
  avtale_nummer: string;
  old_price: number;
  new_price: number;
  kpi_change: number;
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    console.log('Starting annual KPI update process...');

    // Fetch current KPI from SSB API
    const currentYear = new Date().getFullYear();
    const previousYear = currentYear - 1;
    
    const ssbApiUrl = Deno.env.get('SSB_API_URL') || 'https://data.ssb.no/api/v0/no/table/03013';
    const ssbTableId = Deno.env.get('SSB_TABLE_ID') || '03013';

    // SSB API request for KPI data
    const ssbRequest = {
      "query": [
        {
          "code": "ContentsCode",
          "selection": {
            "filter": "item",
            "values": ["KPI"]
          }
        },
        {
          "code": "Tid",
          "selection": {
            "filter": "item", 
            "values": [`${previousYear}M12`, `${currentYear}M12`] // December of both years
          }
        }
      ],
      "response": {
        "format": "json-stat2"
      }
    };

    console.log(`Fetching KPI data from SSB for years ${previousYear}-${currentYear}...`);

    const ssbResponse = await fetch(ssbApiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(ssbRequest)
    });

    if (!ssbResponse.ok) {
      console.error('SSB API error:', ssbResponse.status, await ssbResponse.text());
      return new Response(JSON.stringify({ 
        error: 'Failed to fetch KPI data from SSB',
        status: ssbResponse.status 
      }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const ssbData: SSBApiResponse = await ssbResponse.json();
    
    if (!ssbData.dataset || !ssbData.dataset.value || ssbData.dataset.value.length < 2) {
      console.error('Invalid SSB API response:', ssbData);
      return new Response(JSON.stringify({ 
        error: 'Invalid KPI data received from SSB' 
      }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Extract KPI values (assuming the response contains [previousYear, currentYear] values)
    const previousYearKPI = ssbData.dataset.value[0];
    const currentYearKPI = ssbData.dataset.value[1];

    console.log(`KPI data: ${previousYear} = ${previousYearKPI}, ${currentYear} = ${currentYearKPI}`);

    if (!previousYearKPI || !currentYearKPI) {
      return new Response(JSON.stringify({ 
        error: 'Missing KPI data for required years' 
      }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Get agreements that need CPI adjustment
    const { data: agreements, error: agreementsError } = await supabase
      .from('maintenance_agreements')
      .select('id, avtale_nummer, pris_grunnlag, signert_kpi_verdi, signert_dato, pris_cpi_justerbar')
      .eq('pris_cpi_justerbar', true)
      .not('signert_kpi_verdi', 'is', null)
      .not('signert_dato', 'is', null);

    if (agreementsError) {
      console.error('Failed to fetch agreements:', agreementsError);
      return new Response(JSON.stringify({ error: 'Failed to fetch agreements' }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    if (!agreements || agreements.length === 0) {
      console.log('No agreements found for KPI adjustment');
      return new Response(JSON.stringify({ 
        success: true, 
        message: 'No agreements require KPI adjustment',
        updated_count: 0 
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    console.log(`Found ${agreements.length} agreements for potential KPI adjustment`);

    const updateResults: AgreementUpdateResult[] = [];
    const auditEntries = [];

    // Process each agreement
    for (const agreement of agreements) {
      const signingYearKPI = agreement.signert_kpi_verdi;
      const oldPrice = agreement.pris_grunnlag;

      // Calculate new price: new_price = old_price * (current_kpi / signing_kpi)
      const kpiRatio = currentYearKPI / signingYearKPI;
      const newPrice = Math.round(oldPrice * kpiRatio * 100) / 100; // Round to 2 decimals

      const kpiChange = ((kpiRatio - 1) * 100); // Percentage change

      // Only update if there's a significant change (> 0.5%)
      if (Math.abs(kpiChange) > 0.5) {
        const { error: updateError } = await supabase
          .from('maintenance_agreements')
          .update({
            pris_grunnlag: newPrice,
            sist_cpi_justert: new Date().toISOString().split('T')[0] // Today's date
          })
          .eq('id', agreement.id);

        if (updateError) {
          console.error(`Failed to update agreement ${agreement.avtale_nummer}:`, updateError);
          continue;
        }

        updateResults.push({
          id: agreement.id,
          avtale_nummer: agreement.avtale_nummer,
          old_price: oldPrice,
          new_price: newPrice,
          kpi_change: kpiChange
        });

        // Prepare audit log entry
        auditEntries.push({
          table_name: 'maintenance_agreements',
          operation: 'KPI_UPDATE',
          record_id: agreement.id,
          old_values: { pris_grunnlag: oldPrice },
          new_values: { pris_grunnlag: newPrice },
          user_id: null // System operation
        });

        console.log(`Updated ${agreement.avtale_nummer}: ${oldPrice} → ${newPrice} (${kpiChange.toFixed(2)}% change)`);
      } else {
        console.log(`Skipped ${agreement.avtale_nummer}: change ${kpiChange.toFixed(2)}% too small`);
      }
    }

    // Log audit entries
    if (auditEntries.length > 0) {
      const { error: auditError } = await supabase
        .from('audit_logs')
        .insert(auditEntries);

      if (auditError) {
        console.error('Failed to create audit logs:', auditError);
      }
    }

    console.log(`KPI update completed: ${updateResults.length} agreements updated`);

    return new Response(JSON.stringify({
      success: true,
      updated_count: updateResults.length,
      total_checked: agreements.length,
      kpi_data: {
        previous_year: previousYear,
        previous_year_kpi: previousYearKPI,
        current_year: currentYear,
        current_year_kpi: currentYearKPI,
        kpi_change_percent: ((currentYearKPI / previousYearKPI - 1) * 100).toFixed(2)
      },
      updated_agreements: updateResults
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in annual-kpi-update function:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
};

serve(handler);