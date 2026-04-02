const PRODUCT_MAP: Record<string, string> = {
  'supersonic-matcha-latte-collagen': 'Matcha Latte Collagen',
  'supersonic-collagen-beauty-drink': 'Collagen Beauty Drink',
  'body-detox-drink': 'Body Detox Drink',
  'flow-creatine': 'Flow Creatine',
  'supersonic-keto-meal': 'Protein Shape Meal',
  'supersonic-proteinowy-shake-z-kolagenem': 'Proteinowy Shake z Kolagenem',
  'supersonic-whey-360': 'Whey 360',
  'supersonic-smart-meal': 'Smart Meal',
  'supersonic-meale': 'Meale',
};

function slugToTitle(slug: string): string {
  return slug
    .replace(/^supersonic-/, '')
    .split('-')
    .map(w => w.charAt(0).toUpperCase() + w.slice(1))
    .join(' ');
}

export function getProductName(url: string): string {
  if (!url) return 'Katalog ogólny';

  try {
    const parsed = new URL(url.startsWith('http') ? url : `https://${url}`);
    const path = parsed.pathname;

    const match = path.match(/\/(?:products|produkt)\/([^/?]+)/);
    if (!match) return 'Katalog ogólny';

    const slug = match[1].replace(/\/$/, '');
    return PRODUCT_MAP[slug] ?? slugToTitle(slug);
  } catch {
    return 'Katalog ogólny';
  }
}
