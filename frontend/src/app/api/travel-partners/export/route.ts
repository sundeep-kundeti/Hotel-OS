import { NextRequest, NextResponse } from 'next/server';
import { supabaseServer } from '../../../../lib/supabaseServer';
import { getTodayIST, formatVehicleNumber } from '../../../../features/travel-partners/utils/normalize';

export const runtime = 'edge';

function escapeCSV(value: string | number | null | undefined): string {
  if (value === null || value === undefined) return '';
  const str = String(value);
  if (str.includes(',') || str.includes('"') || str.includes('\n')) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
}

function toCSV(headers: string[], rows: (string | number | null | undefined)[][]): string {
  const csvRows = [
    headers.join(','),
    ...rows.map((row) => row.map(escapeCSV).join(',')),
  ];
  return csvRows.join('\n');
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type') || 'all_partners';
    const today = getTodayIST();
    const todayStart = `${today}T00:00:00+05:30`;
    const todayEnd = `${today}T23:59:59+05:30`;

    let csv = '';
    let filename = 'travel-partners-export';

    switch (type) {
      case 'all_partners': {
        const { data, error } = await supabaseServer
          .from('travel_partners')
          .select('*')
          .order('created_at', { ascending: false });
        if (error) throw error;

        const headers = [
          'ID','Phone Number','Vehicle Number','Driver Name','Vehicle Make',
          'Lead Source','Partner Status','Active','Last Contacted','Notes',
          'Created By','Created At'
        ];
        const rows = (data || []).map((r) => [
          r.id, r.phone_number, formatVehicleNumber(r.vehicle_number), r.driver_name,
          r.vehicle_make, r.lead_source, r.partner_status,
          r.is_active ? 'Yes' : 'No',
          r.last_contacted_at ? new Date(r.last_contacted_at).toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' }) : '',
          r.notes, r.created_by,
          new Date(r.created_at).toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' })
        ]);
        csv = toCSV(headers, rows);
        filename = `all-partners-${today}`;
        break;
      }

      case 'pending_commissions': {
        const { data, error } = await supabaseServer
          .from('commission_entries')
          .select('*, travel_partners(driver_name, vehicle_number, phone_number)')
          .eq('commission_status', 'Pending')
          .order('created_at', { ascending: false });
        if (error) throw error;

        const headers = [
          'Commission ID','Driver Name','Vehicle Number','Phone Number',
          'Customer Name','Room Number','Booking Amount (₹)','Commission Amount (₹)',
          'Status','Payment Mode','Notes','Entered By','Date'
        ];
        const rows = (data || []).map((r: any) => [
          r.id, r.travel_partners?.driver_name,
          formatVehicleNumber(r.travel_partners?.vehicle_number),
          r.travel_partners?.phone_number,
          r.customer_name, r.room_number, r.booking_amount, r.commission_amount,
          r.commission_status, r.payment_mode, r.notes, r.entered_by,
          new Date(r.created_at).toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' })
        ]);
        csv = toCSV(headers, rows);
        filename = `pending-commissions-${today}`;
        break;
      }

      case 'paid_commissions': {
        const { data, error } = await supabaseServer
          .from('commission_entries')
          .select('*, travel_partners(driver_name, vehicle_number, phone_number)')
          .eq('commission_status', 'Paid')
          .order('paid_at', { ascending: false });
        if (error) throw error;

        const headers = [
          'Commission ID','Driver Name','Vehicle Number','Phone Number',
          'Customer Name','Room Number','Booking Amount (₹)','Commission Amount (₹)',
          'Payment Mode','Paid At','Entered By','Created At'
        ];
        const rows = (data || []).map((r: any) => [
          r.id, r.travel_partners?.driver_name,
          formatVehicleNumber(r.travel_partners?.vehicle_number),
          r.travel_partners?.phone_number,
          r.customer_name, r.room_number, r.booking_amount, r.commission_amount,
          r.payment_mode,
          r.paid_at ? new Date(r.paid_at).toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' }) : '',
          r.entered_by,
          new Date(r.created_at).toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' })
        ]);
        csv = toCSV(headers, rows);
        filename = `paid-commissions-${today}`;
        break;
      }

      case 'today_leads': {
        const { data, error } = await supabaseServer
          .from('travel_partners')
          .select('*')
          .gte('created_at', todayStart)
          .lte('created_at', todayEnd)
          .order('created_at', { ascending: false });
        if (error) throw error;

        const headers = [
          'Phone Number','Vehicle Number','Driver Name','Vehicle Make',
          'Lead Source','Partner Status','Notes','Created By','Created At'
        ];
        const rows = (data || []).map((r) => [
          r.phone_number, formatVehicleNumber(r.vehicle_number), r.driver_name,
          r.vehicle_make, r.lead_source, r.partner_status, r.notes, r.created_by,
          new Date(r.created_at).toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' })
        ]);
        csv = toCSV(headers, rows);
        filename = `today-leads-${today}`;
        break;
      }

      default:
        return NextResponse.json({ error: 'Unknown export type' }, { status: 400 });
    }

    return new NextResponse(csv, {
      status: 200,
      headers: {
        'Content-Type': 'text/csv; charset=utf-8',
        'Content-Disposition': `attachment; filename="${filename}.csv"`,
      },
    });
  } catch (error: any) {
    console.error('Export error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
