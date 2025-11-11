/**
 * AI Price Estimator using Google Vision + Custom Search APIs
 * -----------------------------------------------------------
 * Combines user-provided title with AI-extracted image data
 * to estimate product prices with statistical filtering and
 * weighted confidence scoring.
 */

console.log("🔑 API Key loaded?", !!import.meta.env.VITE_GOOGLE_API_KEY);
console.log("🔎 Search Engine ID loaded?", !!import.meta.env.VITE_GOOGLE_SEARCH_ENGINE_ID);

interface PriceListing {
  title: string;
  price: number;
  url: string;
  confidence: number;
}

export async function estimatePriceFromImage(
  imageUrl: string,
  userTitle?: string
): Promise<{
  labels: string[];
  avgPrice: string | null;
  medianPrice: string | null;
  priceRange: { min: number; max: number } | null;
  listings: PriceListing[];
  confidence: 'high' | 'medium' | 'low';
  searchQuery: string;
}> {
  console.log("🔍 Estimating price for:", imageUrl);
  console.log("📝 User-provided title:", userTitle || "(none)");

  const apiKey = import.meta.env.VITE_GOOGLE_API_KEY;
  const searchEngineId = import.meta.env.VITE_GOOGLE_SEARCH_ENGINE_ID;

  if (!apiKey || !searchEngineId) {
    console.error("❌ Missing API key or Search Engine ID.");
    return emptyResult();
  }

  try {
    // Step 1: Analyze image using Google Vision
    const visionData = await fetchVisionData(apiKey, imageUrl);
    if (!visionData) return emptyResult();

    const { labels, texts, objects, logos, webEntities } = extractVisionData(visionData);

    // Step 2: Build multiple queries (title only, image only, combined)
    const queries = [
      ...(userTitle ? [`"${userTitle}" price`] : []),
      buildSmartQuery(undefined, labels, texts, objects, logos, webEntities),
      ...(userTitle ? [userTitle] : [])
    ].filter(Boolean);

    console.log("🔑 Search queries:", queries);

    // Step 3: Run all queries and combine results
    let allResults: any[] = [];
    for (const q of queries) {
      const results = await runSearchQueries(apiKey, searchEngineId, q, userTitle);
      allResults.push(...results);
      await new Promise(r => setTimeout(r, 100)); // prevent rate limiting
    }

    if (!allResults.length) return emptyResult(labels, queries.join(" | "));

    // Step 4: Extract and normalize prices with confidence scoring
    const listings = extractPrices(allResults, queries.join(" "), userTitle);
    if (!listings.length) return emptyResult(labels, queries.join(" | "));

    // Step 5: Remove outliers using IQR
    const filtered = filterOutliers(listings);
    if (!filtered.length) return emptyResult(labels, queries.join(" | "));

    // Step 6: Summarize stats
    const { avgPrice, medianPrice, priceRange, confidence } = summarizePrices(filtered);

    return {
      labels,
      avgPrice,
      medianPrice,
      priceRange,
      listings: filtered.slice(0, 10),
      confidence,
      searchQuery: queries.join(" | ")
    };
  } catch (err) {
    console.error("❌ Estimation failed:", err);
    return emptyResult();
  }
}

/* ------------------------- Helper Functions ------------------------- */

function emptyResult(labels: string[] = [], query = "") {
  return {
    labels,
    avgPrice: null,
    medianPrice: null,
    priceRange: null,
    listings: [],
    confidence: 'low' as const,
    searchQuery: query
  };
}

/** Fetch image analysis results from Google Vision API */
async function fetchVisionData(apiKey: string, imageUrl: string) {
  try {
    const response = await fetch(
      `https://vision.googleapis.com/v1/images:annotate?key=${apiKey}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          requests: [
            {
              image: { source: { imageUri: imageUrl } },
              features: [
                { type: "LABEL_DETECTION", maxResults: 10 },
                { type: "TEXT_DETECTION", maxResults: 10 },
                { type: "OBJECT_LOCALIZATION", maxResults: 5 },
                { type: "LOGO_DETECTION", maxResults: 5 },
                { type: "WEB_DETECTION", maxResults: 5 }
              ]
            }
          ]
        })
      }
    );
    if (!response.ok) {
      console.error("❌ Vision API error:", await response.text());
      return null;
    }
    const json = await response.json();
    return json.responses?.[0];
  } catch (err) {
    console.error("❌ Vision API fetch error:", err);
    return null;
  }
}

/** Extract structured data from Vision API response */
function extractVisionData(response: any) {
  return {
    labels: response.labelAnnotations?.map((x: any) => x.description) || [],
    texts: response.textAnnotations?.map((x: any) => x.description) || [],
    objects: response.localizedObjectAnnotations?.map((x: any) => x.name) || [],
    logos: response.logoAnnotations?.map((x: any) => x.description) || [],
    webEntities:
      response.webDetection?.webEntities
        ?.filter((e: any) => e.score > 0.5)
        .map((e: any) => e.description) || []
  };
}

/** Create intelligent search query using multiple Vision signals */
function buildSmartQuery(
  userTitle: string | undefined,
  labels: string[],
  texts: string[],
  objects: string[],
  logos: string[],
  webEntities: string[]
): string {
  const commonWords = ["object", "product", "item", "thing", "font", "rectangle"];
  const filteredLabels = labels.filter(l => !commonWords.some(c => l.toLowerCase().includes(c)));

  const brand =
    userTitle?.split(" ")[0] ||
    logos[0] ||
    webEntities.find((e) => /^[A-Z][a-z]+$/.test(e)) ||
    texts.find((t) => /^[A-Z][a-z]{2,}$/.test(t)) ||
    "";

  const model = texts.find(t => /\b[A-Z0-9-]{3,}\b/.test(t)) || "";
  const productType =
    (userTitle?.match(/\b(phone|laptop|camera|tv|watch|tablet|console)\b/i)?.[0]) ||
    objects[0] ||
    filteredLabels[0] ||
    "";

  const parts = [brand, model, productType, userTitle]
    .filter(Boolean)
    .map(s => s.trim());

  const query = [...new Set(parts)].join(" ");
  return query || "product";
}

/** Run refined Custom Search queries */
async function runSearchQueries(apiKey: string, cx: string, query: string, userTitle?: string) {
  const queries = [`${query} price`, `buy ${query}`, `${query} cost`];
  if (userTitle && userTitle !== query) queries.unshift(`"${userTitle}" price`);

  const results: any[] = [];
  for (const q of queries) {
    try {
      const res = await fetch(
        `https://www.googleapis.com/customsearch/v1?key=${apiKey}&cx=${cx}&q=${encodeURIComponent(q)}&num=10`
      );
      if (res.ok) {
        const data = await res.json();
        if (data.items) results.push(...data.items);
      }
    } catch {}
    await new Promise(r => setTimeout(r, 100)); // prevent rate limit
  }
  return results;
}

/** Extract all valid price mentions from search results */
function extractPrices(results: any[], query: string, userTitle?: string): PriceListing[] {
  const trustedDomains = ['amazon.com', 'ebay.com', 'walmart.com', 'bestbuy.com', 'target.com'];
  const pricePatterns = [
    /\$\s*(\d{1,5}(?:,\d{3})*(?:\.\d{2})?)/g,
    /USD\s*(\d{1,5}(?:,\d{3})*(?:\.\d{2})?)/gi,
    /(\d{1,5}(?:,\d{3})*(?:\.\d{2})?)\s*(?:USD|dollars?)/gi,
    /from\s*\$([\d,]+)/gi,
    /starting at\s*\$([\d,]+)/gi
  ];

  const queryKeywords = new Set(query.toLowerCase().split(/\s+/).filter(w => w.length > 2));

  return results.flatMap(item => {
    const text = `${item.title} ${item.snippet}`;
    const url = item.link || "";
    const found = new Set<number>();

    for (const pattern of pricePatterns) {
      let match;
      while ((match = pattern.exec(text)) !== null) {
        const value = parseFloat(match[1].replace(/,/g, ""));
        if (!isNaN(value) && value >= 1 && value <= 100000) found.add(value);
      }
    }

    return Array.from(found).map(price => ({
      title: item.title,
      price,
      url,
      confidence: calculateConfidence(item, url, queryKeywords, trustedDomains, userTitle)
    }));
  });
}

/** Calculate confidence score for a given listing */
function calculateConfidence(
  item: any,
  url: string,
  keywords: Set<string>,
  trustedDomains: string[],
  userTitle?: string
): number {
  let score = 0.3;
  if (trustedDomains.some(d => url.includes(d))) score += 0.3;
  if (/\$|price/i.test(item.title)) score += 0.1;

  const resultText = `${item.title} ${item.snippet}`.toLowerCase();
  const matched = [...keywords].filter(k => resultText.includes(k)).length;
  score += Math.min(0.2, (matched / keywords.size) * 0.2);

  if (userTitle && resultText.includes(userTitle.toLowerCase())) score += 0.1;

  return Math.min(score, 1);
}

/** Remove statistical outliers using IQR */
function filterOutliers(listings: PriceListing[]): PriceListing[] {
  const prices = listings.map(l => l.price).sort((a, b) => a - b);
  if (prices.length < 4) return listings;

  const q1 = prices[Math.floor(prices.length * 0.25)];
  const q3 = prices[Math.floor(prices.length * 0.75)];
  const iqr = q3 - q1;

  const min = q1 - 1.5 * iqr;
  const max = q3 + 1.5 * iqr;

  return listings.filter(l => l.price >= min && l.price <= max)
    .sort((a, b) => b.confidence - a.confidence);
}

/** Compute avg, median, range, and confidence level */
function summarizePrices(listings: PriceListing[]) {
  const prices = listings.map(l => l.price).sort((a, b) => a - b);
  const avg = prices.reduce((a, b) => a + b, 0) / prices.length;
  const median = prices.length % 2
    ? prices[Math.floor(prices.length / 2)]
    : (prices[prices.length / 2 - 1] + prices[prices.length / 2]) / 2;

  const avgConfidence = listings.reduce((a, b) => a + b.confidence, 0) / listings.length;
  const level: 'high' | 'medium' | 'low' =
    avgConfidence > 0.7 ? 'high' : avgConfidence > 0.5 ? 'medium' : 'low';

  return {
    avgPrice: avg.toFixed(2),
    medianPrice: median.toFixed(2),
    priceRange: { min: prices[0], max: prices[prices.length - 1] },
    confidence: level
  };
}
