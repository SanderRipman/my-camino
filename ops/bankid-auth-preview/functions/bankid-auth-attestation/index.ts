import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const SUPABASE_URL = Deno.env.get('SUPABASE_URL') ?? '';
function runtimeKey(name: 'SUPABASE_PUBLISHABLE_KEYS') {
  try { return JSON.parse(Deno.env.get(name) ?? '{}').default ?? ''; }
  catch { return ''; }
}
const SUPABASE_PUBLISHABLE_KEY = runtimeKey('SUPABASE_PUBLISHABLE_KEYS');
const BANKID_PROVIDER = 'custom:bankid-preprod';
const PREVIEW_ORIGIN = /^https:\/\/deploy-preview-\d+--mycamino\.netlify\.app$/;
const BANKID_HIGH = 'urn:bankid:bid;LOA=4';
const BANKID_BIOMETRIC = 'urn:bankid:bis;LOA=3';

function allowedOrigin(origin: string | null) { return !!origin && PREVIEW_ORIGIN.test(origin); }
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
    headers: { 'Content-Type': 'application/json', 'Cache-Control': 'no-store', ...(origin ? cors(origin) : {}) },
  });
}
function claims(jwt: string) {
  try {
    const part = jwt.split('.')[1];
    const normalized = part.replace(/-/g, '+').replace(/_/g, '/');
    return JSON.parse(atob(normalized.padEnd(Math.ceil(normalized.length / 4) * 4, '=')));
  } catch { return {}; }
}
function readAcr(identity: any) {
  const data = identity?.identity_data ?? {};
  const custom = data?.custom_claims ?? {};
  return typeof data.acr === 'string' ? data.acr : (typeof custom.acr === 'string' ? custom.acr : null);
}
function classifyAcr(acr: string | null) {
  if (acr === BANKID_HIGH) return { assurance: 'BANKID_HIGH_LOA4', verified: true };
  if (acr === BANKID_BIOMETRIC) return { assurance: 'BANKID_BIOMETRIC_LOA3', verified: true };
  return { assurance: 'BANKID_ASSURANCE_UNVERIFIED', verified: false };
}

Deno.serve(async (req: Request) => {
  const origin = req.headers.get('origin');
  if (!allowedOrigin(origin)) return json(403, { error: 'PREVIEW_ORIGIN_REQUIRED' });
  if (req.method === 'OPTIONS') return new Response('ok', { headers: cors(origin!) });
  if (req.method !== 'POST') return json(405, { error: 'METHOD_NOT_ALLOWED' }, origin!);
  if (!SUPABASE_URL || !SUPABASE_PUBLISHABLE_KEY) {
    return json(500, { error: 'SERVER_CONFIG_MISSING' }, origin!);
  }

  let body: any = {};
  try { body = await req.json(); } catch { return json(400, { error: 'INVALID_JSON' }, origin!); }
  if (body.previewTest !== true) return json(400, { error: 'PREVIEW_TEST_REQUIRED' }, origin!);

  const authHeader = req.headers.get('authorization') ?? '';
  const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : '';
  if (!token) return json(401, { error: 'AUTH_REQUIRED' }, origin!);

  const caller = createClient(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY, {
    global: { headers: { Authorization: `Bearer ${token}` } },
    auth: { persistSession: false, autoRefreshToken: false },
  });
  const { data: verified, error: verifyError } = await caller.auth.getUser(token);
  if (verifyError || !verified.user) return json(401, { error: 'AUTH_INVALID' }, origin!);

  const { data: identityData, error: identityError } = await caller.auth.getUserIdentities();
  if (identityError) return json(500, { error: 'IDENTITY_READ_FAILED' }, origin!);
  const identity = (identityData?.identities ?? []).find((i: any) => i.provider === BANKID_PROVIDER);
  const acr = readAcr(identity);
  const classified = classifyAcr(acr);
  const aal = claims(token).aal === 'aal2' ? 'aal2' : 'aal1';

  return json(200, {
    linked: !!identity,
    provider: identity ? BANKID_PROVIDER : null,
    assurance: identity ? classified.assurance : 'BANKID_NOT_LINKED',
    acrVerified: !!identity && classified.verified,
    supabaseAal: aal,
    requiresTotpStepUp: aal !== 'aal2',
    authorizationEffect: 'NONE_RLS_AND_ROLE_SCOPE_UNCHANGED',
    piiReturned: false,
  }, origin!);
});
