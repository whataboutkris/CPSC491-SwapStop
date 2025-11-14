import { useLocation, useNavigate } from "react-router-dom";
import { useState } from "react";
import { addDoc, collection, serverTimestamp } from "firebase/firestore";
import { db } from "../firebase/firebase";
import { getAuth } from "firebase/auth";

export default function TradeOfferPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const currentUser = getAuth().currentUser;
  const listing = location.state?.item;

  const [title, setTitle] = useState(listing?.title || "");
  const [condition, setCondition] = useState("");
  const [price, setPrice] = useState("");
  const [image, setImage] = useState<File | null>(null);

  const handleTradeSubmit = async () => {
    if (!listing || !currentUser) return;

    // Add trade request to notifications
    await addDoc(collection(db, "notifications"), {
      userId: listing.ownerId,
      message: `${currentUser.displayName || "Someone"} wants to trade "${title}" (Condition: ${condition}) for your "${listing.title}"`,
      tradeDetails: { title, condition, price, imageUrl: image ? URL.createObjectURL(image) : null },
      read: false,
      createdAt: serverTimestamp(),
    });

    alert("Trade request sent!");
    navigate(-1); // Go back to listings
  };

  return (
    <div className="p-6 max-w-lg mx-auto">
      <h1 className="text-2xl font-bold mb-4">Trade Offer for: {listing?.title}</h1>
      <div className="space-y-4">
        <input
          type="text"
          placeholder="Title of your item"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="w-full border p-2 rounded"
        />
        <input
          type="text"
          placeholder="Condition"
          value={condition}
          onChange={(e) => setCondition(e.target.value)}
          className="w-full border p-2 rounded"
        />
        <input
          type="number"
          placeholder="Price (optional)"
          value={price}
          onChange={(e) => setPrice(e.target.value)}
          className="w-full border p-2 rounded"
        />
        <input
          type="file"
          onChange={(e) => setImage(e.target.files?.[0] || null)}
          className="w-full border p-2 rounded"
        />
        <button
          onClick={handleTradeSubmit}
          className="bg-blue-600 text-white px-4 py-2 rounded-xl hover:bg-blue-700 transition w-full"
        >
          Send Trade Request
        </button>
      </div>
    </div>
  );
}
