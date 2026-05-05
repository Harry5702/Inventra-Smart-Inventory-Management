import { supabase } from '../../lib/supabase';

export async function GET() {
  const startedAt = Date.now();

  try {
    const { error } = await supabase
      .from('categories')
      .select('id')
      .limit(1);

    if (error) {
      console.error('[db] connection failed:', error.message);
      return Response.json({ ok: false, error: error.message }, { status: 500 });
    }

    const elapsed = Date.now() - startedAt;
    console.log(`[db] connection ok (${elapsed}ms)`);
    return Response.json({ ok: true });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    console.error('[db] connection failed:', message);
    return Response.json({ ok: false, error: message }, { status: 500 });
  }
}
