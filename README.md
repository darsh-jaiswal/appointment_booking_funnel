# Coach Booking & Lead-Qualification Funnel

**Live site:** [diabetesresetprotocol.com](https://www.diabetesresetprotocol.com), the real, deployed production build this case study is drawn from.

I built a booking and lead-qualification system for coaches, consultants, and counselors. A prospect books a call slot directly. The event lands on the coach's Google Calendar automatically, the visitor gets an add-to-calendar option, and a confirmation email goes out with no manual back-and-forth. Right after booking, they answer a short set of qualification questions, which are scored automatically, so by the time the coach opens their dashboard, every booked call already has a score attached and they know who's worth their full attention before they ever pick up the phone.

This is a case study of a real, currently-deployed build for a health-coaching client, generalized here because the underlying pattern (book, qualify, score, auto-confirm) applies to any one-on-one service business. Client identity, contact details, and branding assets have been replaced with placeholders throughout this repo; see [Note on client identity](#note-on-client-identity) below.

## Demo

> 🎥 **Recording to be added.** A walkthrough of the live flow: slot booking, the event landing on Google Calendar, the confirmation email arriving, the qualification quiz, the automatic score. Captured directly rather than left for a visitor to trigger, since the booking step writes to a real calendar and sends from a real inbox. This way the full loop is provable without anyone but the site owner ever running it live.

## What I built

Full-stack: the frontend in this repo (landing page, content pages, quiz UI) plus the backend architecture described below.

## Architecture

- **Booking and two-way calendar sync.** A Supabase Edge Function calls the Google Calendar API (Google Cloud, OAuth 2.0 refresh-token flow) to create the event directly on the coach's calendar the moment a slot is booked, while the visitor gets their own add-to-calendar option.
- **Lead scoring.** Right after booking, the visitor answers a short set of qualification questions. The actual questions and scoring weights would look different for a coach, a consultant, or a counselor, since what makes a lead "serious" depends on the practice, but the pattern is the same: answers are run through scoring logic that flags serious prospects vs. low-intent ones automatically and attaches the result to that booking. This is the actual value proposition: by the time the coach looks at their dashboard, they already know who's worth their full attention before the call happens.
- **Automated confirmation email.** A second Edge Function sends a booking confirmation to the client automatically via Gmail SMTP, no manual follow-up required.
- **Data layer.** Postgres (Supabase) table storing quiz answers, computed lead score, and booking status.
- **Admin dashboard.** A single view giving the coach a full overview of every entry: scores, status, booking details, without touching the database directly.
- **Row-Level Security.** Public insert-only policy for lead capture. The admin-read path is intentionally not included as code in this repo (see below).

## Code in this repo

| File | What it shows |
|---|---|
| [`index.html`](./index.html), [`style.css`](./style.css) | Landing page structure and the design system |
| [`script.js`](./script.js) | Client-side interaction logic, including quiz scoring |
| [`article-*.html`](.), [`article.css`](./article.css) | Content page architecture |
| [`supabase/functions/create-calendar-event/index.ts`](./supabase/functions/create-calendar-event/index.ts) | Real Google Calendar API integration. Secrets loaded via `Deno.env.get()`, never hardcoded |
| [`supabase/functions/send-confirmation/index.ts`](./supabase/functions/send-confirmation/index.ts) | Real Gmail-send logic, same environment-variable pattern |
| [`CLAUDE.md`](./CLAUDE.md) | The project brief used to drive the Claude Code build |

## Built with Claude Code

This project was built with a `CLAUDE.md`-driven workflow, a written project brief that Claude Code reads at the start of every session so conventions and context persist without re-explaining them each time. That practice is consistent across my other projects; see [`personal-claude-skill`](https://github.com/darsh-jaiswal/personal-claude-skill) for a Claude Code Skill I authored along the same lines.

## What I'd change

The admin-read path (viewing all leads) used to check a shared secret value client-side rather than using proper session-based auth. That's since been hardened on the live production site. The better long-term fix is Supabase Auth with a Row-Level Security policy keyed to the authenticated user, rather than a shared secret at all, which is exactly the kind of tradeoff you don't notice until you've shipped it and looked back.

## Note on client identity

The original build is for a real, operating health-coaching business. The actual repository behind the live site has not been made public and stays private; it contains the client's admin/lead-capture pages, database schema, and identifying details that don't belong in a public portfolio piece. This repo is a separate, purpose-built case study: real code, hand-picked and copied over from that build, with every reference to the client's real name, contact details, and branding assets (logo, photography, business links) replaced with generic placeholders (`Jordan Cole`, placeholder email/phone/links, placeholder graphics). What's shown here is the reusable pattern and the genuine engineering behind it, not the client's business, and not the original repository itself.
