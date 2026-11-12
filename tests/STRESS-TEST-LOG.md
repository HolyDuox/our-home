# Our Home app: stress test log

## Run 1 (12 Nov 2026, app version 22)
Faults found and fixed in version 23:
1. Data would stop saving after ~3 years of use (phone quick-storage 5 MB cap). Main copy moved to IndexedDB; tested to 10 MB+.
2. Names with an apostrophe (e.g. "Adam's") crashed some buttons (grocery list chips, WhatsApp list, milestones, vaccines).
3. Baby "Log feed" opened the activity feed (two functions had the same name).
4. Vaccine due dates one day early in Malaysia time (UTC conversion).
5. Payments on the 31st drifted (31 Jan + 3 months = 1 May). Now clamps to month end.
6. 29 Feb birthdays/anniversaries skipped in normal years. Now shown on 28 Feb.
7. Child with a future birth date showed a negative age. Now "arriving <date>".
8. Very long text pushed screens sideways; calendar too wide on 320px phones.
9. Backups did not include photos. Now included and restored.
10. PIN: unlimited guesses and one-tap removal. Now 30s lockout after 5 wrong tries; "Forgot PIN" asks the start date. Also fixed: PIN must wait for the full data to load.

## Run 2 (12 Nov 2026, version 23, full re-run, new random seeds)
All scripts pass, 0 page errors. Log: rerun-2026-11-12.log
- a_smoke: every screen x light/dark x 320/390/430/768 px x empty/with data
- b_heavy: ~3 years of data, slowest screen 95 ms, reload 0.25 s, 402 photos
- b2_storage: 10 MB data survives reloads; old-version data migrates
- c_hostile: 2,602 taps with apostrophes, emoji, HTML, 300-letter words, Arabic
- d_edge: Malaysia time at New Year, 29 Feb, month-end, 6 am
- e_monkey: 36,000 random taps/fills (seeds 11-16), data intact after reload
- f_pin_backup: PIN lockout, forgot-PIN, backup with photos, restore, bad file, old-version backup
- (The "QuotaExceededError" line in b_heavy is the test proving the old 5 MB limit exists; the app no longer relies on it.)

## Not covered yet (needs real devices / go-live)
- Real iPhone Safari and Red Magic Chrome (tests use desktop Chromium engine)
- Two phones syncing at the same time (Supabase), offline then back online
- Real push notifications
