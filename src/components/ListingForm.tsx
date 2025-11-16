import { useState } from "react";
import { db, storage } from "../firebase/firebase";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { Button } from "./ui/button";
import { getAuth } from "firebase/auth";
import { estimatePriceFromImage } from "../GoogleAI/AiPriceEstimator";

interface ListingFormProps {
  onSuccess?: () => void;
}

interface PriceListing {
  title: string;
  price: number;
  url: string;
  confidence: number;
}

export default function ListingForm({ onSuccess }: ListingFormProps) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [type, setType] = useState("sell");
  const [brand, setBrand] = useState("");
  const [images, setImages] = useState<FileList | null>(null);
  const [loading, setLoading] = useState(false);
  const [estimating, setEstimating] = useState(false);
  const [estimatedPrice, setEstimatedPrice] = useState<string | null>(null);
  const [confidence, setConfidence] = useState<string | null>(null);
  const [topResults, setTopResults] = useState<PriceListing[]>([]);

  const auth = getAuth();
  const currentUser = auth.currentUser;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) {
      alert("You must be logged in to create a listing.");
      return;
    }
    setLoading(true);

    try {
      let imageUrls: string[] = [];
      if (images && images.length > 0) {
        const uploadPromises = Array.from(images).map(async (image) => {
          const storageRef = ref(
            storage,
            `listings/${currentUser.uid}/${Date.now()}-${image.name}`
          );
          await uploadBytes(storageRef, image);
          return await getDownloadURL(storageRef);
        });
        imageUrls = await Promise.all(uploadPromises);
      }

      await addDoc(collection(db, "listings"), {
        title,
        description,
        price: parseFloat(price),
        type,
        brand,
        images: imageUrls,
        createdAt: serverTimestamp(),
        ownerId: currentUser.uid,
        ownerEmail: currentUser.email,
        ownerName: currentUser.displayName || "Unknown User",
      });

      alert("✅ Listing created successfully!");
      setTitle("");
      setDescription("");
      setPrice("");
      setType("sell");
      setBrand("");
      setImages(null);
      setEstimatedPrice(null);
      setConfidence(null);
      setTopResults([]);

      const fileInput = document.querySelector<HTMLInputElement>('input[type="file"]');
      if (fileInput) fileInput.value = "";
      if (onSuccess) onSuccess();
    } catch (error) {
      console.error("Error adding listing:", error);
      alert("❌ Failed to create listing. Check console for details.");
    } finally {
      setLoading(false);
    }
  };

  // 🔍 AI price estimation
  const handleEstimatePrice = async () => {
    if (!title) {
      alert("Please enter a title so we know what to search for!");
      return;
    }
    if (!images || images.length === 0) {
      alert("Please upload at least one image first!");
      return;
    }

    setEstimating(true);
    setEstimatedPrice(null);
    setConfidence(null);
    setTopResults([]);

    try {
      const firstImage = images[0];
      const localUrl = URL.createObjectURL(firstImage);
      const result = await estimatePriceFromImage(localUrl, title);

      if (result.avgPrice) {
        setEstimatedPrice(result.avgPrice);
        setConfidence(result.confidence);
        setTopResults(result.listings.slice(0, 3)); // ✅ Top 3 listings
      } else {
        setEstimatedPrice("N/A");
        setConfidence("low");
      }
    } catch (err) {
      console.error("❌ Failed to estimate price:", err);
      alert("Could not estimate price. Try again or check your API keys.");
    } finally {
      setEstimating(false);
    }
  };

  return (

    <form
      data-testid="listing-form"
      onSubmit={handleSubmit}
      className= "bg-white shadow-md rounded-2xl p-6 space-y-4 max-w-lg mx-auto "
    >
      <h2 className="text-2xl font-bold mb-4">Create a Listing</h2>

      <input
        type="text"
        placeholder="Title"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        className="w-full border p-2 rounded"
        required
      />

      <textarea
        placeholder="Description"
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        className="w-full border p-2 rounded"
        rows={3}
        required
      />

      <div className="space-y-2">
        <input
          type="text"
          placeholder="Price"
          value={price}
          onChange={(e) => setPrice(e.target.value)}
          className="w-full border p-2 rounded"
          required
        />

        {/* 💰 Fun AI Estimator Button */}
        <Button
          type="button"
          onClick={handleEstimatePrice}
          disabled={estimating}
          className="w-full bg-gradient-to-r from-amber-400 to-yellow-500 hover:from-yellow-500 hover:to-amber-600 text-white font-semibold transition-transform transform hover:scale-105"
        >
          {estimating ? "🔍 Estimating..." : "💰 Find out what your item is worth!"}
        </Button>

        {/* 🧠 AI Estimate Results */}
        {estimatedPrice && (
          <div className="text-center text-sm mt-2 text-gray-700">
            <p>
              Estimated Price:{" "}
              <span className="font-bold text-green-600">
                ${estimatedPrice}
              </span>{" "}
              ({confidence} confidence)
            </p>

            {topResults.length > 0 && (
              <div className="mt-3 border-t pt-2 text-left">
                <p className="font-semibold text-gray-800 mb-1">
                  Top Similar Listings:
                </p>
                <ul className="space-y-1 text-sm">
                  {topResults.map((item, idx) => (
                    <li key={idx} className="p-2 bg-gray-50 rounded-lg border">
                      <a
                        href={item.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:underline"
                      >
                        {item.title}
                      </a>
                      <p className="text-gray-600">
                        💲{item.price.toFixed(2)} — Confidence:{" "}
                        {(item.confidence * 100).toFixed(0)}%
                      </p>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}
      </div>

      <select
        value={type}
        onChange={(e) => setType(e.target.value)}
        className="w-full border p-2 rounded"
      >
        <option value="sell">Sell</option>
        <option value="trade">Trade</option>
      </select>

      <input
        type="text"
        placeholder="Brand"
        value={brand}
        onChange={(e) => setBrand(e.target.value)}
        className="w-full border p-2 rounded"
      />

      <input
        type="file"
        multiple
        onChange={(e) => setImages(e.target.files)}
        className="w-full border p-2 rounded"
        accept="image/*"
        required
      />

      <Button
        type="submit"
        className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold"
        disabled={loading}
      >
        {loading ? "Uploading..." : "Create Listing"}
      </Button>
    </form>
  );
}
