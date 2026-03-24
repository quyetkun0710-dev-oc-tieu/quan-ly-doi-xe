// Deno Edge Function (TypeScript) for High Performance Logistics Logic
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { vehicle_id, start_date, end_date } = await req.json()

    // 1. Initialize Supabase client
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? ''
    )

    // 2. Perform complex backend calculation (Moving logic from client to Edge)
    // Ví dụ: Tính hiệu suất tiêu thụ xăng trung bình thực tế cho một xe
    const { data: fuelLogs, error } = await supabase
      .from('fuel')
      .select('liters, odometer')
      .eq('vehicle_id', vehicle_id)
      .gte('date', start_date)
      .lte('date', end_date)
      .order('odometer', { ascending: true })

    if (error) throw error

    let totalLiters = 0
    let totalKm = 0
    
    if (fuelLogs && fuelLogs.length > 1) {
      totalLiters = fuelLogs.reduce((acc, log) => acc + (log.liters || 0), 0)
      totalKm = fuelLogs[fuelLogs.length - 1].odometer - fuelLogs[0].odometer
    }

    const efficiency = totalKm > 0 ? (totalLiters / totalKm) * 100 : 0

    return new Response(
      JSON.stringify({
        success: true,
        vehicle_id,
        period: { start_date, end_date },
        results: {
          total_liters: totalLiters,
          total_km: totalKm,
          avg_consumption_per_100km: efficiency.toFixed(2)
        }
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    )

  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    )
  }
})
