import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

export const runtime = 'edge';

export async function POST() {
    const cookieStore = await cookies();
    // Setting Max-Age to 0 explicitly forces Chrome / Safari browsers to drop the JWT cookie instantly!
    cookieStore.set('hotel_os_session', '', {
       httpOnly: true,
       secure: process.env.NODE_ENV === 'production',
       sameSite: 'strict',
       path: '/',
       maxAge: 0 
    });

    return NextResponse.json({ success: true, message: 'Signed Out Successfully' });
}
