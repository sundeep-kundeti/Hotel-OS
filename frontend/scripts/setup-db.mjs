import postgres from 'postgres';
import fs from 'fs';
import path from 'path';

// Simple parser for .env.local
const envPath = path.resolve('.env.local');
let dbUrl = '';
if (fs.existsSync(envPath)) {
  const content = fs.readFileSync(envPath, 'utf8');
  const match = content.match(/DATABASE_URL="([^"]+)"/);
  if (match) {
    dbUrl = match[1];
  }
}

if (!dbUrl) {
  console.error("DATABASE_URL not found in .env.local");
  process.exit(1);
}

const sql = postgres(dbUrl, { ssl: 'require' });

async function setup() {
  try {
    console.log("Creating reservations table...");
    await sql`
      CREATE TABLE IF NOT EXISTS reservations (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        room_number TEXT NOT NULL,
        guest_name TEXT NOT NULL,
        rate INTEGER NOT NULL,
        amount_paid INTEGER NOT NULL DEFAULT 0,
        payment_method TEXT NOT NULL,
        reservation_source TEXT NOT NULL,
        broker_id TEXT,
        check_in TIMESTAMPTZ NOT NULL,
        check_out TIMESTAMPTZ NOT NULL,
        remarks TEXT,
        status TEXT NOT NULL,
        created_at TIMESTAMPTZ DEFAULT NOW()
      );
    `;
    console.log("Table reservations successfully created or verified.");

    console.log("Creating whatsapp_booking_leads table...");
    await sql`
      CREATE TABLE IF NOT EXISTS whatsapp_booking_leads (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        wa_message_id TEXT UNIQUE,
        customer_mobile TEXT,
        customer_name TEXT,
        raw_message TEXT NOT NULL,
        parsed_date DATE NULL,
        parsed_time TEXT NULL,
        parsed_duration_hours INT NULL,
        parsed_pax INT NULL,
        booking_type TEXT DEFAULT 'fresh_up',
        status TEXT DEFAULT 'new',
        manager_notes TEXT NULL,
        created_at TIMESTAMPTZ DEFAULT NOW()
      );
    `;
    console.log("Table whatsapp_booking_leads successfully created or verified.");
  } catch (error) {
    console.error("Failed to setup database:", error);
  } finally {
    await sql.end();
  }
}

setup();
