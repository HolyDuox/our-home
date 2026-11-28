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

## Run 3 — 2026-11-18 (Wealth, gold grams, commitment reordering, Entertainment)
New suite `r_newstress.js` (46 checks): gold price/weight validation, no-price state, 1,000,000 g / 0.001 g / unknown purity, weird names,
investment maths (0%, 12% monthly compounding, ASB example, 31st/future/1970 start dates, 100%/yr extreme), investment <-> Commitment link,
300 gold + 300 investments (82 ms render), 80 commitments with 200 random moves + 6 long mouse drags with auto-scroll, tap without drag,
new item from other phone, clashing order numbers from two phones, reset to due date, order kept after reload and included in sync,
500 Entertainment expenses, 320px and dark mode.
Found and fixed:
1. Numbers typed with a decimal comma (5,5 on some Android keyboards) were read as 5. Now all money/number fields read 5,5 as 5.5 and 1,000 as 1000.
2. Very small gold weights (0.001 g) displayed as 0 g. Now shows 3 decimals under 1 g.
Full suite re-run after fixes: all clean (smoke, heavy, storage, hostile 3447 clicks, edge dates, monkey 3000 steps, PIN/backup, sync 16 checks, plans, wealth, arrange, 46/46 new).

## Run 4 — 2026-11-27 (Exercise, Body + health check, routine photos, holidays)
New suite `z_stress4.js` (41 checks): weight chart edge cases (identical values, same dates, broken dates, 1e9 kg), health-check
boundaries (BMI 22.9 / 23.7, waist÷height 0.50), junk values, inline height form, same-day merge per person, 1000 rapid saves,
500 routines / 4000 workouts / 300 goals, deleted routines, week Mon–Sun edges, routine with 20 photos, cancel without save,
backup/restore incl. routine photos, sync round-trip of all new collections, older data without the new sections, all holidays shown.
Found and fixed:
1. Weight chart drew broken lines (console errors) when an entry had an invalid date. Bad dates are now skipped.
2. "This week" took 0.7 s with ~5 years of workouts (streak scanned the log once per week). Now one pass: 15 ms.
3. Invalid dates showed as "Invalid Date". Now "No date".
Also: sync test now serves the app over http; the earlier occasional failure was headless Chromium dropping file:// localStorage on reload, not an app bug (8/8 clean).
Full suite re-run: all clean (hostile 4169 clicks, monkey 3000 steps, sync 3× 16/16, 46/46 + 41/41 targeted).

## Run 5 — review pass (2026-11-27, v2026.11.27-h)
Looked for things missed in earlier runs. Gaps found and fixed:
1. Photos removed from a routine or note were left on the phone; they are now freed when you save.
2. Health check silently used old measurements; it now warns when a number it uses is over 60 days old.
3. Waist ÷ hips had no "how far to go"; it now says how many cm off the waist reaches healthy.
New test zz_review.js. Full suite re-run (28 scripts incl. sync ×3): 0 fails. Log: rerun-2026-11-27b.log

## Repeating events (2026-11-28, v2026.11.28-a)
Events can repeat weekly, monthly or yearly, with an optional end date and "skip this date only". Monthly on the 31st falls on the last day of short months; yearly 29 Feb falls on 28 Feb. New test zz_repeat.js (19 checks; first run caught a slow upcoming list with many repeats, fixed: 2059 ms -> 16 ms). Full suite: 0 fails.

## Run 7: repeating events stress (2026-11-28, v2026.11.28-b)
zz_repeat2.js: 8,940 repeat dates per time zone checked against an independent calculation (315 start dates incl. 29 Feb, 29/30/31 Jan, month ends; random windows, until dates, skips; every day of Feb-Mar in 2025-2028, 2032, 2100), in 6 time zones; 2100 not leap, 2000 leap; calendar UI checks for Feb/leap/month-end/new year; edit behaviour.
Found + fixed: (1) a repeating event starting more than ~2 years ahead did not show in Upcoming; (2) shared date helper isoOf could give the wrong day on daylight-saving change days (not Malaysia, but e.g. New Zealand) - now uses local date parts. Full suite: 0 fails.
