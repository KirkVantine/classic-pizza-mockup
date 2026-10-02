# Classic Pizza website concept

A mobile-first redesign concept for [Classic Pizza](https://www.eatclassicpizza.com/) in Dexter, Michigan, built around the menu and online ordering.

**Live mockup:** https://kirkvantine.github.io/classic-pizza-mockup/

This is a concept proposal, not the official Classic Pizza website.

## How it works

- All ordering stays on Classic Pizza's existing Big Holler online ordering (`ordering.bigholler.com/ClassicPizza/`). Every order button links there.
- The menu on the site is separate, but its prices come from Big Holler, so the website and online ordering match.
- `index.html` is a single built page. The logo and penguin are drawn in SVG, and the menu is plain HTML, so it works even where scripts are blocked.

## Updating prices from Big Holler

Big Holler blocks automated requests, so prices are exported from a normal browser:

1. Open https://ordering.bigholler.com/ClassicPizza/, click **Order as Guest**, choose Pick-up and any date, then **Jump Right To Menu**.
2. Open the browser console (F12, then Console), paste the contents of `src/sync/bigholler-price-export.js`, and press Enter. It only reads the menu; nothing is ordered.
3. Replace `src/data/menu-prices.json` with the downloaded `menu-prices.json`.
4. Rebuild (below) and commit.

Items listed on the site but not found on Big Holler automatically show "Call to order", and the build lists them.

## Building

Requires Windows PowerShell and Node.js.

```
powershell -ExecutionPolicy Bypass -File src/build.ps1
```

| File | Purpose |
| --- | --- |
| `src/mockup.html` | Page template: layout, styles, penguin animation |
| `src/render-menu.mjs` | Menu names, order, and descriptions; turns them into HTML using Big Holler prices |
| `src/data/menu-prices.json` | Latest prices exported from Big Holler |
| `src/sync/bigholler-price-export.js` | Browser script that exports Big Holler prices |
| `src/build.ps1` | Fills the template and writes `index.html` |
