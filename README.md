# Appointment Booking Funnel

**Live site:** [diabetesresetprotocol.com](https://www.diabetesresetprotocol.com). I designed and built this site, and the booking and lead-qualification system behind it, for Ayush, a diabetes and metabolic health coach.

I built a booking and lead-qualification system for coaches, consultants, and counselors. A prospect books a call slot directly. The event lands on the coach's Google Calendar automatically, the visitor gets an add-to-calendar option, and a confirmation email goes out with no manual back-and-forth. Right after booking, they answer a short set of qualification questions, which are scored automatically, so by the time the coach opens their dashboard, every booked call already has a score attached and they know who's worth their full attention before they ever pick up the phone.

This case study is drawn from that real, currently-deployed build. The underlying pattern (book, qualify, score, auto-confirm) applies to any one-on-one service business, not just health coaching, which is why it's presented here as a general system. Some details are still intentionally left out; see [Note on client identity](#note-on-client-identity) below.

## Who can use this

Any profession where a first conversation is valuable, limited, and not every inquiry deserves the same amount of time.

- **Doctors** can use it to screen patients by symptom and urgency before a consultation slot is confirmed.
- **Health and fitness coaches** can use it to qualify serious clients before a discovery call. This is the actual use case it was built for.
- **Therapists and counselors** can use it to screen for fit and urgency before a first session.
- **Lawyers** can use it to filter case inquiries by case type and urgency before a paid consultation.
- **Financial advisors** can use it to qualify prospects by portfolio size or need before a planning call.
- **Real estate agents** can use it to pre-qualify buyers and sellers by budget and timeline before a viewing.
- **Career and academic consultants** can use it to screen students by goals and stage before an advising session.
- **Freelance consultants** (marketing, design, development) can use it to filter project inquiries by budget and scope before a sales call.
- **Recruiters** can use it to qualify candidates by role fit before a screening call.
- **Veterinarians** can use it to triage urgency before booking an appointment slot.
- **Immigration and tax consultants** can use it to sort inquiries by case complexity before a paid consultation.

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

Every file below is real code from the actual build, copied over as-is except for identity redaction (real name/contact info swapped for placeholders) and photo/logo assets removed. Nothing here is a mock-up or a rewrite.

**Short on time? Open these three:** [`supabase/functions/create-calendar-event/index.ts`](./supabase/functions/create-calendar-event/index.ts), the Google Calendar API integration and the single feature that took the most time to build; [`funnel.html`](./funnel.html) for the qualification quiz and scoring logic; and [`supabase/admin-auth-migration.sql`](./supabase/admin-auth-migration.sql) for the actual security fix described in [What I changed my mind about](#what-i-changed-my-mind-about).

| File | What it shows |
|---|---|
| [`index.html`](./index.html), [`style.css`](./style.css) | Landing page structure and the design system |
| [`script.js`](./script.js) | Client-side interaction logic, including quiz scoring |
| [`article-*.html`](.), [`article.css`](./article.css) | Content page architecture |
| [`funnel.html`](./funnel.html) | The qualification quiz itself: question flow, lead scoring, safety-flag logic |
| [`register.html`](./register.html), [`book.html`](./book.html), [`confirmed.html`](./confirmed.html) | The booking flow end to end: capture, slot selection, confirmation |
| [`video.html`](./video.html) | Pre-call video page shown to booked leads |
| [`config.js`](./config.js) | Site-wide config constants (coach name, contact links; values shown are placeholders) |
| [`admin-dashboard.html`](./admin-dashboard.html) | The admin view, now signed in via real Supabase Auth (`signInWithPassword`), not a shared secret |
| [`supabase/functions/create-calendar-event/index.ts`](./supabase/functions/create-calendar-event/index.ts) | Real Google Calendar API integration. Secrets loaded via `Deno.env.get()`, never hardcoded |
| [`supabase/functions/send-confirmation/index.ts`](./supabase/functions/send-confirmation/index.ts) | Real Gmail-send logic, same environment-variable pattern |
| [`supabase/admin-auth-migration.sql`](./supabase/admin-auth-migration.sql) | The actual migration that replaced the client-exposed admin secret with Supabase Auth (see [What I changed my mind about](#what-i-changed-my-mind-about)) |
| [`supabase/quiz-migration.sql`](./supabase/quiz-migration.sql) | Adds scoring columns to the leads table; the file's own comments show it superseding the old secret-based function |
| [`secrets.example.js`](./secrets.example.js) | The template for local secrets setup (placeholder values only, safe to commit by design) |
| [`CLAUDE.md`](./CLAUDE.md) | The project brief used to drive the Claude Code build |
| [`source-project.gitignore`](./source-project.gitignore), [`source-project.vercelignore`](./source-project.vercelignore) | The real deploy config from the source project, renamed here to avoid clashing with this repo's own. Worth a look: the comments explain exactly what's excluded from the public deploy and why |

## Built with Claude Code

This project was built with a `CLAUDE.md`-driven workflow, a written project brief that Claude Code reads at the start of every session so conventions and context persist without re-explaining them each time. That practice is consistent across my other projects; see [`personal-claude-skill`](https://github.com/darsh-jaiswal/personal-claude-skill) for a Claude Code Skill I authored along the same lines.

## What I changed my mind about

The admin-read path (viewing all leads) originally checked a shared secret value client-side rather than using proper session-based auth. It worked, but it's not how I'd build it today, and I've since replaced it with real Supabase Auth on the live production site. That's exactly the kind of tradeoff you don't notice until you've shipped it, looked back, and actually gone and fixed it.

## Note on client identity

This is real work for a real, operating health-coaching business, and the site above is genuinely mine to show. The actual repository behind the live site has not been made public and stays private; it contains the client's admin/lead-capture pages and database schema, which don't belong in a public portfolio piece regardless of whose name is on the project. This repo is a separate, purpose-built case study: real code, hand-picked and copied over from that build. Some operational documentation and all real user data are excluded. What's shown here is the reusable pattern and the genuine engineering behind it; not the original repository itself.
