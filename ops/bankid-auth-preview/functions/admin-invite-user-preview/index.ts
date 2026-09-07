import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const SUPABASE_URL = Deno.env.get('SUPABASE_URL') ?? '';
function runtimeKey(name: 'SUPABASE_PUBLISHABLE_KEYS' | 'SUPABASE_SECRET_KEYS') {
  try { return JSON.parse(Deno.env.get(name) ?? '{}').default ?? ''; }
  catch { return ''; }
}
const SUPABASE_PUBLISHABLE_KEY = runtimeKey('SUPABASE_PUBLISHABLE_KEYS');
const SUPABASE_SECRET_KEY = runtimeKey('SUPABASE_SECRET_KEYS');
const PREVIEW_ORIGIN = /^https:\/\/deploy-preview-\d+--mycamino\.netlify\.app$/;

function allowedOrigin(origin: string | null) {
  return !!origin && PREVIEW_ORIGIN.test(origin);
}
function cors(origin: string) {
  return {
    'Access-Control-Allow-Origin': origin,
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Vary': 'Origin',
  };
}
function json(status: number, payload: Record<string, unknown>, origin = '') {
  return new Response(JSON.stringify(payload), {
    status,
    headers: { 'Content-Type': 'application/json', ...(origin ? cors(origin) : {}) },
  });
}
function jwtClaims(jwt: string) {
  try {
    const part = jwt.split('.')[1];
    const normalized = part.replace(/-/g, '+').replace(/_/g, '/');
    return JSON.parse(atob(normalized.padEnd(Math.ceil(normalized.length / 4) * 4, '=')));
  } catch {
    return {};
  }
}

Deno.serve(async (req: Request) => {
  const origin = req.headers.get('origin');
  if (!allowedOrigin(origin)) return json(403, { error: 'PREVIEW_ORIGIN_REQUIRED' });
  if (req.method === 'OPTIONS') return new Response('ok', { headers: cors(origin!) });
  if (req.method !== 'POST') return json(405, { error: 'METHOD_NOT_ALLOWED' }, origin!);

  if (!SUPABASE_URL || !SUPABASE_PUBLISHABLE_KEY || !SUPABASE_SECRET_KEY) {
    return json(500, { error: 'SERVER_CONFIG_MISSING' }, origin!);
  }

  const authHeader = req.headers.get('authorization') ?? '';
  const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : '';
  if (!token) return json(401, { error: 'AUTH_REQUIRED' }, origin!);

  const claims = jwtClaims(token);
  if (claims.aal !== 'aal2') return json(403, { error: 'MFA_REQUIRED' }, origin!);

  const caller = createClient(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY, {
    global: { headers: { Authorization: `Bearer ${token}` } },
    auth: { persistSession: false, autoRefreshToken: false },
  });
  const admin = createClient(SUPABASE_URL, SUPABASE_SECRET_KEY, {
    auth: { persistSession: false, autoRefreshToken: false },
  });

  const { data: userData, error: userError } = await caller.auth.getUser(token);
  if (userError || !userData.user) return json(401, { error: 'AUTH_INVALID' }, origin!);

  const { data: grants, error: grantError } = await admin
    .from('role_grants')
    .select('id,role_code,revoked_at,valid_from,valid_until')
    .eq('user_id', userData.user.id)
    .eq('role_code', 'system_admin');
  if (grantError) return json(403, { error: 'ROLE_CHECK_FAILED' }, origin!);
  const now = Date.now();
  const active = (grants ?? []).some((g: any) =>
    !g.revoked_at &&
    (!g.valid_from || new Date(g.valid_from).getTime() <= now) &&
    (!g.valid_until || new Date(g.valid_until).getTime() > now)
  );
  if (!active) return json(403, { error: 'SYSTEM_ADMIN_REQUIRED' }, origin!);

  let body: any = {};
  try { body = await req.json(); } catch { return json(400, { error: 'INVALID_JSON' }, origin!); }
  const email = String(body.email ?? '').trim().toLowerCase();
  if (!body.testOnly) return json(400, { error: 'TEST_ONLY_CONFIRMATION_REQUIRED' }, origin!);
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || email.length > 254) {
    return json(400, { error: 'INVALID_EMAIL' }, origin!);
  }

  const redirectTo = `${origin}/portal/welcome.html`;
  const { data, error } = await admin.auth.admin.inviteUserByEmail(email, {
    redirectTo,
    data: { camino_test_track: 'bankid-auth-preview-20260907' },
  });

  if (error) {
    const alreadyExists = /already|registered|exists/i.test(error.message ?? '');
    if (alreadyExists) {
      return json(409, {
        error: 'USER_ALREADY_EXISTS',
        loginUrl: `${origin}/portal/`,
        redirectTo,
      }, origin!);
    }
    return json(400, { error: 'INVITE_FAILED' }, origin!);
  }

  const invitedUserId = data.user?.id ?? null;
  const { error: auditError } = await admin.from('audit_events').insert({
    actor_user_id: userData.user.id,
    action: 'USER_INVITED',
    resource_type: 'auth_user',
    resource_id: invitedUserId,
    purpose: 'bankid_auth_preview_synthetic_test',
    metadata: {
      preview_only: true,
      redirect_to: redirectTo,
      test_track: 'bankid-auth-preview-20260907',
    },
  });
  if (auditError) {
    console.error('preview invite audit failed', auditError.message);
    return json(500, {
      error: 'INVITE_AUDIT_FAILED',
      inviteCreated: true,
      invitedUserId,
      redirectTo,
      previewOnly: true,
    }, origin!);
  }

  return json(200, {
    ok: true,
    invitedUserId,
    redirectTo,
    previewOnly: true,
    auditPersisted: true,
  }, origin!);
});
