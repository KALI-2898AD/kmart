import { verify } from 'jsonwebtoken';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

const JWT_SECRET = process.env.JWT_SECRET || "fallback_secret_key_for_dev";

export function getAuthUser(req) {
  const token = req.cookies.get('token')?.value || req.headers.get('Authorization')?.split(' ')[1];
  
  if (!token) return null;

  try {
    const decoded = verify(token, JWT_SECRET);
    return decoded; // Returns { userId, role, iat, exp }
  } catch (error) {
    return null;
  }
}

export function requireAdmin(req) {
  const user = getAuthUser(req);
  if (!user || user.role !== 'admin') {
    return NextResponse.json({ error: 'Unauthorized: Admin access required' }, { status: 403 });
  }
  return null; // Return null if authorized, otherwise return the error response
}

export function requireAuth(req) {
  const user = getAuthUser(req);
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized: Please log in' }, { status: 401 });
  }
  return null;
}
