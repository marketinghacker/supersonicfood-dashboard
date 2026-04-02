export interface ProductInfo {
  name: string;
  image: string;
  description: string;
}

const PRODUCT_CATALOG: Record<string, ProductInfo> = {
  'supersonic-proteinowy-shake-z-kolagenem': {
    name: 'Proteinowy Shake z Kolagenem',
    image: 'https://cdn.shopify.com/s/files/1/0930/7756/9879/files/Koktail-proteinowy-kolagen-SUPERSONIC-belgijska-czekolada-Bez-laktozy-560g.jpg?v=1762779375',
    description: '22,6g białka, kolagen, low-carb, bez cukru',
  },
  'supersonic-matcha-latte-collagen': {
    name: 'Matcha Latte Collagen',
    image: 'https://cdn.shopify.com/s/files/1/0930/7756/9879/files/miniaturka_Matcha_Latte_Collagen_z_podpisem.jpg?v=1762779375',
    description: 'BIO matcha z Japonii, kolagen, Julia Wieniawa',
  },
  'supersonic-collagen-beauty-drink': {
    name: 'Collagen Beauty Drink',
    image: 'https://cdn.shopify.com/s/files/1/0930/7756/9879/files/Collagen-Beauty-Drink-SUPERSONIC-o-smaku-Owocow-tropikalnych-185-g.jpg?v=1762779374',
    description: 'Kolagen Peptan®, witamina C, elektrolity, biotyna',
  },
  'body-detox-drink': {
    name: 'Body Detox Drink',
    image: 'https://cdn.shopify.com/s/files/1/0930/7756/9879/files/Body-Detox-Drink-SUPERSONIC-o-smaku-wisni-336-g.jpg?v=1762779375',
    description: 'Detox, trawienie, metabolizm, redukcja wody',
  },
  'supersonic-keto-meal': {
    name: 'Protein Shape Meal',
    image: 'https://cdn.shopify.com/s/files/1/0930/7756/9879/files/Proteinowy-posilek-SUPERSONIC-w-proszku-o-smaku-waniliowych-lodow-420g.jpg?v=1762779375',
    description: 'Low carb meal, high protein, sytość na 4h+',
  },
  'supersonic-smart-meal': {
    name: 'Smart Meal',
    image: 'https://cdn.shopify.com/s/files/1/0930/7756/9879/files/Smart-Meal-Posilek-na-Przytycie-SUPERSONIC-w-proszku-Zwiekszenie-Wagi-1300g.jpg?v=1762779375',
    description: '400 kcal, 32g białka, adaptogeny, Lion\'s Mane',
  },
  'wpc-360': {
    name: 'Whey 360°',
    image: 'https://cdn.shopify.com/s/files/1/0930/7756/9879/files/biala_czekolada_i_maliny.jpg?v=1762779375',
    description: 'Odżywka białkowa WPC, 24g białka, bez laktozy',
  },
  'flow-creatine': {
    name: 'Flow Creatine',
    image: 'https://cdn.shopify.com/s/files/1/0930/7756/9879/files/flow_ze_splashem.png?v=1762779375',
    description: 'Kreatyna liposomalna, lepsza wchłanialność',
  },
  'creatine-monohydrat': {
    name: 'Kreatyna Monohydrat',
    image: 'https://cdn.shopify.com/s/files/1/0930/7756/9879/files/miniaturka_ze_splashem_1.jpg?v=1762779375',
    description: 'Kreatyna liposomalna +Active',
  },
  'supersonic-proteinowa-owsianka-blyskawiczna-z-kolagenem': {
    name: 'Śniadanie Białko+Kolagen',
    image: 'https://cdn.shopify.com/s/files/1/0930/7756/9879/files/Sniadanie-wysoko-bialkowe-z-kolagenem-SUPERSONIC-smak-banan-truskawka-420g.jpg?v=1762779375',
    description: '20g białka, kolagen, gotowe w minutę',
  },
  'orzechowa-tubka-mocy': {
    name: 'Tubka Mocy',
    image: 'https://cdn.shopify.com/s/files/1/0930/7756/9879/files/miniaturka_tubka_mocy_biala_czekolada_z_karmelem_2.jpg?v=1762779375',
    description: 'Orzechowa przekąska proteinowa bez cukru',
  },
  'proteinowy-krem-orzechowy': {
    name: 'Krem Orzechowy Proteinowy',
    image: 'https://cdn.shopify.com/s/files/1/0930/7756/9879/files/Krem-orzechowy-SUPERSONIC-MIX-3-szt-160g.jpg?v=1762779375',
    description: '19g białka, błonnik, bez cukru',
  },
  'krem-orzechowy-keto-low-carb': {
    name: 'Krem Orzechowy Low-Carb',
    image: 'https://cdn.shopify.com/s/files/1/0930/7756/9879/files/Krem-Orzechowy-keto-LOW-CARB-crunchy-SUPERSONIC-Biala-Czekolada-250g.jpg?v=1762779374',
    description: 'Low carb, dużo błonnika, bez cukru',
  },
  'supersonic-food-ready-to-drink': {
    name: 'Ready to Drink',
    image: 'https://cdn.shopify.com/s/files/1/0930/7756/9879/files/miniaturka_RTDx3.jpg?v=1762779375',
    description: 'Gotowy shake proteinowy',
  },
  'supersonic-matcha-glow-gummies': {
    name: 'Matcha Glow Gummies',
    image: 'https://cdn.shopify.com/s/files/1/0930/7756/9879/files/zelki_2.jpg?v=1762779375',
    description: 'Żelki z matchą na piękną cerę',
  },
  'hormonal-complex': {
    name: 'Hormonal Complex',
    image: 'https://cdn.shopify.com/s/files/1/0930/7756/9879/files/hormonal_-_biale_tlo_-_tabletki.jpg?v=1762779375',
    description: 'Wsparcie hormonalne dla kobiet',
  },
  'd3k2-complex': {
    name: 'D3K2 Complex',
    image: 'https://cdn.shopify.com/s/files/1/0930/7756/9879/files/d3k2_-_biale_tlo_-_tabletki.jpg?v=1762779375',
    description: 'Witamina D3 + K2',
  },
  'magnesium-complex': {
    name: 'Magnesium Complex',
    image: 'https://cdn.shopify.com/s/files/1/0930/7756/9879/files/magnez_-_biale_tlo_-_tabletki.jpg?v=1762779375',
    description: 'Magnez w optymalnej formie',
  },
  'ashwagandha': {
    name: 'Ashwagandha+',
    image: 'https://cdn.shopify.com/s/files/1/0930/7756/9879/files/ashwagandha_-_biale_tlo_-_tabletki.jpg?v=1762779375',
    description: 'Stress complex z ashwagandhą',
  },
  'japan-matcha-kyushu': {
    name: 'Japan Matcha Kyushu',
    image: 'https://cdn.shopify.com/s/files/1/0930/7756/9879/files/freepik_br-73045543_convert.jpg?v=1762779375',
    description: 'Japońska matcha premium',
  },
};

// ─── Name-based product detection (fallback when URL is missing) ───

// Sorted longest-first to match "shape meal" before "shape"
const NAME_KEYWORDS: Array<[string, string]> = [
  ['shape meal', 'Protein Shape Meal'],
  ['protein shape', 'Protein Shape Meal'],
  ['shape', 'Protein Shape Meal'],
  ['matcha latte', 'Matcha Latte Collagen'],
  ['matcha marakuja', 'Matcha Latte Collagen'],
  ['matcha glow', 'Matcha Glow Gummies'],
  ['matcha', 'Matcha Latte Collagen'],
  ['wieniawa', 'Matcha Latte Collagen'],
  ['collagen beauty', 'Collagen Beauty Drink'],
  ['beauty collagen', 'Collagen Beauty Drink'],
  ['beauty drink', 'Collagen Beauty Drink'],
  ['kolagen', 'Collagen Beauty Drink'],
  ['detox', 'Body Detox Drink'],
  ['kreatyna', 'Flow Creatine'],
  ['creatine', 'Flow Creatine'],
  ['flow', 'Flow Creatine'],
  ['whey', 'Whey 360°'],
  ['wpc', 'Whey 360°'],
  ['smart meal', 'Smart Meal'],
  ['meale', 'Smart Meal'],
  ['meal', 'Smart Meal'],
  ['shake', 'Proteinowy Shake z Kolagenem'],
  ['tubka', 'Tubka Mocy'],
  ['krem orzechowy', 'Krem Orzechowy Proteinowy'],
  ['ashwagandha', 'Ashwagandha+'],
  ['hormonal', 'Hormonal Complex'],
  ['magnez', 'Magnesium Complex'],
  ['d3k2', 'D3K2 Complex'],
  ['owsianka', 'Śniadanie Białko+Kolagen'],
  ['śniadanie', 'Śniadanie Białko+Kolagen'],
  ['odchudzanie', 'Body Detox Drink'],
  ['ready to drink', 'Ready to Drink'],
  ['rtd', 'Ready to Drink'],
];

// Adset name → product (adset names are more reliable than ad names)
const ADSET_KEYWORDS: Array<[string, string]> = [
  ['kreatyna', 'Flow Creatine'],
  ['whey', 'Whey 360°'],
  ['meale', 'Smart Meal'],
  ['shape meal', 'Protein Shape Meal'],
  ['shape', 'Protein Shape Meal'],
  ['shake proteinowy', 'Proteinowy Shake z Kolagenem'],
  ['kolagen', 'Collagen Beauty Drink'],
  ['matcha', 'Matcha Latte Collagen'],
  ['detox', 'Body Detox Drink'],
  ['ogólna linia', 'Katalog ogólny'],
  ['katalog', 'Katalog ogólny'],
];

function matchKeywords(text: string, keywords: Array<[string, string]>): string | null {
  const lower = text.toLowerCase();
  for (const [keyword, product] of keywords) {
    if (lower.includes(keyword)) return product;
  }
  return null;
}

export function getProductFromName(adName: string, adsetName?: string): ProductInfo {
  // Try adset name first (more reliable)
  if (adsetName) {
    const adsetMatch = matchKeywords(adsetName, ADSET_KEYWORDS);
    if (adsetMatch && adsetMatch !== 'Katalog ogólny') {
      const catalogEntry = Object.values(PRODUCT_CATALOG).find(p => p.name === adsetMatch);
      if (catalogEntry) return catalogEntry;
      return { name: adsetMatch, image: '', description: '' };
    }
  }

  // Try ad name
  const nameMatch = matchKeywords(adName, NAME_KEYWORDS);
  if (nameMatch) {
    const catalogEntry = Object.values(PRODUCT_CATALOG).find(p => p.name === nameMatch);
    if (catalogEntry) return catalogEntry;
    return { name: nameMatch, image: '', description: '' };
  }

  return { name: 'Inne / Niesklasyfikowane', image: '', description: '' };
}

function slugToTitle(slug: string): string {
  return slug.replace(/^supersonic-/, '').replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
}

export function getProductInfo(url: string): ProductInfo {
  if (!url) return { name: '', image: '', description: '' }; // empty = needs fallback

  try {
    const parsed = new URL(url.startsWith('http') ? url : `https://${url}`);
    const match = parsed.pathname.match(/\/(?:products|produkt)\/([^/?]+)/);
    if (!match) return { name: '', image: '', description: '' };

    const slug = match[1].replace(/\/$/, '');
    return PRODUCT_CATALOG[slug] ?? { name: slugToTitle(slug), image: '', description: '' };
  } catch {
    return { name: '', image: '', description: '' };
  }
}

export function getProductName(url: string): string {
  return getProductInfo(url).name;
}
