// ../GoogleAII/aiPriceEstimator.ts
/**
 * AI Price Estimator using Google Vision + Custom Search APIs
 * -----------------------------------------------------------
 * Extracts keywords from an image using Vision API.
 * Searches the web using Custom Search API.
 * Parses average price from results.
 */

console.log("🔑 API Key loaded?", !!import.meta.env.VITE_GOOGLE_API_KEY);
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

    // --- Step 1b: Smarter keyword extraction ---
    function buildSmartQuery(labels: string[], texts: string[]): string {
      const genericWords = [
        "Electronic device",
        "Technology",
        "Gadget",
        "Product",
        "Device",
        "Equipment",
        "Portable communications device",
        "Hardware",
        "Tool",
        "Machine",
      ];

      const specificLabels = labels.filter(
        (label) =>
          !genericWords.some((word) =>
            label.toLowerCase().includes(word.toLowerCase())
          )
      );

      const possibleBrand =
        texts.find((t) => /^[A-Z][a-zA-Z]+$/.test(t)) || "";
      const possibleModel =
        texts.find((t) => /\b\d{1,4}\b/.test(t)) || "";

      const parts = [
        possibleBrand,
        possibleModel,
        specificLabels[0] || labels[0] || "item",
      ].filter(Boolean);

      let merged = parts.join(" ").trim();

      return merged.length > 0 ? merged : "product";
    }

    const mergedQuery = buildSmartQuery(labels, texts);
    console.log("🔑 Query keyword used:", mergedQuery);

    // --- Step 2: Use Custom Search API ---
    const query = encodeURIComponent(`${mergedQuery} price`);
    const searchUrl = `https://www.googleapis.com/customsearch/v1?key=${apiKey}&cx=${searchEngineId}&q=${query}`;

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

    // --- Step 3: Extract all valid prices from all matches ---
    const allPrices: { title: string; price: number; url: string }[] = [];

    items.forEach((item: any) => {
      const combinedText = `${item.title} ${item.snippet}`;

      // Updated regex to catch more price formats
      const matches = combinedText.match(
        /(?:\$ ?|US\$ ?|USD ?)?\d{1,5}(?:,\d{3})*(?:\.\d{1,2})?(?: ?USD)?/g
      );

      if (matches) {
        matches.forEach((match) => {
          // Remove non-digit/non-dot characters like $ or USD
          const cleaned = match.replace(/[^\d.]/g, "");
          const price = parseFloat(cleaned);
          if (!isNaN(price) && price > 1 && price < 10000) {
            allPrices.push({ title: item.title, price, url: item.link });
          }
        });
      }
    });

    if (allPrices.length === 0) {
      console.warn("⚠️ No valid prices found in search results.");
      return { labels, avgPrice: null, listings: [] };
    }

    // --- Step 4: Sort prices descending and take top 5 ---
    allPrices.sort((a, b) => b.price - a.price);
    const topPrices = allPrices.slice(0, 5);

    // --- Step 5: Calculate average from top 5 ---
    const avg = topPrices.reduce((acc, x) => acc + x.price, 0) / topPrices.length;
    const avgPrice = avg.toFixed(2);

    // --- Step 6: Return top 5 items ---
    const topListings = topPrices;

    console.log("💰 Top 5 prices:", topListings, "Estimated average:", avgPrice);

    return { labels, avgPrice, listings: topListings };
  } catch (error) {
    console.error("❌ AI price estimation failed:", error);
    return { labels: [], avgPrice: null, listings: [] };
  }
}
