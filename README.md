# Hivewise

Hivewise is a friendly, voice-first hive management prototype for beekeepers managing multiple apiaries. It keeps hive health, inspections, and tasks in one place and includes an assistant panel designed for hands-free field updates.

## Run locally

No build step is required. Open `index.html` directly, or serve the directory:

```bash
python3 -m http.server 4173
```

Then visit <http://localhost:4173>.

## Included interactions

- Select an apiary and switch between hive records.
- Review health metrics, recent inspections, and open tasks.
- Start a simulated voice session and add a transcribed hive note.
- Ask the assistant common beekeeping questions.
- Add and complete hive tasks.
