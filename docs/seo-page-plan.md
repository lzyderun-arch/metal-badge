# SEO Page Plan

This static site targets overseas B2B buyers for custom metal crafts under `BadgeCraft Metalworks` at `https://metal-badge.com/`.

## Keyword Findings

The two Google Keyword Planner exports include 1,615 rows. Many high-volume terms are not a fit for a custom metal craft site because they are about bullion prices, coin investment or marketplace brands. Those terms should not drive the main navigation.

Strong fit keywords:

| Cluster | Priority keywords | Page |
| --- | --- | --- |
| Metal badges | metal badge, custom metal badges, personalized metal badges, metal badge logo, metal badges manufacturer | `/products/metal-badges.html` |
| Metal pins | metal pin, metal lapel pins, custom metal pins, metal pin badges, custom metal pin badges | `/products/metal-pins.html` |
| Metal coins | metal coin, custom metal coins, custom silver coins, metal token coins, custom metal tokens | `/products/custom-metal-coins.html` |
| Name tags | metal name tags, metal name badges, engraved metal name tags, stainless steel name tags, brass name badges | `/products/metal-name-tags.html` |
| Tokens and medals | custom metal tokens, metal token coins, medal pins, medallions | `/products/metal-tokens-medals.html` |

## Site Architecture

- `/` targets the broad supplier intent: custom metal badges, metal pins, custom metal coins.
- Product pages each target one cluster and link back to the homepage and quote page.
- Resource pages target educational long-tail traffic and support internal links to product pages.
- `sitemap.xml` and `robots.txt` are ready for Cloudflare Pages.

## Content Expansion Roadmap

Add these pages after the initial site is live:

1. `/resources/soft-enamel-vs-hard-enamel-pins.html`
2. `/resources/metal-badge-backing-options.html`
3. `/resources/custom-metal-coins-vs-metal-tokens.html`
4. `/resources/how-to-prepare-artwork-for-metal-pins.html`
5. `/resources/engraved-metal-name-tags-for-hotels.html`

## On-Page SEO Rules Used

- One primary keyword cluster per page.
- Keyword appears in title, meta description, H1 or lead, and naturally in body copy.
- Internal links connect guides to product pages and quote page.
- Irrelevant high-volume bullion and price-search terms are excluded from primary pages.
- Static HTML content is present in the source so search engines can crawl it without relying on JavaScript.

## Cloudflare Pages Settings

- Framework preset: None
- Build command: leave empty
- Build output directory: `/`
- Production branch: `main`
- Custom domain: add your domain after the first deployment
