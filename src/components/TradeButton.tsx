import { useEffect, useState } from "react";
import { collection, query, where, getDocs, addDoc } from "firebase/firestore";
import { db } from "../firebase/firebase";

interface TradeButtonProps {
  listingId: string;
  ownerId: string;
  currentUserId: string;
}

export default function TradeButton({ listingId, ownerId, currentUserId }: TradeButtonProps) {
  const [hasPending, setHasPending] = useState(false);

  useEffect(() => {
    const checkPending = async () => {
      const q = query(
        collection(db, "tradeRequests"),
        where("listingId", "==", listingId),
        where("fromUserId", "==", currentUserId),
        where("status", "==", "pending")
      );
      const snapshot = await getDocs(q);
      setHasPending(!snapshot.empty);
    };
    checkPending();
  }, [listingId, currentUserId]);

  const handleTrade = async () => {
    try {
      // Add trade request
      await addDoc(collection(db, "tradeRequests"), {
        listingId,
        fromUserId: currentUserId,
        toUserId: ownerId,
        timestamp: new Date(),
        status: "pending",
      });

      // Add notification for owner
      await addDoc(collection(db, "notifications"), {
        userId: ownerId,
        fromUserId: currentUserId,
        listingId,
        type: "tradeRequest",
        message: "You have a new trade request!",
        read: false,
        timestamp: new Date(),
      });

      setHasPending(true);
      alert("✅ Trade request sent!");
    } catch (err) {
      console.error(err);
      alert("❌ Failed to send trade request.");
    }
  };

  return (
    <button
      onClick={handleTrade}
      disabled={hasPending}
      className={`px-4 py-2 rounded-xl transition ${
        hasPending ? "bg-gray-400 text-gray-700" : "bg-green-500 text-white hover:bg-green-600"
      }`}
    >
      {hasPending ? "Trade Pending" : "Request Trade"}
    </button>
  );
}
