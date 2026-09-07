# Sip Circle

Sip Circle is a cheerful, browser-only water tracker for a small workplace team. Each demo teammate has an email-based profile, a personal daily goal, quick and custom water logging, undo, supportive team progress, and same-browser live activity notifications.

## Preview locally

No install or build step is needed. Start a static server:

```bash
python3 -m http.server 4173
```

Then visit <http://localhost:4173>.

Choose a teammate and use the prefilled demo email. Data is stored in `localStorage`; the signed-in profile is kept in `sessionStorage`. Open a second tab with another profile to see live team updates via `BroadcastChannel`.

## Version 1 notes

- This prototype intentionally has no backend, real authentication, or external data service.
- Email matching provides a simple personal demo login, not secure authentication.
- Team data and notifications are shared between tabs in the same browser and persist locally.
