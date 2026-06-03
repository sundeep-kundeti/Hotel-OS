import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, content-type, x-hms-session',
  'Access-Control-Allow-Methods': 'GET, POST, PATCH, OPTIONS',
};

// ─── Session Validation ───────────────────────────────────────────────────────

type HMSSession = {
  staffId: string;
  username: string;
  name: string;
  role: 'OWNER' | 'MANAGER' | 'HOUSEKEEPING';
  loginAt: string;
};

function validateSession(req: Request): HMSSession | null {
  const token = (req.headers.get('x-hms-session') || '').trim();
  if (!token) return null;
  try {
    const decoded = JSON.parse(atob(token)) as HMSSession;
    if (!decoded.username || !decoded.loginAt || !decoded.role) return null;
    if (Date.now() - new Date(decoded.loginAt).getTime() > 12 * 60 * 60 * 1000) return null;
    return decoded;
  } catch { return null; }
}

// ─── Code Generators ─────────────────────────────────────────────────────────

function generateToken(length = 32): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789';
  let result = '';
  for (let i = 0; i < length; i++) result += chars[Math.floor(Math.random() * chars.length)];
  return result;
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

function json(data: unknown, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });
}

function insertLog(
  supabase: ReturnType<typeof createClient>,
  params: {
    room_id: string; room_number: string; booking_id?: string | null;
    old_status: string | null; new_status: string;
    changed_by_role: string; changed_by_staff_id?: string | null;
    reason?: string;
  },
) {
  return supabase.from('hms_room_status_logs').insert(params);
}

function insertAudit(
  supabase: ReturnType<typeof createClient>,
  params: {
    action: string; entity: string; entity_id?: string;
    old_value?: string; new_value?: string;
    changed_by_staff_id?: string; changed_by_role?: string;
    reason?: string; risk_level?: string;
  },
) {
  return supabase.from('hms_audit_logs').insert({
    risk_level: 'LOW',
    ...params,
  });
}

// ─── Main Handler ─────────────────────────────────────────────────────────────

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response(null, { headers: corsHeaders });

  const session = validateSession(req);
  if (!session) return json({ error: 'Unauthorized' }, 401);

  const supabase = createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
  );

  const url = new URL(req.url);
  const pathParts = url.pathname.split('/').filter(Boolean);
  // Path: /functions/v1/hms-bookings[/<booking_code>]
  const bookingCode = pathParts.length > 2 ? pathParts[pathParts.length - 1] : null;
  const isRoot = !bookingCode || bookingCode === 'hms-bookings';

  try {
    // ── GET /hms-bookings/addons  → add-on catalogue ─────────────────────────
    if (req.method === 'GET' && bookingCode === 'addons') {
      const { data, error } = await supabase
        .from('hms_room_addons')
        .select('*')
        .eq('is_active', true)
        .order('addon_type')
        .order('price');
      if (error) throw error;
      return json({ addons: data });
    }

    // ── GET /hms-bookings  → active stays ────────────────────────────────────
    if (req.method === 'GET' && isRoot) {
      const filter = url.searchParams.get('filter') || 'active';

      let query = supabase.from('hms_bookings').select('*').order('created_at', { ascending: false });

      if (filter === 'active') {
        query = query.in('booking_status', ['Pending Check-In', 'Checked In', 'Guest Checked Out', 'Cleaning Pending']);
      } else if (filter === 'today') {
        const todayStart = new Date(); todayStart.setHours(0, 0, 0, 0);
        const todayEnd = new Date(); todayEnd.setHours(23, 59, 59, 999);
        query = query.gte('created_at', todayStart.toISOString()).lte('created_at', todayEnd.toISOString());
      }

      const { data, error } = await query;
      if (error) throw error;
      return json({ bookings: data });
    }

    // ── GET /hms-bookings/<booking_code>  → single booking ───────────────────
    if (req.method === 'GET' && bookingCode) {
      const { data, error } = await supabase
        .from('hms_bookings')
        .select('*')
        .eq('booking_code', bookingCode)
        .single();
      if (error) throw error;
      if (!data) return json({ error: 'Booking not found' }, 404);
      return json({ booking: data });
    }

    // ── POST /hms-bookings  → create booking ──────────────────────────────────
    if (req.method === 'POST' && isRoot) {
      if (!['OWNER', 'MANAGER'].includes(session.role)) {
        return json({ error: 'Only OWNER or MANAGER can create bookings' }, 403);
      }

      const body = await req.json();
      const { guest_name, guest_phone, room_id, source, checkin_expected, checkout_expected,
              amount, amount_collected, payment_mode, payment_status, remarks,
              id_type, id_last4, addons: addonsList } = body;

      // Validate required fields
      if (!guest_name || !guest_phone || !room_id || !checkin_expected || !checkout_expected || !amount) {
        return json({ error: 'Missing required fields: guest_name, guest_phone, room_id, checkin_expected, checkout_expected, amount' }, 400);
      }
      if (new Date(checkout_expected) <= new Date(checkin_expected)) {
        return json({ error: 'Checkout must be after check-in' }, 400);
      }

      // Validate room is Vacant Clean
      const { data: room, error: roomErr } = await supabase
        .from('hms_rooms')
        .select('*')
        .eq('id', room_id)
        .single();
      if (roomErr || !room) return json({ error: 'Room not found' }, 404);
      if (room.status !== 'Vacant Clean') {
        return json({
          error: `Room ${room.room_number} is not available. Current status: ${room.status}`,
        }, 409);
      }
      if (!room.is_active) return json({ error: 'Room is inactive' }, 409);

      // Check no active booking for same room
      const { count } = await supabase
        .from('hms_bookings')
        .select('*', { count: 'exact', head: true })
        .eq('room_id', room_id)
        .in('booking_status', ['Pending Check-In', 'Checked In', 'Guest Checked Out', 'Cleaning Pending']);
      if ((count ?? 0) > 0) {
        return json({ error: `Room ${room.room_number} already has an active booking` }, 409);
      }

      // Generate booking code using sequence
      const { data: seqData } = await supabase.rpc('nextval', { seq_name: 'hms_booking_seq' }).single();
      const year = new Date().getFullYear();
      const seq = String(seqData ?? Date.now()).padStart(6, '0');
      const booking_code = `HSS-${year}-${seq}`;

      const checkin_token = generateToken(40);
      const checkout_token = generateToken(40);

      // Create booking
      const { data: booking, error: bookingErr } = await supabase
        .from('hms_bookings')
        .insert({
          booking_code,
          guest_name: guest_name.trim(),
          guest_phone: guest_phone.trim(),
          room_id,
          room_number: room.room_number,
          room_type: room.room_type,
          source: source || 'Walk-in',
          checkin_expected,
          checkout_expected,
          amount: Number(amount),
          amount_collected: Number(amount_collected || 0),
          payment_mode: payment_mode || 'Cash',
          payment_status: payment_status || 'Pending',
          booking_status: 'Pending Check-In',
          checkin_token,
          checkout_token,
          created_by: session.staffId,
          remarks: remarks || null,
          id_type: id_type || null,
          id_last4: id_last4 || null,
        })
        .select('*')
        .single();

      if (bookingErr) throw bookingErr;

      // Save add-on line items
      if (Array.isArray(addonsList) && addonsList.length > 0) {
        const addonRows = addonsList
          .filter((a: any) => a.quantity > 0)
          .map((a: any) => ({
            booking_id: booking.id,
            addon_id: a.addon_id,
            addon_name: a.addon_name,
            addon_price: a.addon_price,
            quantity: a.quantity,
          }));
        if (addonRows.length > 0) {
          await supabase.from('hms_booking_addons').insert(addonRows);
        }
      }

      // Update room status → Pending Check-In
      await supabase.from('hms_rooms').update({ status: 'Pending Check-In' }).eq('id', room_id);

      // Log room status change
      await insertLog(supabase, {
        room_id,
        room_number: room.room_number,
        booking_id: booking.id,
        old_status: 'Vacant Clean',
        new_status: 'Pending Check-In',
        changed_by_role: session.role,
        changed_by_staff_id: session.staffId,
        reason: `Booking created: ${booking_code}`,
      });

      // Audit log
      await insertAudit(supabase, {
        action: 'BOOKING_CREATED',
        entity: 'hms_bookings',
        entity_id: booking.id,
        new_value: booking_code,
        changed_by_staff_id: session.staffId,
        changed_by_role: session.role,
      });

      const baseUrl = Deno.env.get('SITE_URL') || 'https://srimunihotels.com';
      const checkinLink = `${baseUrl}/checkin/${booking_code}?token=${checkin_token}`;
      const checkoutLink = `${baseUrl}/checkout/${booking_code}?token=${checkout_token}`;

      const whatsappMsg = encodeURIComponent(
        `🏨 Welcome to Hotel Sri Satya Sai!\n\n` +
        `Your booking has been created.\n\n` +
        `🛏️ Room: ${room.room_number}\n` +
        `📅 Check-in: ${new Date(checkin_expected).toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' })}\n` +
        `🔑 Booking ID: ${booking_code}\n\n` +
        `Complete your digital check-in to unlock your ₹100 next-stay reward:\n${checkinLink}`
      );

      return json({
        booking,
        checkin_link: checkinLink,
        checkout_link: checkoutLink,
        whatsapp_link: `https://wa.me/91${guest_phone.replace(/\D/g, '')}?text=${whatsappMsg}`,
      }, 201);
    }

    // ── PATCH /hms-bookings/<booking_code>  → edit booking ───────────────────
    if (req.method === 'PATCH' && bookingCode) {
      if (!['OWNER', 'MANAGER'].includes(session.role)) {
        return json({ error: 'Only OWNER or MANAGER can edit bookings' }, 403);
      }

      const { data: existing, error: fetchErr } = await supabase
        .from('hms_bookings')
        .select('*')
        .eq('booking_code', bookingCode)
        .single();
      if (fetchErr || !existing) return json({ error: 'Booking not found' }, 404);

      const body = await req.json();
      const HIGH_RISK_FIELDS = ['room_id', 'amount', 'payment_mode', 'checkout_expected', 'source', 'guest_phone'];
      const isCheckedIn = !!existing.checkin_actual;

      const updates: Record<string, unknown> = {};
      const auditItems: string[] = [];

      for (const [key, value] of Object.entries(body)) {
        if (key === 'booking_code' || key === 'id') continue; // immutable

        // After check-in: only remarks, payment_status, amount_collected allowed for MANAGER
        if (isCheckedIn && session.role === 'MANAGER') {
          if (!['remarks', 'payment_status', 'amount_collected'].includes(key)) {
            return json({ error: `MANAGER cannot edit '${key}' after check-in. Contact OWNER.` }, 403);
          }
        }

        if ((existing as Record<string, unknown>)[key] !== value) {
          updates[key] = value;
          const riskLevel = HIGH_RISK_FIELDS.includes(key) && isCheckedIn ? 'HIGH' : 'LOW';
          auditItems.push(`${key}: ${(existing as Record<string, unknown>)[key]} → ${value} [${riskLevel}]`);

          await insertAudit(supabase, {
            action: 'BOOKING_EDITED',
            entity: 'hms_bookings',
            entity_id: existing.id,
            old_value: String((existing as Record<string, unknown>)[key] ?? ''),
            new_value: String(value ?? ''),
            changed_by_staff_id: session.staffId,
            changed_by_role: session.role,
            reason: body.reason || undefined,
            risk_level: HIGH_RISK_FIELDS.includes(key) && isCheckedIn ? 'HIGH' : 'LOW',
          });
        }
      }

      if (Object.keys(updates).length === 0) return json({ message: 'No changes' });

      const { data: updated, error: updateErr } = await supabase
        .from('hms_bookings')
        .update(updates)
        .eq('id', existing.id)
        .select('*')
        .single();
      if (updateErr) throw updateErr;

      return json({ booking: updated, audited_fields: auditItems });
    }

    return json({ error: 'Method not allowed' }, 405);
  } catch (err: any) {
    return json({ error: err.message }, 500);
  }
});
