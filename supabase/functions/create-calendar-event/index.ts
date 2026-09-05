// Supabase Edge Function — create-calendar-event
// Creates an event in the coach's Google Calendar when a client books a call.
// Secrets required (Supabase → Edge Functions → Secrets):
//   GOOGLE_CLIENT_ID     — from Google Cloud Console → OAuth 2.0 credentials
//   GOOGLE_CLIENT_SECRET — from Google Cloud Console → OAuth 2.0 credentials
//   GOOGLE_REFRESH_TOKEN — obtained once via OAuth Playground

import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const cors = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: cors })

  try {
    const { firstName, email, phone, dateStr, hour, duration } = await req.json()

    const CLIENT_ID     = Deno.env.get('GOOGLE_CLIENT_ID')
    const CLIENT_SECRET = Deno.env.get('GOOGLE_CLIENT_SECRET')
    const REFRESH_TOKEN = Deno.env.get('GOOGLE_REFRESH_TOKEN')

    if (!CLIENT_ID || !CLIENT_SECRET || !REFRESH_TOKEN) {
      throw new Error('Google Calendar secrets not configured')
    }

    // Exchange refresh token for a fresh access token
    const tokenRes = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        client_id:     CLIENT_ID,
        client_secret: CLIENT_SECRET,
        refresh_token: REFRESH_TOKEN,
        grant_type:    'refresh_token',
      }),
    })

    const tokenData = await tokenRes.json()
    if (!tokenData.access_token) {
      throw new Error(`Token exchange failed: ${JSON.stringify(tokenData)}`)
    }

    // Build start/end times in IST (UTC+5:30)
    const pad = (n: number) => String(n).padStart(2, '0')
    const startISO = `${dateStr}T${pad(hour)}:00:00+05:30`
    const endTotalMins = hour * 60 + duration
    const endHour = Math.floor(endTotalMins / 60)
    const endMin  = endTotalMins % 60
    const endISO  = `${dateStr}T${pad(endHour)}:${pad(endMin)}:00+05:30`

    const description = [
      `Client: ${firstName || '—'}`,
      email ? `Email: ${email}` : '',
      phone ? `Phone: +${phone}` : '',
      '',
      'Booked via example-coaching.com',
    ].filter(Boolean).join('\n')

    // Create the calendar event via Google Calendar API
    const calRes = await fetch(
      'https://www.googleapis.com/calendar/v3/calendars/primary/events',
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${tokenData.access_token}`,
          'Content-Type':  'application/json',
        },
        body: JSON.stringify({
          summary:     `Discovery Call — ${firstName || 'Client'}`,
          description,
          start: { dateTime: startISO, timeZone: 'Asia/Kolkata' },
          end:   { dateTime: endISO,   timeZone: 'Asia/Kolkata' },
        }),
      }
    )

    const calData = await calRes.json()
    if (!calRes.ok) {
      throw new Error(`Calendar API error: ${JSON.stringify(calData)}`)
    }

    return new Response(JSON.stringify({ ok: true, eventId: calData.id }), {
      headers: { ...cors, 'Content-Type': 'application/json' },
    })

  } catch (err) {
    console.error('create-calendar-event error:', err)
    return new Response(JSON.stringify({ ok: false, error: err.message }), {
      status: 400,
      headers: { ...cors, 'Content-Type': 'application/json' },
    })
  }
})
