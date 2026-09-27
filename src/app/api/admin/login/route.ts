import { NextRequest, NextResponse } from 'next/server';
import { signAdminToken, validateAdminCredentials } from '@/lib/auth';

export async function POST(req: NextRequest) {
  try {
    const { email, password } = await req.json();

    if (!email || !password) {
      return NextResponse.json(
        { error: 'Please provide both email and password' },
        { status: 400 }
      );
    }

    const isValid = validateAdminCredentials(email, password);

    if (!isValid) {
      return NextResponse.json(
        { error: 'Invalid admin credentials' },
        { status: 401 }
      );
    }

    const token = signAdminToken(email);

    const response = NextResponse.json({
      success: true,
      message: 'Admin authentication successful',
      user: { email, role: 'admin' },
    });

    response.cookies.set({
      name: 'crafty_admin_token',
      value: token,
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 7 * 24 * 60 * 60, // 7 days
    });

    return response;
  } catch (error) {
    return NextResponse.json({ error: 'Authentication error' }, { status: 500 });
  }
}
