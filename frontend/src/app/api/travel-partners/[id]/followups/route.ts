import { NextRequest, NextResponse } from 'next/server';
import { supabaseServer } from '../../../../../lib/supabaseServer';
import { createFollowupSchema } from '../../../../../features/travel-partners/schemas/travelPartner.schemas';

export const runtime = 'edge';

function getStaffUsername(request: NextRequest): string {
  const cookieHeader = request.headers.get('cookie') || '';
  const match = cookieHeader.match(/tp_session=([^;]+)/);
  if (match) {
    try {
      const decoded = JSON.parse(atob(match[1]));
      return decoded.username || 'manager';
    } catch {}
  }
  return 'manager';
}

// GET /api/travel-partners/:id/followups
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const { data, error } = await supabaseServer
      .from('followup_logs')
      .select('*')
      .eq('partner_id', id)
      .order('created_at', { ascending: false });

    if (error) throw error;

    return NextResponse.json({ followups: data });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// POST /api/travel-partners/:id/followups
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();

    const parsed = createFollowupSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Validation failed', details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const enteredBy = getStaffUsername(request);
    const d = parsed.data;

    const { data: followup, error } = await supabaseServer
      .from('followup_logs')
      .insert({
        partner_id: id,
        contact_method: d.contact_method || null,
        response_status: d.response_status || null,
        next_followup_at: d.next_followup_at || null,
        notes: d.notes || null,
        entered_by: enteredBy,
      })
      .select('*')
      .single();

    if (error) throw error;

    // Update partner last_contacted_at and optionally partner_status
    const partnerUpdates: Record<string, string> = {
      last_contacted_at: new Date().toISOString(),
    };
    if (d.response_status) {
      partnerUpdates.partner_status = d.response_status;
    }

    await supabaseServer
      .from('travel_partners')
      .update(partnerUpdates)
      .eq('id', id);

    return NextResponse.json({ followup }, { status: 201 });
  } catch (error: any) {
    console.error('Add followup error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
