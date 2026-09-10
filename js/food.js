// Open Food Facts client — free, open, no API key. Barcode lookup + name search.
// Requires an internet connection (the requests go straight from the browser to
// Open Food Facts). Coverage is strong for packaged/barcoded products.
const OFF = 'https://world.openfoodfacts.org';
const num = (n) => { const x = parseFloat(n); return isNaN(x) ? 0 : Math.round(x * 10) / 10; };

// The very first request to Open Food Facts in a session sometimes hits a cold
// connection (fresh DNS/TLS handshake) or a slow response from their free API
// and fails, while an identical retry — now warm — succeeds. One quiet retry
// here means the caller usually doesn't see that first hiccup at all.
async function fetchJSON(url, retries = 1) {
  let lastErr;
  for (let i = 0; i <= retries; i++) {
    try {
      const r = await fetch(url);
      if (!r.ok) throw new Error('HTTP ' + r.status);
      return await r.json();
    } catch (e) {
      lastErr = e;
    }
  }
  throw lastErr;
}

function normalize(p) {
  const n = p.nutriments || {};
  const per100 = {
    kcal: num(n['energy-kcal_100g'] != null ? n['energy-kcal_100g'] : n['energy-kcal']),
    protein: num(n['proteins_100g']),
    carbs: num(n['carbohydrates_100g']),
    fat: num(n['fat_100g']),
  };
  let servingG = null;
  if (p.serving_size) { const m = String(p.serving_size).match(/([\d.]+)\s*g/i); if (m) servingG = parseFloat(m[1]); }
  const brand = p.brands ? p.brands.split(',')[0].trim() : '';
  const name = [brand, p.product_name || ''].filter(Boolean).join(' ').trim() || 'Unknown product';
  return { name, per100, servingG };
}

export async function lookupBarcode(code) {
  try {
    const url = `${OFF}/api/v2/product/${encodeURIComponent(code)}.json?fields=product_name,brands,nutriments,serving_size`;
    const r = await fetch(url);
    const j = await r.json();
    if (!j || j.status !== 1 || !j.product) return { found: false, code };
    return { found: true, code, ...normalize(j.product) };
  } catch (e) {
    return { found: false, code, error: true };
  }
}

// Returns { ok, results } instead of a bare array, so a failed request (bad
// connection, OFF hiccup) can be told apart from a genuine "no matches" —
// the two used to look identical to the UI.
export async function searchFoods(query) {
  try {
    const url = `${OFF}/cgi/search.pl?search_terms=${encodeURIComponent(query)}&search_simple=1&action=process&json=1&page_size=20&fields=product_name,brands,nutriments,serving_size`;
    const j = await fetchJSON(url);
    const results = (j.products || []).map(normalize).filter((x) => x.per100.kcal > 0).slice(0, 15);
    return { ok: true, results };
  } catch (e) {
    return { ok: false, results: [] };
  }
}

// Scale a per-100g nutrient set to a gram quantity, rounded.
export function scaleMacros(per100, grams) {
  const f = grams / 100;
  return {
    kcal: Math.round(per100.kcal * f),
    protein: Math.round(per100.protein * f),
    carbs: Math.round(per100.carbs * f),
    fat: Math.round(per100.fat * f),
  };
}
