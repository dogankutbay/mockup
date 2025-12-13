# Build Scripts

## generate-sitemap.js

Generates a `sitemap.xml` file in the `dist` folder after the build process completes.

### Configuration

The script automatically detects the URL in the following priority order:

1. **`SITE_URL`** - Explicit custom domain (highest priority)
2. **`VITE_SITE_URL`** - Alternative custom domain variable
3. **`VERCEL_URL`** - Automatically detected from Vercel (no configuration needed!)
4. **Fallback** - `https://mockup.kutbay.art` (for local development)

**For Vercel deployments:**
No configuration needed! The script automatically uses `VERCEL_URL` during the build process.

**For custom domains on Vercel:**
If you have a custom domain configured, set the `SITE_URL` environment variable in Vercel:
- Go to your project settings → Environment Variables
- Add `SITE_URL` with your custom domain (e.g., `https://yourdomain.com`)

**For local development:**
The default fallback is `https://mockup.kutbay.art`. For local testing, you can override:
```bash
export SITE_URL=http://localhost:5173
npm run build
```

### What it does

- Reads routes from `src/config/routes.ts`
- Generates a valid XML sitemap with all routes
- Sets appropriate priorities (homepage: 1.0, other pages: 0.8)
- Sets change frequencies (homepage: weekly, other pages: monthly)
- Includes the current date as lastmod

### Output

The sitemap is generated at `dist/sitemap.xml` and includes:
- Homepage (`/`) with priority 1.0
- All routes defined in `src/config/routes.ts`

