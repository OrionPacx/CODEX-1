# Deploy Global Campus Connect

This is a plain static website. It has no backend, accounts, databases, API keys, analytics, CDN dependencies or build step. Open `index.html` locally to preview it; put the contents of this folder on a static host to share it.

## Before publishing

1. Open `config.js` and replace `SITE_URL` with the address you will use (include the final trailing slash).
2. If wanted, change `TITLE`, `SUBTITLE`, `TEAM_NAME`, and `LOGO_URL` in that same file.
3. In `index.html`, replace the placeholder `https://example.net/global-campus-connect/` in the Open Graph and Twitter URL/image tags with the same final address. This is intentionally duplicated to keep the page usable without a build step.

## Option A — Netlify Drop (fastest)

1. Visit [Netlify Drop](https://app.netlify.com/drop) in a browser.
2. Drag the **folder contents** (or the supplied `global-campus-connect.zip`) on to the drop area. Do not drag the parent `outputs` folder.
3. When Netlify gives you a site address, use the site settings to choose a clear name if desired. Update `SITE_URL` and the Open Graph URLs, then drag the edited folder again to redeploy.

## Option B — GitHub Pages

1. Create an empty GitHub repository. On its **Code** page select **Add file → Upload files** and upload every file and folder inside `global-campus-connect` (including `.nojekyll`).
2. Open **Settings → Pages**, set **Source** to **Deploy from a branch**, select `main` and `/ (root)`, then save.
3. Wait for the Pages address. Set that address in `config.js` and the Open Graph URLs in `index.html`, commit/upload those two changed files, and wait for the automatic redeploy.

## Updating the plan later

For text changes, update the Day files and run `node tools/parse_days.js`, `node tools/build_data.js`, and `node tools/verify_data.js` from this folder; then upload the changed `data.js`. For wording-only updates made directly in `data.js`, run `node tools/verify_data.js` before uploading. No visitor needs Node: it is only an authoring helper.

## Sharing safely

`robots.txt` and the page meta tag ask search engines not to index this pitch. The published link is **unlisted, not secret**: anyone with it can open it. WhatsApp may cache a link preview. If the title/image is stale after a redeploy, share `?v=2` at the end of the link.

## Files that matter

- `index.html`, `styles.css`, `app.js`, `engine.js`, and `data.js` are the browser app.
- `config.js` is the one-place brand/address configuration.
- `assets/og-image.png` is the 1200×630 WhatsApp preview image (under 300 KB).
- `ASSUMPTIONS.md` identifies decisions still needing approval; `TESTS.md` lists verification results.

