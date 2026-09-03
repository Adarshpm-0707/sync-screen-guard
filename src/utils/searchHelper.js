// Common phone brand words & brand families
export const BRAND_FAMILIES = {
  apple: ['apple', 'iphone', 'ipad', 'iwatch'],
  iphone: ['apple', 'iphone', 'ipad', 'iwatch'],
  samsung: ['samsung', 'galaxy'],
  galaxy: ['samsung', 'galaxy'],
  oneplus: ['oneplus', 'nord'],
  pixel: ['pixel', 'google', 'google pixel'],
  google: ['pixel', 'google', 'google pixel'],
  vivo: ['vivo', 'iqoo', 'i qoo'],
  oppo: ['oppo', 'find', 'reno'],
  realme: ['realme', 'narzo'],
  xiaomi: ['xiaomi', 'redmi', 'poco', 'mi'],
  redmi: ['xiaomi', 'redmi', 'poco', 'mi'],
  poco: ['xiaomi', 'redmi', 'poco', 'mi'],
  nothing: ['nothing', 'cmf'],
  motorola: ['motorola', 'moto'],
  moto: ['motorola', 'moto'],
  nokia: ['nokia'],
  honor: ['honor', 'huawei'],
  huawei: ['honor', 'huawei'],
  asus: ['asus', 'rog'],
  sony: ['sony', 'xperia'],
  iqoo: ['iqoo', 'vivo'],
  infinix: ['infinix'],
  tecno: ['tecno', 'techno']
};

export const BRAND_WORDS = Object.keys(BRAND_FAMILIES);

// Device model modifiers & model specifiers
export const DEVICE_MODEL_MODIFIERS = [
  'pro', 'max', 'plus', 'ultra', 'lite', 'mini', 'fe', 'note', 'fold', 'flip',
  'prime', 'neo', 'edge', 'se', 'play', 'series', 'phone', 'mobile', 'device', '5g', '4g', 'xl'
];

// Distinctive product feature / type keywords
export const PRODUCT_FEATURE_KEYWORDS = [
  'privacy', 'matte', 'glare', 'anti-glare', 'antiglare', 'camera', 'lens',
  'uv', 'curved', '3d', '9h', '11d', 'diamond', 'hydrogel', 'ceramic', 'clear', 'transparent',
  'charger', 'cable', 'adapter', 'cover', 'case', 'skin', 'wrap', 'cleaner',
  'wipes', 'cleaning', 'stand', 'holder', 'powerbank', 'earbuds', 'watch', 'strap',
  'screen', 'guard', 'protector', 'tempered', 'glass', 'film'
];

/**
 * Normalizes a text string: lowercase, cleans excessive spaces & punctuation
 */
export function normalizeSearchText(text) {
  if (!text) return '';
  return text
    .toLowerCase()
    .replace(/[^\w\s\-\+]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * Extracts distinct numeric tokens and alphanumeric model identifiers from text.
 * e.g. "iPhone 16 Pro Max" -> ["16"]
 * e.g. "Samsung S24 Ultra" -> ["s24", "24"]
 * e.g. "OnePlus 12R" -> ["12r", "12"]
 * e.g. "65W GaN Charger" -> ["65w", "65"]
 */
export function extractModelIdentifiers(text) {
  if (!text) return [];
  const normalized = normalizeSearchText(text);
  const words = normalized.split(/\s+/).filter(Boolean);
  const identifiers = new Set();

  words.forEach(w => {
    // Alphanumeric with digits (e.g. s24, 12r, 65w, 9h, 11d, nord4, gt6, a55, x100, v30)
    if (/\d/.test(w)) {
      identifiers.add(w);
      // Also add purely numeric part if length >= 1 (e.g. "24" from "s24", "12" from "12r", "65" from "65w")
      const digitsOnly = w.replace(/\D/g, '');
      if (digitsOnly && digitsOnly.length <= 4) {
        identifiers.add(digitsOnly);
      }
    }
  });

  return Array.from(identifiers);
}

/**
 * Extracts the model number / numeric identifier from a full model string.
 * e.g. "iPhone 16 Pro Max" -> "16 Pro Max"
 * e.g. "Samsung Galaxy S24 Ultra" -> "S24 Ultra"
 * e.g. "OnePlus 12R" -> "12R"
 */
export function extractModelNumber(query) {
  if (!query) return '';
  const q = query.trim();
  const tokens = q.split(/\s+/);
  const firstNumericIdx = tokens.findIndex(t => /\d/.test(t));
  if (firstNumericIdx !== -1) {
    return tokens.slice(firstNumericIdx).join(' ');
  }
  const stripped = tokens.filter(t => !BRAND_WORDS.includes(t.toLowerCase()));
  return stripped.join(' ');
}

/**
 * Detects which brand families are present in a query text.
 */
export function detectBrands(text) {
  if (!text) return [];
  const normalized = normalizeSearchText(text);
  const words = normalized.split(/\s+/);
  const detected = new Set();

  words.forEach(w => {
    if (BRAND_FAMILIES[w]) {
      detected.add(w);
    }
  });

  return Array.from(detected);
}

/**
 * Detects if two brand sets are in direct conflict.
 * Returns true if query specifies a brand that is incompatible with the product brand.
 */
function hasBrandConflict(queryBrands, productBrands) {
  if (queryBrands.length === 0 || productBrands.length === 0) return false;

  // Check if any query brand belongs to the same family as any product brand
  for (const qb of queryBrands) {
    const qFamily = BRAND_FAMILIES[qb] || [qb];
    for (const pb of productBrands) {
      if (qFamily.includes(pb)) {
        return false; // Compatible brand found
      }
    }
  }

  // All query brands conflict with all product brands
  return true;
}

/**
 * Detects if numeric model identifiers are in direct conflict.
 * e.g. Query has "16" (like iPhone 16) but product is for "15" (iPhone 15) and does NOT mention "16".
 */
function hasModelNumberConflict(queryNumbers, productNumbers) {
  // If query doesn't specify any number, no number conflict
  if (queryNumbers.length === 0) return false;

  // Filter query numbers to significant phone/product model digits (e.g. 11, 12, 13, 14, 15, 16, 21, 22, 23, 24, etc.)
  const significantQueryNums = queryNumbers.filter(n => /^\d{1,3}$/.test(n));
  if (significantQueryNums.length === 0) return false;

  // If product also has numbers in title/text:
  const significantProdNums = productNumbers.filter(n => /^\d{1,3}$/.test(n));
  if (significantProdNums.length === 0) return false;

  // If ANY query number matches ANY product number, there is NO conflict
  const hasCommonNum = significantQueryNums.some(qn => significantProdNums.includes(qn));
  if (hasCommonNum) return false;

  // Otherwise, the product is for a different model number (e.g. 16 vs 15)
  return true;
}

/**
 * Calculate search match score between a product and a search query.
 * Returns 0 if there is no match or if there is a direct conflict.
 * Returns > 0 if there is a match (higher score = more relevant).
 */
export function getProductSearchScore(product, searchQuery) {
  if (!searchQuery || !searchQuery.trim()) return 1;
  if (!product) return 0;

  const rawQuery = searchQuery.trim().toLowerCase();
  const queryClean = normalizeSearchText(rawQuery);
  if (!queryClean) return 0;

  const name = (product.name || '').toLowerCase();
  const desc = (product.description || '').toLowerCase();
  const cat = (product.category || '').toLowerCase();
  const specs = (product.specifications || '').toLowerCase();

  const productFullText = normalizeSearchText(`${name} ${desc} ${cat} ${specs}`);
  const productNameNorm = normalizeSearchText(name);

  // 1. Detect Brands & Numbers
  const queryBrands = detectBrands(queryClean);
  const productBrands = detectBrands(productFullText);

  // Check Brand Conflict
  if (hasBrandConflict(queryBrands, productBrands)) {
    return 0;
  }

  const queryNumbers = extractModelIdentifiers(queryClean);
  const productNumbers = extractModelIdentifiers(productFullText);
  const productNameNumbers = extractModelIdentifiers(productNameNorm);

  // Check Number / Model Conflict (especially if both have phone series numbers in name)
  if (hasModelNumberConflict(queryNumbers, productNameNumbers)) {
    return 0;
  }

  // 2. Score Calculation
  let score = 0;

  // A. Exact full string match
  if (productNameNorm.includes(queryClean)) {
    score += 250;
  } else if (productFullText.includes(queryClean)) {
    score += 150;
  }

  // B. Exact Model Number match (e.g. "16 pro max", "s24 ultra", "12r")
  const queryModelNum = extractModelNumber(queryClean);
  if (queryModelNum && queryModelNum.length > 1) {
    const modelNumNorm = normalizeSearchText(queryModelNum);
    if (productNameNorm.includes(modelNumNorm)) {
      score += 180;
    } else if (productFullText.includes(modelNumNorm)) {
      score += 90;
    }
  }

  // C. Token-by-token matching
  const queryTokens = queryClean.split(/\s+/).filter(t => t.length > 0 && !['for', 'the', 'and', 'with', 'in', 'of', 'to'].includes(t));
  if (queryTokens.length === 0) return 0;

  let matchedTokensCount = 0;
  let hasNumberMatch = false;
  let hasBrandMatch = false;
  let hasFeatureMatch = false;

  queryTokens.forEach(tok => {
    const isNum = /\d/.test(tok);
    const isBrand = BRAND_WORDS.includes(tok);
    const isMod = DEVICE_MODEL_MODIFIERS.includes(tok);
    const isFeature = PRODUCT_FEATURE_KEYWORDS.includes(tok);

    let tokenMatched = false;

    // Check match in product name (highest priority)
    if (productNameNorm.includes(tok)) {
      tokenMatched = true;
      let weight = 20;
      if (isNum) { weight = 40; hasNumberMatch = true; }
      else if (isBrand) { weight = 35; hasBrandMatch = true; }
      else if (isFeature) { weight = 30; hasFeatureMatch = true; }
      else if (isMod) { weight = 25; }
      score += weight;
    }
    // Check match in description/specs/category
    else if (productFullText.includes(tok)) {
      tokenMatched = true;
      let weight = 8;
      if (isNum) { weight = 15; hasNumberMatch = true; }
      else if (isBrand) { weight = 15; hasBrandMatch = true; }
      else if (isFeature) { weight = 12; hasFeatureMatch = true; }
      score += weight;
    }

    if (tokenMatched) {
      matchedTokensCount++;
    }
  });

  // If query is specific (multiple tokens) and NONE of the tokens matched -> 0
  if (matchedTokensCount === 0) {
    return 0;
  }

  // If query specifies a model number (e.g. 16, 15, 24, 65w) and product didn't match any number -> 0
  if (queryNumbers.length > 0 && !hasNumberMatch) {
    return 0;
  }

  // If query specifies a brand (e.g. iPhone, Samsung) and product didn't match the brand -> 0
  if (queryBrands.length > 0 && !hasBrandMatch) {
    return 0;
  }

  // Bonus when ALL query tokens matched
  if (matchedTokensCount === queryTokens.length) {
    score += 80;
  }

  // Bonus for bestseller if it is an actual match
  if (product.is_best_seller && score > 0) {
    score += 5;
  }

  return score;
}

/**
 * Checks if a product matches a search query.
 * Strictly returns true ONLY when there is a genuine match (score > 0).
 */
export function isProductMatch(product, searchQuery) {
  if (!searchQuery || !searchQuery.trim()) return true;
  if (!product) return false;

  return getProductSearchScore(product, searchQuery) > 0;
}

/**
 * Checks if a product belongs to a specific category
 */
export function isCategoryMatch(product, categoryId, categoryName = '') {
  if (!product) return false;
  if (!categoryId || categoryId === 'all') return true;

  const pCat = (product.category || '').toLowerCase().trim();
  const cId = categoryId.toLowerCase().trim();
  const cName = categoryName.toLowerCase().trim();

  // 1. Direct equality with id or name
  if (pCat === cId || pCat === cName) return true;

  // 2. Normalized slug check (remove dashes, underscores, spaces)
  const normPCat = pCat.replace(/[\s\-_]+/g, '');
  const normCId = cId.replace(/[\s\-_]+/g, '');
  const normCName = cName.replace(/[\s\-_]+/g, '');

  if (normPCat === normCId || (normCName && normPCat === normCName)) return true;

  // 3. Substring / slug containment check
  if (cId.includes(pCat) || (pCat.length > 2 && pCat.includes(cId))) return true;
  if (normCId.includes(normPCat) || (normPCat.length > 2 && normPCat.includes(normCId))) return true;
  if (normCName && (normCName.includes(normPCat) || normPCat.includes(normCName))) return true;

  // 4. Content / description keyword match
  const pName = (product.name || '').toLowerCase();
  const pDesc = (product.description || '').toLowerCase();
  const fullText = `${pName} ${pDesc} ${pCat}`;

  const catKeywords = `${cId} ${cName}`
    .replace(/[\s\-_]+/g, ' ')
    .split(/\s+/)
    .filter(w => w.length >= 3 && !['screen', 'guard', 'guards', 'protector', 'protectors', 'film', 'tempered'].includes(w));

  if (catKeywords.length > 0) {
    const hasMatch = catKeywords.some(kw => fullText.includes(kw));
    if (hasMatch) return true;
  }

  return false;
}
