# Sip Circle

Sip Circle is a real, shared team water tracker with verified email/password accounts, personal daily goals, realtime team progress, undo, and email notifications. The browser is plain HTML, CSS, and JavaScript; Supabase provides authentication, Postgres, row-level security, and realtime updates, while Resend delivers teammate notifications.

## Local preview

```bash
npm start
```

Open <http://localhost:4173>. The login page previews without credentials, but account actions require the setup below.

## Production setup

1. Create a Supabase project and run `supabase/migrations/20260907000000_initial_schema.sql` in its SQL editor (or with the Supabase CLI).
2. Enable email confirmation in Supabase Authentication and configure the production Site URL/redirect URLs.
3. Copy the project URL and public anon key into `config.js`. Never place the service-role key there.
4. Create a Resend account and verify the sending domain.
5. Set Edge Function secrets: `RESEND_API_KEY` and `NOTIFICATION_FROM_EMAIL` (for example, `Sip Circle <updates@example.com>`).
6. Deploy `supabase/functions/notify-water-update` with JWT verification enabled.
7. Serve the static files over HTTPS in production.

There is no seeded demo data. New verified accounts automatically receive a profile, and water entries begin at zero. Resend notifications go to every registered teammate except the person who logged the water.
