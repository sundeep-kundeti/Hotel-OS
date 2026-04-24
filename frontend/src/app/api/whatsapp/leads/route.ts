import { NextResponse } from 'next/server';
import { supabaseServer } from '@/lib/supabaseServer';

export const runtime = 'edge';

export async function GET() {
  try {
    const { data: leads, error } = await supabaseServer
      .from('whatsapp_booking_leads')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(20);

    if (error) {
      // Return empty instead of failing completely, since table might not be set up yet securely
      return NextResponse.json({ success: true, leads: [] });
    }

    return NextResponse.json({ success: true, leads });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
