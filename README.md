# Amendment 21

Website for Amendment 21 Liquors, 4924 Harford Rd, Baltimore. Hosted on GitHub Pages.

Plain HTML/CSS, no build step. Edit the files directly.

- `index.html`: the whole site (one page)
- `assets/css/styles.css`: all styling (colors and fonts are at the top)
- `assets/js/main.js`: open/closed status, hours highlight, tastings
- `assets/data/tastings.json`: the tastings list
- `RESOURCES.md` (local only, not published): domain, accounts, open to-dos

## Adding a tasting

Add an entry at the top of the `tastings` list in `assets/data/tastings.json`:

```json
{ "date": "2026-10-23", "start": "16:00", "end": "19:00", "with": "Union Craft", "kind": "beer", "pouring": "Duckpin, Snow Pants" }
```

The site shows the next upcoming tasting on the flyer and the six most recent past ones under "Lately".
If nothing is upcoming, the flyer says "Tastings most weeks" and points to Facebook, so it never shows an old date.

## Changing hours

Hours live in three places. Change all three:

1. The hours sign in `index.html`
2. The Google data block in the `<head>` of `index.html`
3. `HOURS` at the top of `assets/js/main.js`

**After editing `styles.css` or `main.js`,** bump the `?v=` number on those links in `index.html`, or visitors' browsers may keep using the old copy.

## Previewing locally

```
python -m http.server 8021
```

Then open http://localhost:8021. Opening `index.html` straight from disk works too, but the tastings won't load.
