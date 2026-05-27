import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, content-type, x-tp-session',
  'Access-Control-Allow-Methods': 'GET, OPTIONS',
};

function validateSession(req: Request): string | null {
  // Token travels in X-TP-Session (Authorization carries the Supabase anon key for gateway)
  const token = (req.headers.get('x-tp-session') || '').trim();
  if (!token) return null;
  try {
    const decoded = JSON.parse(atob(token));
    if (!decoded.username || !decoded.loginAt) return null;
    const loginTime = new Date(decoded.loginAt).getTime();
    if (Date.now() - loginTime > 12 * 60 * 60 * 1000) return null;
    return decoded.username as string;
  } catch {
    return null;
  }
}

function getTodayIST(): string {
  return new Date().toLocaleDateString('en-CA', { timeZone: 'Asia/Kolkata' });
}

function formatVehicle(v: string): string {
  if (!v) return '';
  const u = v.replace(/[\s\-]/g, '').toUpperCase();
  const m = u.match(/^([A-Z]{2})(\d{2})([A-Z]{1,2})(\d{4})$/);
  return m ? `${m[1]}-${m[2]}-${m[3]}-${m[4]}` : u;
}

function escapeCSV(value: string | number | null | undefined): string {
  if (value === null || value === undefined) return '';
  const str = String(value);
  if (str.includes(',') || str.includes('"') || str.includes('\n')) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
}

function toCSV(headers: string[], rows: (string | number | null | undefined)[][]): string {
  return [headers.join(','), ...rows.map((row) => row.map(escapeCSV).join(','))].join('\n');
}

function toLocaleIST(dateStr: string | null): string {
  if (!dateStr) return '';
  return new Date(dateStr).toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' });
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response(null, { headers: corsHeaders });

  const username = validateSession(req);
  if (!username) {
    return new Response(JSON.stringify({ error: 'Unauthorized' }), {
      status: 401,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }

  const supabase = createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
  );

  try {
    const url = new URL(req.url);
    const type = url.searchParams.get('type') || 'all_partners';
    const today = getTodayIST();
    const todayStart = `${today}T00:00:00+05:30`;
    const todayEnd = `${today}T23:59:59+05:30`;

    let csv = '';
    let filename = 'travel-partners-export';

    switch (type) {
      case 'all_partners': {
        const { data, error } = await supabase.from('travel_partners').select('*').order('created_at', { ascending: false });
        if (error) throw error;
        const headers = ['ID', 'Phone Number', 'Vehicle Number', 'Driver Name', 'Vehicle Make', 'Lead Source', 'Partner Status', 'Active', 'Last Contacted', 'Notes', 'Created By', 'Created At'];
        const rows = (data || []).map((r) => [r.id, r.phone_number, formatVehicle(r.vehicle_number), r.driver_name, r.vehicle_make, r.lead_source, r.partner_status, r.is_active ? 'Yes' : 'No', toLocaleIST(r.last_contacted_at), r.notes, r.created_by, toLocaleIST(r.created_at)]);
        csv = toCSV(headers, rows);
        filename = `all-partners-${today}`;
        break;
      }
      case 'pending_commissions': {
        const { data, error } = await supabase.from('commission_entries').select('*, travel_partners(driver_name, vehicle_number, phone_number)').eq('commission_status', 'Pending').order('created_at', { ascending: false });
        if (error) throw error;
        const headers = ['Commission ID', 'Driver Name', 'Vehicle Number', 'Phone Number', 'Customer Name', 'Room Number', 'Booking Amount (₹)', 'Commission Amount (₹)', 'Status', 'Payment Mode', 'Notes', 'Entered By', 'Date'];
        const rows = (data || []).map((r: any) => [r.id, r.travel_partners?.driver_name, formatVehicle(r.travel_partners?.vehicle_number), r.travel_partners?.phone_number, r.customer_name, r.room_number, r.booking_amount, r.commission_amount, r.commission_status, r.payment_mode, r.notes, r.entered_by, toLocaleIST(r.created_at)]);
        csv = toCSV(headers, rows);
        filename = `pending-commissions-${today}`;
        break;
      }
      case 'paid_commissions': {
        const { data, error } = await supabase.from('commission_entries').select('*, travel_partners(driver_name, vehicle_number, phone_number)').eq('commission_status', 'Paid').order('paid_at', { ascending: false });
        if (error) throw error;
        const headers = ['Commission ID', 'Driver Name', 'Vehicle Number', 'Phone Number', 'Customer Name', 'Room Number', 'Booking Amount (₹)', 'Commission Amount (₹)', 'Payment Mode', 'Paid At', 'Entered By', 'Created At'];
        const rows = (data || []).map((r: any) => [r.id, r.travel_partners?.driver_name, formatVehicle(r.travel_partners?.vehicle_number), r.travel_partners?.phone_number, r.customer_name, r.room_number, r.booking_amount, r.commission_amount, r.payment_mode, toLocaleIST(r.paid_at), r.entered_by, toLocaleIST(r.created_at)]);
        csv = toCSV(headers, rows);
        filename = `paid-commissions-${today}`;
        break;
      }
      case 'today_leads': {
        const { data, error } = await supabase.from('travel_partners').select('*').gte('created_at', todayStart).lte('created_at', todayEnd).order('created_at', { ascending: false });
        if (error) throw error;
        const headers = ['Phone Number', 'Vehicle Number', 'Driver Name', 'Vehicle Make', 'Lead Source', 'Partner Status', 'Notes', 'Created By', 'Created At'];
        const rows = (data || []).map((r) => [r.phone_number, formatVehicle(r.vehicle_number), r.driver_name, r.vehicle_make, r.lead_source, r.partner_status, r.notes, r.created_by, toLocaleIST(r.created_at)]);
        csv = toCSV(headers, rows);
        filename = `today-leads-${today}`;
        break;
      }
      default:
        return new Response(JSON.stringify({ error: 'Unknown export type' }), {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
    }

    return new Response(csv, {
      status: 200,
      headers: {
        ...corsHeaders,
        'Content-Type': 'text/csv; charset=utf-8',
        'Content-Disposition': `attachment; filename="${filename}.csv"`,
      },
    });
  } catch (err: any) {
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
