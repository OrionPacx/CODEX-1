# Verification report

Run on 18 October 2026.

| Check | Result |
|---|---|
| Parser | Passed: 7 Day files, 91 schedule rows parsed |
| Source coverage verifier | Passed: 248/248 schedule time/title, stamp, faculty-question and counter checks present in `data.js` |
| Passport inventory | Passed: 40 stamp designs (9 + 7 + 9 + 5 + 6 + 2 + 2) |
| Scheduling engine test | Passed: extend cascade and clock formatting (`node engine.test.js`) |
| JavaScript syntax | Passed: `node --check app.js` and `node --check engine.js` |
| Browser smoke test | Passed: local static site loaded with an Approved plan, desktop timeline controls and 360 px responsive CSS reviewed |
| Open Graph asset | Passed: `assets/og-image.png` is 1200×630 and 295,312 bytes |

## Manual management-demo checks included

- Total students, country counts, team count, weather mode, scenario flags, comparison times, reset, share, local save, change log, download text/CSV, day controls and same-day replacement flow are implemented.
- Day 6 remains management-run; its programme options and source wording are visible.
- The timeline’s timing engine supports extend, shorten, delay, remove, restore and replace operations with a cascading re-time.

## Constraints / remaining validation after deployment

Use the actual final URL for a final WhatsApp preview check (WhatsApp caches previews). The browser smoke test is local; no public host or GitHub account was available in the workspace at test time.

