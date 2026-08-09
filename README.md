# Daily Drip

A cheerful, beginner-friendly prototype for tracking a team's daily water intake. It uses sample data and runs entirely in the browser with HTML, CSS, and JavaScript.

## Preview the app

You can open `index.html` directly in a browser, or start a small local server from this folder:

```bash
python3 -m http.server 8000
```

Then visit <http://localhost:8000>.

## Prototype notes

- Choose one of five sample colleagues.
- Add water with a quick-add button or enter a custom number of fluid ounces.
- Use **Undo last sip** to remove the selected person's newest entry.
- Click the current daily goal to open a separate goal-setting page.
- Water entries are sample data held in memory and reset on refresh. Goal changes are kept in this browser so they remain available when moving between pages.
