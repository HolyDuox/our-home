# Our Home

A private family organiser for two phones (iPhone + Android), installable from the browser.

- Open the app link, then **Add to Home Screen** (iPhone Safari: Share → Add to Home Screen; Android Chrome: ⋮ → Install app).
- Sign in under **More → Settings → Sync**. One person starts the household, the other joins with its 6-letter code.
- Data lives in Supabase behind each person's login (see `supabase-setup.sql` for the privacy rules). Nothing personal is stored in this repository.

`supabase.js` is the official supabase-js 2.118.0 browser build. `tests/` holds the Playwright stress tests.
