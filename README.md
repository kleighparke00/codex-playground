# Sip Circle

Sip Circle is a cheerful, browser-only water tracker for a small workplace team. Each demo teammate has an email-based profile, a personal daily goal, quick and custom water logging, undo, supportive team progress, and same-browser live activity notifications.

## Preview locally

No install or build step is needed. Start a static server:

```bash
npm start
```

Open <http://localhost:4173>. The login page previews without credentials, but account actions require the setup below.

## Production setup

Choose a teammate and use the prefilled demo email. Data is stored in `localStorage`; the signed-in profile is kept in `sessionStorage`. Open a second tab with another profile to see live team updates via `BroadcastChannel`.

## Version 1 notes

- This prototype intentionally has no backend, real authentication, or external data service.
- Email matching provides a simple personal demo login, not secure authentication.
- Team data and notifications are shared between tabs in the same browser and persist locally.
