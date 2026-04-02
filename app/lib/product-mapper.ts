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
    description: '19g białka, błonnik, bez cukru, bez oleju palmowego',
  },
  'krem-orzechowy-keto-low-carb': {
    name: 'Krem Orzechowy Low-Carb',
    image: 'https://cdn.shopify.com/s/files/1/0930/7756/9879/files/Krem-Orzechowy-keto-LOW-CARB-crunchy-SUPERSONIC-Biala-Czekolada-250g.jpg?v=1762779374',
    description: 'Low carb, dużo błonnika, bez cukru',
  },
  'supersonic-food-ready-to-drink': {
    name: 'Ready to Drink',
    image: 'https://cdn.shopify.com/s/files/1/0930/7756/9879/files/miniaturka_RTDx3.jpg?v=1762779375',
    description: 'Gotowy shake proteinowy, kremowa czekolada',
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
    description: 'Witamina D3 + K2 w kapsułkach',
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
    description: 'Japońska matcha premium z regionu Kyushu',
  },
  'supersonic-food-pl-matcha-aichi-100g': {
    name: 'Matcha Aichi',
    image: 'https://cdn.shopify.com/s/files/1/0930/7756/9879/files/Proteinowy-posilek-SUPERSONIC-w-proszku-o-smaku-waniliowych-lodow-420g.jpg?v=1762779375',
    description: 'Japońska matcha z regionu Aichi',
  },
};

function slugToTitle(slug: string): string {
  return slug
    .replace(/^supersonic-/, '')
    .replace(/-/g, ' ')
    .replace(/\b\w/g, c => c.toUpperCase());
}

export function getProductInfo(url: string): ProductInfo {
  if (!url) return { name: 'Katalog ogólny', image: '', description: 'Reklama katalogowa / ogólna' };

  try {
    const parsed = new URL(url.startsWith('http') ? url : `https://${url}`);
    const path = parsed.pathname;

    const match = path.match(/\/(?:products|produkt)\/([^/?]+)/);
    if (!match) return { name: 'Katalog ogólny', image: '', description: 'Reklama katalogowa / ogólna' };

    const slug = match[1].replace(/\/$/, '');
    return PRODUCT_CATALOG[slug] ?? {
      name: slugToTitle(slug),
      image: '',
      description: '',
    };
  } catch {
    return { name: 'Katalog ogólny', image: '', description: 'Reklama katalogowa / ogólna' };
  }
}

export function getProductName(url: string): string {
  return getProductInfo(url).name;
}

export function getProductImage(url: string): string {
  return getProductInfo(url).image;
}
