# BadgeCraft Metalworks Static Site

Static independent site for custom metal crafts: custom metal badges, metal pins, custom metal coins, metal name tags, custom metal tokens and medals.

## Local Preview

```bash
python -m http.server 4173 --bind 127.0.0.1
```

Open:

```text
http://127.0.0.1:4173/
```

## Before Publishing

Current live-site details already filled:

- Brand: `BadgeCraft Metalworks`
- Domain: `https://metal-badge.com/`
- Email: `lzyderun@gmail.com`
- WhatsApp: `+86 13922851014`

Before final publishing, add company address, legal company name, privacy policy, and any real certificates or audit documents you want buyers to see.

## Cloudflare Pages Free Deployment

1. Create a GitHub repository and upload this folder.
2. In Cloudflare, go to **Workers & Pages**.
3. Choose **Create application** then **Pages**.
4. Connect the GitHub repository.
5. Use these build settings:
   - Framework preset: `None`
   - Build command: leave empty
   - Build output directory: `/`
6. Deploy.
7. Add your custom domain in the Cloudflare Pages project.
8. After the domain is live, submit `https://yourdomain.com/sitemap.xml` in Google Search Console.

## SEO Structure

See `docs/seo-page-plan.md` for keyword grouping and page planning based on the two Keyword Planner CSV files.
