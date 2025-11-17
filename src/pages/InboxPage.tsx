import { useEffect, useState } from "react";
import { collection, query, orderBy, onSnapshot, doc, getDoc } from "firebase/firestore";
import { db } from "../firebase/firebase";
import { getAuth } from "firebase/auth";
import { useNavigate } from "react-router-dom";

interface ChatPreview {
  chatId: string;
  otherUserId: string;
  otherUsername: string;
  lastMessage: string;
  timestamp: any;
}

export default function InboxPage() {
  const auth = getAuth();
  const currentUser = auth.currentUser;
  const [chats, setChats] = useState<ChatPreview[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    if (!currentUser) return;

    console.log("📬 Setting up inbox listener for:", currentUser.uid);

    const userChatsRef = collection(db, "users", currentUser.uid, "chats");
    const q = query(userChatsRef, orderBy("lastUpdated", "desc"));
    
    const unsubscribe = onSnapshot(q, async (snapshot) => {
      console.log("📬 Inbox snapshot received, number of chats:", snapshot.docs.length);
      
      const chatPreviews: ChatPreview[] = [];

      for (const chatDoc of snapshot.docs) {
        const chatData = chatDoc.data();
        const chatId = chatDoc.id;
        const otherUserId = chatData.otherUserId;

        console.log("Processing chat:", chatId, "with user:", otherUserId);

        let otherUsername = otherUserId;

        try {
          const userSnap = await getDoc(doc(db, "users", otherUserId, "public", "info"));
          if (userSnap.exists()) {
            otherUsername = userSnap.data().username || otherUserId;
          }
        } catch (err) {
          console.error("Failed to fetch username:", err);
        }

        chatPreviews.push({
          chatId,
          otherUserId,
          otherUsername,
          lastMessage: chatData.lastMessage || "No messages yet",
          timestamp: chatData.lastUpdated,
        });
      }

      console.log("📬 Total chats to display:", chatPreviews.length);
      setChats(chatPreviews);
      setLoading(false);
    }, (error) => {
      console.error("❌ Inbox listener error:", error);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [currentUser]);

  if (!currentUser) {
    return <p className="p-8 text-center text-red-600">You must be logged in to view your inbox.</p>;
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#00244E] px-6 py-8">
      <div className="w-full max-w-md bg-white rounded-xl shadow-lg p-6">
        <h1 className="text-2xl font-bold mb-6 text-center text-[#00244E]">Inbox</h1>

        {loading ? (
          <p className="text-gray-500 text-center">Loading chats...</p>
        ) : chats.length === 0 ? (
          <p className="text-gray-500 text-center">No chats yet.</p>
        ) : (
          <div className="flex flex-col gap-4">
            {chats.map((chat) => (
              <button
                key={chat.chatId}
                onClick={() => navigate(`/chat/${chat.chatId}`)}
                className="flex flex-col items-start p-3 bg-[#0F3F8C] text-white rounded-lg shadow hover:shadow-xl transition"
              >
                <span className="font-medium text-lg">{chat.otherUsername}</span>
                <span className="text-gray-300 text-sm truncate w-full text-left">
                  {chat.lastMessage}
                </span>
              </button>
            ))}
          </div>
        )}

        <button
          onClick={() => navigate(`/user/${currentUser.uid}`)}
          className="w-full mt-6 py-2 rounded text-white font-semibold bg-gray-600 hover:bg-gray-700"
        >
          ← Back to Profile
        </button>
      </div>
    </div>
  );
}