// Supabase Edge Function — send-confirmation
// Sends a booking confirmation email via Gmail SMTP (no domain needed)
// Secrets required (Supabase → Edge Functions → Secrets):
//   GMAIL_APP_PASSWORD — 16-char app password from myaccount.google.com

import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import nodemailer from "npm:nodemailer@6.9.7"

const cors = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

const GMAIL_USER = 'hello@example-coaching.com'

serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: cors })

  try {
    const { firstName, email, dateStr, hour, duration } = await req.json()

    const APP_PASSWORD = Deno.env.get('GMAIL_APP_PASSWORD')
    if (!APP_PASSWORD) throw new Error('GMAIL_APP_PASSWORD secret not set')

    // Format date and time for display
    const [y, m, d] = dateStr.split('-').map(Number)
    const displayDate = new Date(y, m - 1, d).toLocaleDateString('en-IN', {
      weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
    })
    const h12     = hour === 0 ? 12 : hour > 12 ? hour - 12 : hour
    const suffix  = hour >= 12 ? 'PM' : 'AM'
    const dispTime = `${String(h12).padStart(2, '0')}:00 ${suffix} IST`

    const html = `<!DOCTYPE html>
<html>
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#FBF9F6;font-family:Arial,sans-serif;">
<div style="max-width:560px;margin:40px auto;background:#ffffff;border:1px solid #D7CDCC;border-radius:16px;overflow:hidden;">

  <div style="background:#3D6B4A;padding:36px 40px;text-align:center;">
    <p style="color:#C8D5C0;font-size:12px;letter-spacing:.12em;text-transform:uppercase;margin:0 0 8px;">Jordan Cole &middot; Metabolic Health Coach</p>
    <h1 style="color:#ffffff;font-size:26px;margin:0;font-weight:600;">You're confirmed &#10003;</h1>
  </div>

  <div style="padding:40px;">
    <p style="color:#3A443F;font-size:16px;margin:0 0 8px;">Hi ${firstName},</p>
    <p style="color:#3A443F;font-size:16px;margin:0 0 28px;line-height:1.7;">
      Your free discovery call has been booked. Here are your details:
    </p>

    <div style="background:#EBF2E8;border-radius:12px;padding:24px 28px;margin-bottom:28px;">
      <p style="color:#3D6B4A;font-size:11px;font-weight:700;letter-spacing:.1em;text-transform:uppercase;margin:0 0 14px;">Booking details</p>
      <table style="border-collapse:collapse;width:100%;">
        <tr>
          <td style="padding:6px 0;color:#3A443F;font-size:14px;width:28px;">&#128197;</td>
          <td style="padding:6px 0;color:#1E2D24;font-size:15px;font-weight:600;">${displayDate}</td>
        </tr>
        <tr>
          <td style="padding:6px 0;color:#3A443F;font-size:14px;">&#128336;</td>
          <td style="padding:6px 0;color:#1E2D24;font-size:15px;">${dispTime} &nbsp;&middot;&nbsp; ${duration} minutes</td>
        </tr>
        <tr>
          <td style="padding:6px 0;color:#3A443F;font-size:14px;">&#128205;</td>
          <td style="padding:6px 0;color:#1E2D24;font-size:15px;">Online &mdash; Google Meet / WhatsApp Video</td>
        </tr>
      </table>
    </div>

    <p style="color:#3A443F;font-size:15px;line-height:1.7;margin:0 0 24px;">
      Jordan will send you the meeting link before your call.
      Feel free to reach out on WhatsApp if you have any questions beforehand.
    </p>

    <div style="text-align:center;margin:0 0 36px;">
      <a href="https://wa.me/15550100100"
         style="display:inline-block;background:#3D6B4A;color:#ffffff;padding:14px 36px;border-radius:50px;text-decoration:none;font-size:15px;font-weight:600;">
        Message Jordan
      </a>
    </div>

    <hr style="border:none;border-top:1px solid #D7CDCC;margin:0 0 24px;">
    <p style="color:#3A443F;font-size:12px;opacity:.55;margin:0;text-align:center;line-height:1.8;">
      Jordan Cole &middot; Metabolic Health Coach<br>
    </p>
  </div>

</div>
</body>
</html>`

    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: GMAIL_USER,
        pass: APP_PASSWORD,
      },
    })

    await transporter.sendMail({
      from: `"Jordan Cole" <${GMAIL_USER}>`,
      to:      email,
      subject: `Your discovery call is confirmed — ${displayDate}`,
      html,
    })

    return new Response(JSON.stringify({ ok: true }), {
      headers: { ...cors, 'Content-Type': 'application/json' },
    })

  } catch (err) {
    console.error('send-confirmation error:', err)
    return new Response(JSON.stringify({ ok: false, error: err.message }), {
      status: 400,
      headers: { ...cors, 'Content-Type': 'application/json' },
    })
  }
})
