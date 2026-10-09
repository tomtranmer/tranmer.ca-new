import { NextRequest, NextResponse } from 'next/server';
import { forbiddenOriginResponse, isSameOrigin } from '@/lib/security';
import { endClientSession } from '@/lib/clientSession';

export async function POST(request: NextRequest) {
  if (!isSameOrigin(request)) return forbiddenOriginResponse();
  await endClientSession();
  return NextResponse.json({ ok: true });
}
