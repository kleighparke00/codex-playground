# Sip Circle

Sip Circle is a cheerful PIN-based team water tracker with personal daily goals, quick water entry, undo, and supportive team progress. It is plain HTML, CSS, and JavaScript with no external services.

## Local preview

```bash
npm start
```

Open <http://localhost:4173>. Create the first profile with a name, 4-digit PIN, and daily goal. Every new profile and water entry begins empty—there is no sample data.

Profiles and water entries are stored only in the current browser. PINs are salted and hashed before storage, but this local-only PIN gate is intended for a trusted shared device and is not a substitute for server authentication. Open a second tab to see live teammate updates in the same browser.
