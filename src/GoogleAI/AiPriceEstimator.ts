// ../GoogleAII/aiPriceEstimator.ts
/**
 * AI Price Estimator using Google Vision + Custom Search APIs
 * -----------------------------------------------------------
 * Extracts keywords from an image using Vision API.
 * Searches the web using Custom Search API.
 * Parses average price from results.
 */

console.log("🔑 API Key loaded?", !!import.meta.env.VITE_GOOGLE_API_KEY);               //debugging
console.log("🔎 Search Engine ID loaded?", !!import.meta.env.VITE_GOOGLE_SEARCH_ENGINE_ID);
console.log("VITE_GOOGLE_API_KEY:", import.meta.env.VITE_GOOGLE_API_KEY);

export async function estimatePriceFromImage(imageUrl: string): Promise<{
  labels: string[];
  avgPrice: string | null;
  listings: { title: string; price: number; url: string }[];
}> {
  console.log("🔍 Estimating price for:", imageUrl);

  try {
    const apiKey = import.meta.env.VITE_GOOGLE_API_KEY;
    const searchEngineId = import.meta.env.VITE_GOOGLE_SEARCH_ENGINE_ID;

    if (!apiKey || !searchEngineId) {
      console.error("❌ Missing API key or search engine ID in environment variables.");
      return { labels: [], avgPrice: null, listings: [] };
    }

    // --- Step 1: Get labels + text from Google Vision API ---
    const visionResponse = await fetch(
      `https://vision.googleapis.com/v1/images:annotate?key=${apiKey}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          requests: [
            {
              image: { source: { imageUri: imageUrl } },
              features: [
                { type: "LABEL_DETECTION", maxResults: 5 },
                { type: "TEXT_DETECTION", maxResults: 5 },
              ],
            },
          ],
        }),
      }
    );

    if (!visionResponse.ok) {
      const err = await visionResponse.text();
      console.error("❌ Vision API failed:", err);
      return { labels: [], avgPrice: null, listings: [] };
    }

    const visionData = await visionResponse.json();
    const labels: string[] =
      visionData.responses?.[0]?.labelAnnotations?.map((x: any) => x.description) || [];
    const texts: string[] =
      visionData.responses?.[0]?.textAnnotations?.map((x: any) => x.description) || [];

    console.log("🧩 Labels detected:", labels, "Text detected:", texts);

    if (labels.length === 0 && texts.length === 0) {
      console.warn("⚠️ No labels or text detected for image.");
      return { labels, avgPrice: null, listings: [] };
    }

    // --- Step 1b: Prioritize short text (brand/slogan) ---
    const shortText = texts.find(t => t.length <= 10); // short text likely brand
    const topLabel = labels[0] || "item";
    const mergedQuery = shortText
      ? `${shortText} (${topLabel})`
      : texts[0]
      ? `${texts[0]} (${topLabel})`
      : topLabel;

    console.log("🔑 Query keyword used:", mergedQuery);

    // --- Step 2: Use Custom Search API ---
    const query = encodeURIComponent(mergedQuery);
    const searchUrl = `https://www.googleapis.com/customsearch/v1?key=${apiKey}&cx=${searchEngineId}&q=${query}+price`;

    console.log("🌐 Searching web for:", decodeURIComponent(query));

    const searchResponse = await fetch(searchUrl);
    if (!searchResponse.ok) {
      const err = await searchResponse.text();
      console.error("❌ Search API failed:", err);
      return { labels, avgPrice: null, listings: [] };
    }

    const searchData = await searchResponse.json();
    const items = searchData.items || [];
    console.log("🔎 Found", items.length, "search results");

    if (items.length === 0) {
      console.warn("⚠️ No search results found for query:", mergedQuery);
      return { labels, avgPrice: null, listings: [] };
    }

    // --- Step 3: Extract valid prices and track contributing items ---
    const itemsWithPrices: { title: string; price: number; url: string }[] = [];

    const prices: number[] = items
      .map((item: any) => {
        const combinedText = `${item.title} ${item.snippet}`;
        const matches = combinedText.match(/\$\d+(?:\.\d{1,2})?/g);
        if (matches && matches.length > 0) {
          const price = parseFloat(matches[0].replace("$", ""));
          if (!isNaN(price) && price > 1 && price < 10000) {
            itemsWithPrices.push({ title: item.title, price, url: item.link });
            return price;
          }
        }
        return null;
      })
      .filter((n: number | null): n is number => n !== null); // Type guard

    console.log("💰 Extracted prices:", prices);

    if (prices.length === 0) {
      console.warn("⚠️ No valid prices found in search results.");
      return { labels, avgPrice: null, listings: [] };
    }

    // --- Step 4: Calculate average ---
    const avg: number = prices.reduce((acc: number, val: number) => acc + val, 0) / prices.length;
    const avgPrice = avg.toFixed(2);

    // --- Step 5: Return top 5 items that contributed to the average ---
    const topListings = itemsWithPrices.slice(0, 5);

    console.log("✅ Estimated average price:", avgPrice, "Top listings:", topListings);

    return { labels, avgPrice, listings: topListings };
  } catch (error) {
    console.error("❌ AI price estimation failed:", error);
    return { labels: [], avgPrice: null, listings: [] };
  }
}