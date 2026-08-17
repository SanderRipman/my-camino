import { createClient } from 'npm:@supabase/supabase-js@2'

const allowedOrigins = new Set([
  'https://www.aidme.no',
  'https://aidme.no',
  'https://aidme-public-preview.netlify.app',
  'https://dev.aidme.no',
  'http://localhost:8888',
  'http://localhost:3000',
])
const interestTypes = new Set(['PARTICIPANT','PARTNER','FINANCIER','PROFESSIONAL','OTHER'])
const contactMethods = new Set(['EMAIL','PHONE'])
const encoder = new TextEncoder()

function headers(req: Request) {
  const origin = req.headers.get('origin') ?? ''
  return {
    'Access-Control-Allow-Origin': allowedOrigins.has(origin) ? origin : 'https://www.aidme.no',
    'Access-Control-Allow-Headers': 'content-type, x-client-info',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Content-Type': 'application/json',
    'Cache-Control': 'no-store',
    'Vary': 'Origin',
  }
}
function reply(req: Request, status: number, payload: Record<string, unknown>) {
  return new Response(JSON.stringify(payload), { status, headers: headers(req) })
}
function firstIp(req: Request) {
  return (req.headers.get('cf-connecting-ip') || req.headers.get('x-forwarded-for')?.split(',')[0] || '').trim()
}
async function sha256(value: string) {
  const digest = await crypto.subtle.digest('SHA-256', encoder.encode(value))
  return [...new Uint8Array(digest)].map(b => b.toString(16).padStart(2, '0')).join('')
}
async function verifyTurnstile(token: string, ip: string, secret: string) {
  const form = new FormData()
  form.set('secret', secret)
  form.set('response', token)
  if (ip) form.set('remoteip', ip)
  const res = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', { method: 'POST', body: form })
  if (!res.ok) return false
  const json = await res.json()
  return json?.success === true
}

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: headers(req) })
  if (req.method !== 'POST') return reply(req, 405, { error: 'METHOD_NOT_ALLOWED' })

  const enabled = Deno.env.get('PUBLIC_INTAKE_ENABLED') === 'true'
  const turnstileSecret = Deno.env.get('TURNSTILE_SECRET_KEY') ?? ''
  const rateSalt = Deno.env.get('INTAKE_RATE_SALT') ?? ''
  if (!enabled || !turnstileSecret || !rateSalt) return reply(req, 503, { error: 'INTAKE_NOT_ENABLED' })

  try {
    const origin = req.headers.get('origin') ?? ''
    if (!allowedOrigins.has(origin)) return reply(req, 403, { error: 'ORIGIN_NOT_ALLOWED' })

    const body = await req.json()
    const name = String(body?.name ?? '').trim().slice(0, 120)
    const email = String(body?.email ?? '').trim().toLowerCase().slice(0, 254)
    const phone = String(body?.phone ?? '').trim().slice(0, 40)
    const interestType = String(body?.interestType ?? '').toUpperCase()
    const preferredContact = String(body?.preferredContact ?? 'EMAIL').toUpperCase()
    const privacyVersion = String(body?.privacyNoticeVersion ?? '').trim().slice(0, 80)
    const locale = String(body?.locale ?? 'nb').toLowerCase().slice(0, 8)
    const turnstileToken = String(body?.turnstileToken ?? '')

    if (!name || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || !interestTypes.has(interestType) || !contactMethods.has(preferredContact) || !privacyVersion || !turnstileToken) {
      return reply(req, 400, { error: 'INVALID_INPUT' })
    }
    if (preferredContact === 'PHONE' && !phone) return reply(req, 400, { error: 'PHONE_REQUIRED' })

    const ip = firstIp(req)
    const turnstileOk = await verifyTurnstile(turnstileToken, ip, turnstileSecret)
    if (!turnstileOk) return reply(req, 403, { error: 'CAPTCHA_FAILED' })

    const fingerprint = await sha256(`${rateSalt}:${ip || email}`)
    const now = new Date()
    const hourStart = new Date(now)
    hourStart.setUTCMinutes(0, 0, 0)

    const secret = JSON.parse(Deno.env.get('SUPABASE_SECRET_KEYS') ?? '{}').default
    if (!secret) throw new Error('Missing Supabase secret key')
    const admin = createClient(Deno.env.get('SUPABASE_URL')!, secret, { auth: { persistSession: false } })

    const { data: rateRow, error: rateReadError } = await admin
      .from('intake_rate_limits')
      .select('request_count')
      .eq('fingerprint_hash', fingerprint)
      .eq('window_start', hourStart.toISOString())
      .maybeSingle()
    if (rateReadError) throw rateReadError
    if ((rateRow?.request_count ?? 0) >= 5) return reply(req, 429, { error: 'RATE_LIMITED' })

    const { error: rateWriteError } = await admin.from('intake_rate_limits').upsert({
      fingerprint_hash: fingerprint,
      window_start: hourStart.toISOString(),
      request_count: (rateRow?.request_count ?? 0) + 1,
      updated_at: now.toISOString(),
    }, { onConflict: 'fingerprint_hash,window_start' })
    if (rateWriteError) throw rateWriteError

    const { data: org, error: orgError } = await admin.from('organizations').select('id').eq('name','AidMe VIDA').limit(1).maybeSingle()
    if (orgError || !org) throw orgError ?? new Error('Organization not found')

    const { data: intake, error: intakeError } = await admin.from('intakes').insert({
      organization_id: org.id,
      source: 'aidme.no',
      status: 'NEW',
      contact_name: name,
      contact_email: email,
      contact_phone: phone || null,
      interest_text: interestType,
      privacy_notice_version: privacyVersion,
    }).select('id,received_at').single()
    if (intakeError) throw intakeError

    const { error: taskError } = await admin.from('tasks').insert({
      organization_id: org.id,
      title: 'Ny interessehenvendelse',
      description: `Kanal: ${preferredContact}. Type: ${interestType}. Språk: ${locale}.`,
      status: 'OPEN',
      priority: 2,
      task_type: 'INTAKE_TRIAGE',
    })
    if (taskError) throw taskError

    await admin.from('audit_events').insert({
      organization_id: org.id,
      action: 'PUBLIC_INTAKE_RECEIVED',
      resource_type: 'intake',
      resource_id: intake.id,
      purpose: 'Interest triage',
      metadata: { source: 'aidme.no', interestType, locale },
    })

    return reply(req, 201, { ok: true, reference: intake.id })
  } catch (error) {
    console.error(error)
    return reply(req, 500, { error: 'INTAKE_FAILED' })
  }
})
