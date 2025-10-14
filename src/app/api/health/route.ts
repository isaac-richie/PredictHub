import { NextResponse } from 'next/server';

// Configure for Vercel serverless
export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const maxDuration = 30;

export async function GET() {
  try {
    const diagnostics = {
      timestamp: new Date().toISOString(),
      apis: {} as Record<string, any>,
    };

    // Test Polymarket API
    try {
      const polyRes = await fetch('https://gamma-api.polymarket.com/markets?limit=1&closed=false', {
        signal: AbortSignal.timeout(10000),
      });
      diagnostics.apis.polymarket = {
        status: polyRes.status,
        ok: polyRes.ok,
        error: polyRes.ok ? null : await polyRes.text()
      };
    } catch (error) {
      diagnostics.apis.polymarket = {
        status: 'error',
        error: error instanceof Error ? error.message : String(error)
      };
    }

    // Test LimitlessLabs API
    try {
      const limitlessRes = await fetch('https://api.limitless.exchange/markets/active?page=1&limit=1', {
        signal: AbortSignal.timeout(10000),
      });
      diagnostics.apis.limitless = {
        status: limitlessRes.status,
        ok: limitlessRes.ok,
        error: limitlessRes.ok ? null : await limitlessRes.text()
      };
    } catch (error) {
      diagnostics.apis.limitless = {
        status: 'error',
        error: error instanceof Error ? error.message : String(error)
      };
    }

    return NextResponse.json(diagnostics, { status: 200 });
  } catch (error) {
    return NextResponse.json({ 
      error: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString()
    }, { status: 500 });
  }
}

