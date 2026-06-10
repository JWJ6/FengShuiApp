export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const res = await fetch('https://api.testyourfortune.com/api/health', {
      signal: AbortSignal.timeout(10000),
    });
    const data = await res.json();
    return Response.json({ backend: data.status, pinged_at: new Date().toISOString() });
  } catch {
    return Response.json({ backend: 'unreachable', pinged_at: new Date().toISOString() }, { status: 502 });
  }
}
