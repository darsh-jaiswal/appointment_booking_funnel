// ================================================================
// config.js — YOUR SETTINGS FILE
// ================================================================
// This file is read by funnel.html, book.html, and confirmed.html.
// Fill in your Supabase details below (you'll get these in Step 1
// of the setup guide). Everything else you can customise too.
// ================================================================

// --- SUPABASE ---
// SUPABASE_URL and SUPABASE_ANON_KEY are defined in secrets.js (not committed).

// --- YOUTUBE VIDEO ---
// Paste just the ID part of your YouTube video URL.
// Example: https://youtube.com/watch?v=dQw4w9WgXcQ → ID = dQw4w9WgXcQ
// Leave blank if you don't have a video yet.
const YOUTUBE_VIDEO_ID = ''

// --- BOOKING AVAILABILITY ---
// Which hours are you available? (24-hour IST format)
// 8 = 8:00 AM,  13 = 1:00 PM,  16 = 4:00 PM
const AVAILABLE_HOURS = [8, 9, 10, 11, 12, 13, 14, 15, 16]

// Which days of the week can people book?
// 0 = Sunday, 1 = Monday, 2 = Tuesday, 3 = Wednesday,
// 4 = Thursday, 5 = Friday, 6 = Saturday
const AVAILABLE_DAYS = [1, 2, 3, 4, 5]   // Monday–Friday

// How many days ahead can people book?
const BOOKING_WINDOW_DAYS = 30

// How long is each session? (minutes)
const SESSION_DURATION_MINUTES = 20

// --- COACH DETAILS (used on confirmation page) ---
const COACH_NAME      = 'Ayush'
const COACH_WHATSAPP  = '15550100100'   // no + sign, no spaces
const COACH_EMAIL     = 'hello@example-coaching.com'
const MEETING_LOCATION = 'Online via Google Meet or WhatsApp Video'
