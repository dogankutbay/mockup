/**
 * Generate sitemap.xml from route configuration
 * This script runs after the build to create a sitemap for SEO
 */

import { readFileSync, writeFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Get base URL with automatic Vercel detection
function getBaseUrl() {
  // 1. Check for explicit SITE_URL (highest priority - for custom domains)
  if (process.env.SITE_URL) {
    return process.env.SITE_URL;
  }
  
  // 2. Check for VITE_SITE_URL
  if (process.env.VITE_SITE_URL) {
    return process.env.VITE_SITE_URL;
  }
  
  // 3. Auto-detect Vercel URL (available during build)
  if (process.env.VERCEL_URL) {
    const vercelUrl = process.env.VERCEL_URL;
    // VERCEL_URL doesn't include protocol, so add https://
    return `https://${vercelUrl}`;
  }
  
  // 4. Fallback for local development
  return 'https://mockup.kutbay.art';
}

const baseUrl = getBaseUrl();

// Read routes configuration file
const routesPath = join(__dirname, '../src/config/routes.ts');
let routesContent = readFileSync(routesPath, 'utf-8');

// Extract paths from the routes file using regex
const paths = ['/']; // Always start with homepage

// Extract ROUTES array paths
const routesMatch = routesContent.match(/path:\s*['"`]([^'"`]+)['"`]/g);
if (routesMatch) {
  routesMatch.forEach(match => {
    const path = match.match(/['"`]([^'"`]+)['"`]/)[1];
    if (path && path !== '/' && !paths.includes(path)) {
      paths.push(path);
    }
  });
}

// Get current date in ISO format
const lastmod = new Date().toISOString().split('T')[0];

// Generate sitemap XML
const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
        xsi:schemaLocation="http://www.sitemaps.org/schemas/sitemap/0.9
        http://www.sitemaps.org/schemas/sitemap/0.9/sitemap.xsd">
${paths.map(path => {
  const priority = path === '/' ? '1.0' : '0.8';
  const changefreq = path === '/' ? 'weekly' : 'monthly';
  return `  <url>
    <loc>${baseUrl}${path}</loc>
    <lastmod>${lastmod}</lastmod>
    <changefreq>${changefreq}</changefreq>
    <priority>${priority}</priority>
  </url>`;
}).join('\n')}
</urlset>`;

// Write sitemap to dist folder
const distPath = join(__dirname, '../dist/sitemap.xml');
writeFileSync(distPath, sitemap, 'utf-8');

console.log(`✅ Sitemap generated successfully at ${distPath}`);
console.log(`   Base URL: ${baseUrl}`);
if (process.env.VERCEL_URL) {
  console.log(`   (Auto-detected from Vercel: ${process.env.VERCEL_URL})`);
}
console.log(`   Pages: ${paths.length}`);
paths.forEach(path => console.log(`   - ${baseUrl}${path}`));
