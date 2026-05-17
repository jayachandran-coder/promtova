const express = require('express');
const router = express.Router();
const Prompt = require('../models/Prompt');

router.get('/', async (req, res) => {
  try {
    const baseUrl = 'https://promtova.vercel.app';

    // Get all prompts
    const prompts = await Prompt.find({}, 'slug category createdAt').sort({ createdAt: -1 });
    
    // Get unique categories (filter out empty ones)
    const categories = [...new Set(prompts.map(p => p.category).filter(Boolean))];

    let xml = `<?xml version="1.0" encoding="UTF-8"?>\n`;
    xml += `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n`;

    const addUrl = (path, priority, changefreq, lastmod) => {
      xml += `  <url>\n`;
      xml += `    <loc>${baseUrl}${path}</loc>\n`;
      if (lastmod) xml += `    <lastmod>${new Date(lastmod).toISOString()}</lastmod>\n`;
      xml += `    <changefreq>${changefreq}</changefreq>\n`;
      xml += `    <priority>${priority}</priority>\n`;
      xml += `  </url>\n`;
    };

    const today = new Date().toISOString();

    // Static pages
    addUrl('/', '1.0', 'daily', today);
    addUrl('/explore', '0.9', 'daily', today);
    addUrl('/requests', '0.8', 'daily', today);

    // Category pages
    categories.forEach(category => {
      addUrl(`/category/${encodeURIComponent(category)}`, '0.8', 'weekly', today);
    });

    // Prompt detail pages
    prompts.forEach(prompt => {
      // Use createdAt as lastmod, fallback to today
      const lastmod = prompt.createdAt || today;
      addUrl(`/prompt/${prompt.slug}`, '0.8', 'weekly', lastmod);
    });

    xml += `</urlset>`;

    res.header('Content-Type', 'application/xml');
    res.send(xml);
  } catch (error) {
    console.error('Sitemap generation error:', error);
    res.status(500).send('Error generating sitemap');
  }
});

module.exports = router;
